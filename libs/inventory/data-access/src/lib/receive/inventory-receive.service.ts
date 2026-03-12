import {
    InventoryReceive,
    InventoryReceiveLine,
    Product,
} from '@pos/shared/models';
import { Dispatch } from '@reduxjs/toolkit';
import { DataStore } from 'aws-amplify';
import { inventoryReceiveActions } from './inventory-receive.slice';
import { InventoryReceiveDTO } from './inventory-receive.entity';
import { Alert } from 'react-native';

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
            l.inventoryReceiveLineInventoryReceiveId('eq', item.id)
        );

        (await lines).forEach(l => DataStore.delete(l));

        return DataStore.delete(item);
    }
}

async function createReceive(count: InventoryReceiveDTO, dispatch: Dispatch<any>) {
    const { lines, ...rest } = count;
    const entity = new InventoryReceive(rest);
    const res = await DataStore.save(entity);
    count.id = res.id;

    const promises = lines.map((l) => {
        l.inventoryReceiveLineInventoryReceiveId = res.id;
        return DataStore.save(new InventoryReceiveLine(l));
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
                    ...l,
                    inventoryReceiveLineInventoryReceiveId: existing.id,
                })
            );
            return;
        }

        const line = await DataStore.query(InventoryReceiveLine, (c) =>
            c.id('eq', l.id!)
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
        for (let i = 0; i < count.lines.length; i++) {
            const l = count.lines[i];
            const product = await DataStore.query(Product, l.productId);

            if (!product) {
                Alert.alert(
                    'Error',
                    `Product ${l.productName} was not found while updating the inventory`
                );
                continue;
            }
            
            if (product.quantity !== l.received) {
                await DataStore.save(
                    Product.copyOf(product, (updated) => {
                        updated.quantity = l.received;
                    })
                );
            }
        }
    } catch (error) {
        Alert.alert('Error while updating inventory received', (error as any).message);
    }
};
