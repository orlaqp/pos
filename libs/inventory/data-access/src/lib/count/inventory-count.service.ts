import {
    InventoryCount,
    InventoryCountLine,
    Product,
} from '@pos/shared/models';
import { Dispatch } from '@reduxjs/toolkit';
import { DataStore } from 'aws-amplify';
import { inventoryCountActions } from './inventory-count.slice';
import { InventoryCountDTO } from './inventory-count.entity';
import { Alert } from 'react-native';

const isInventoryDebugEnabled = () =>
    typeof __DEV__ !== 'undefined' && __DEV__;

const debugInventoryApply = (context: string, payload: Record<string, unknown>) => {
    if (!isInventoryDebugEnabled()) return;
    console.log(`[inventory-debug][${context}]`, payload);
};

export class InventoryCountService {
    static async save(
        dispatch: Dispatch<any>,
        count: InventoryCountDTO,
        updateInv: boolean
    ) {
        let updatedCount: InventoryCountDTO | null;
        if (!count.id) {
            updatedCount = await createCount(count, dispatch);
        } else {
            updatedCount = await updateCount(count, dispatch);
        }

        if (!updateInv || !updatedCount) return;

        await updateInventory(updatedCount);
    }

    static getAll() {
        return DataStore.query(InventoryCount);
    }

    static async delete(id: string) {
        const item = await DataStore.query(InventoryCount, id);
        if (!item) return console.error(`Inventory Id: ${id} not found`);

        const lines = DataStore.query(InventoryCountLine, (l) =>
            l.inventoryCountLineInventoryCountId('eq', item.id)
        );

        (await lines).forEach(l => DataStore.delete(l));

        return DataStore.delete(item);
    }
}

async function createCount(count: InventoryCountDTO, dispatch: Dispatch<any>) {
    const { lines, ...rest } = count;
    const entity = new InventoryCount(rest);
    const res = await DataStore.save(entity);
    count.id = res.id;

    const promises = lines.map((l) => {
        l.inventoryCountLineInventoryCountId = count.id;
        return DataStore.save(new InventoryCountLine(l));
    });

    await Promise.all(promises);
    dispatch(inventoryCountActions.add(count));

    return count;
}

async function updateCount(count: InventoryCountDTO, dispatch: Dispatch<any>) {
    if (!count.id) return null;

    const existing = await DataStore.query(InventoryCount, count.id);

    if (!existing) {
        console.log(
            `It seems that inventory: ${count.id} has been removed`
        );

        return null;
    }

    await DataStore.save(
        InventoryCount.copyOf(existing, (updated) => {
            updated.comments = count.comments;
            updated.status = count.status;
        })
    );

    const lineUpdates = count.lines?.map(async (l) => {
        if (!l.id) {
            await DataStore.save(
                new InventoryCountLine({
                    ...l,
                    inventoryCountLineInventoryCountId: existing.id,
                })
            );
            return;
        }

        const line = await DataStore.query(InventoryCountLine, (c) =>
            c.id('eq', l.id!)
        );

        if (line.length === 0) {
            console.error('Inventory Count Line not found for: ' + l.id);
            return;
        }

        await DataStore.save(
            InventoryCountLine.copyOf(line[0], (updated) => {
                updated.newCount = l.newCount;
                updated.comments = l.comments;
            })
        );
    }) || [];

    await Promise.all(lineUpdates);

    dispatch(
        inventoryCountActions.update({ id: count.id, changes: count })
    );

    return count;
}

const updateInventory = async (count: InventoryCountDTO) => {
    try {
        for (let i = 0; i < count.lines.length; i++) {
            const l = count.lines[i];
            const product = await DataStore.query(Product, l.productId);

            if (!product) {
                Alert.alert('Error', `Product ${l.productName} was not found while updating the inventory`);
                continue;
            }

            if (l.newCount === undefined || l.newCount === null) {
                continue;
            }

            const delta = l.newCount! - (product.quantity || 0);
            if (delta === 0) {
                continue;
            }

            debugInventoryApply('count', {
                productId: l.productId,
                productName: l.productName,
                quantityBefore: product.quantity || 0,
                countedQuantity: l.newCount,
                delta,
                quantityExpectedAfter: (product.quantity || 0) + delta,
                countId: count.id || 'new-count',
            });

            const updatedProduct = Product.copyOf(product, updated => {
                // Product quantity is handled as delta by AppSync resolver.
                updated.quantity = delta;
            });
            await DataStore.save(updatedProduct);
        }
    } catch (error) {
        Alert.alert('Error while updating inventory', (error as any).message);
    }
}
