import {
    InventoryReceive,
    InventoryReceiveLine,
    Product,
} from '@pos/shared/models';
import { Dispatch } from '@reduxjs/toolkit';
import { DataStore } from '@pos/shared/amplify';
import { inventoryReceiveActions } from './inventory-receive.slice';
import { InventoryReceiveDTO } from './inventory-receive.entity';
import { Alert } from 'react-native';
import { requireCurrentTenantId, stampTenant } from '@pos/auth/data-access';

const isInventoryDebugEnabled = () =>
    typeof __DEV__ !== 'undefined' && __DEV__;

const debugInventoryApply = (context: string, payload: Record<string, unknown>) => {
    if (!isInventoryDebugEnabled()) return;
    console.log(`[inventory-debug][${context}]`, payload);
};

export class InventoryReceiveService {
    static async save(
        dispatch: Dispatch<any>,
        item: InventoryReceiveDTO,
        updateInv: boolean
    ) {
        if (!item.id) {
            await createReceive(item, dispatch);
        } else {
            await updateReceive(item, dispatch);
        }

        if (!updateInv) return;

        await updateInventory(item);
    }

    static getAll() {
        return DataStore.query(InventoryReceive);
    }

    static async delete(id: string) {
        const item = await DataStore.query(InventoryReceive, id);
        if (!item)
            return console.error(`Inventory received id: ${id} not found`);

        const lines = DataStore.query(InventoryReceiveLine, (l) =>
            l.inventoryReceiveLineInventoryReceiveId.eq(item.id)
        );

        (await lines).forEach(l => DataStore.delete(l));

        return DataStore.delete(item);
    }
}

async function createReceive(count: InventoryReceiveDTO, dispatch: Dispatch<any>) {
    const { lines, ...rest } = count;
    const entity = new InventoryReceive(stampTenant({
        comments: rest.comments,
        status: rest.status,
        createdBy: {
            id: rest.createdBy?.id || '',
            name: rest.createdBy?.name || '',
        },
    }) as never);
    const res = await DataStore.save(entity);
    count.id = res.id;

    const promises = lines.map((l) => {
        l.inventoryReceiveLineInventoryReceiveId = res.id;
        return DataStore.save(
            new InventoryReceiveLine({
                tenantId: requireCurrentTenantId(),
                productId: l.productId,
                productName: l.productName,
                unitOfMeasure: l.unitOfMeasure,
                received: l.received,
                comments: l.comments,
                inventoryReceiveLineInventoryReceiveId: res.id,
            } as never)
        );
    });

    await Promise.all(promises);
    return dispatch(inventoryReceiveActions.add(count));
}

async function updateReceive(receive: InventoryReceiveDTO, dispatch: Dispatch<any>) {
    if (!receive.id) return;

    const existing = await DataStore.query(InventoryReceive, receive.id);

    if (!existing) {
        return console.log(
            `It seems that inventory receive: ${receive.id} has been removed`
        );
    }

    await DataStore.save(
        InventoryReceive.copyOf(existing, (updated) => {
            updated.comments = receive.comments;
            updated.status = receive.status;
        })
    );

    const lineUpdates = receive.lines?.map(async (l) => {
        if (!l.id) {
            await DataStore.save(
                new InventoryReceiveLine({
                    tenantId: requireCurrentTenantId(),
                    productId: l.productId,
                    productName: l.productName,
                    unitOfMeasure: l.unitOfMeasure,
                    received: l.received,
                    comments: l.comments,
                    inventoryReceiveLineInventoryReceiveId: existing.id,
                } as never)
            );
            return;
        }

        const line = await DataStore.query(InventoryReceiveLine, (c) =>
            c.id.eq(l.id!)
        );

        if (line.length === 0) {
            console.error('Inventory received Line not found for: ' + l.id);
            return;
        }

        await DataStore.save(
            InventoryReceiveLine.copyOf(line[0], (updated) => {
                updated.received = l.received;
                updated.comments = l.comments;
            })
        );
    }) || [];

    await Promise.all(lineUpdates);

    return dispatch(
        inventoryReceiveActions.update({ id: receive.id, changes: receive })
    );
}

const updateInventory = async (count: InventoryReceiveDTO) => {
    try {
        const receivedByProductId = new Map<string, number>();
        count.lines.forEach((line) => {
            if (
                line.received === undefined ||
                line.received === null ||
                Number.isNaN(line.received)
            ) {
                return;
            }

            receivedByProductId.set(
                line.productId,
                (receivedByProductId.get(line.productId) || 0) + line.received
            );
        });

        for (const [productId, received] of receivedByProductId.entries()) {
            const productLine = count.lines.find((line) => line.productId === productId);
            const product = await DataStore.query(Product, productId);

            if (!product) {
                Alert.alert(
                    'Error',
                    `Product ${productLine?.productName || productId} was not found while updating the inventory`
                );
                continue;
            }

            if (received === undefined || received === null || Number.isNaN(received)) {
                continue;
            }

            if (received !== 0) {
                debugInventoryApply('receive', {
                    productId,
                    productName: productLine?.productName,
                    quantityBefore: product.quantity || 0,
                    delta: received,
                    quantityExpectedAfter: (product.quantity || 0) + received,
                    receiveId: count.id || 'new-receive',
                });

                await DataStore.save(
                    Product.copyOf(product, (updated) => {
                        // Product quantity is handled as delta by AppSync resolver.
                        updated.quantity = received;
                    })
                );
            }
        }
    } catch (error) {
        Alert.alert('Error while updating inventory received', (error as any).message);
    }
};
