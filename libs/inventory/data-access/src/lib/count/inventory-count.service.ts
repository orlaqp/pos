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

        if (!updateInv || !updateCount) return;

        await updateInventory(updatedCount!);

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

    count.lines?.forEach(async (l) => {
        if (!l.id) {
            DataStore.save(
                new InventoryCountLine({
                    ...l,
                    inventoryCountLineInventoryCountId: existing.id,
                })
            );
        } else {
            const line = await DataStore.query(InventoryCountLine, (c) =>
                c.id('eq', l.id!)
            );

            if (line.length === 0) {
                console.error('Inventory Count Line not found for: ' + l.id);
                return;
            }

            DataStore.save(
                InventoryCountLine.copyOf(line[0], (updated) => {
                    updated.newCount = l.newCount;
                    updated.comments = l.comments;
                })
            );
        }
    });

    dispatch(
        inventoryCountActions.update({ id: count.id, changes: count })
    );

    return count;
}

const updateInventory = async (count: InventoryCountDTO) => {
    try {
        for (let i = 0; i < count.lines.length; i++) {
            const l = count.lines[i];
            const p = await DataStore.query(Product, p => p.id('eq', l.productId));

            if (!p.length) {
                Alert.alert('Error', `Product ${l.productName} was not found while updating the inventory`);
            }

            await DataStore.save(Product.copyOf(p[0], updated => {
                updated.quantity = l.newCount! - l.current;
            }))
        }
    } catch (error) {
        Alert.alert('Error while updating inventory', (error as any).message);
    }
}
