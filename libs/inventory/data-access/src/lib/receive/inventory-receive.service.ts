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

    receive.lines?.forEach(async (l) => {
        if (!l.id) {
            DataStore.save(
                new InventoryReceiveLine({
                    ...l,
                    inventoryReceiveLineInventoryReceiveId: existing.id,
                })
            );
        } else {
            const line = await DataStore.query(InventoryReceiveLine, (c) =>
                c.id('eq', l.id!)
            );

            if (line.length === 0) {
                console.error('Inventory received Line not found for: ' + l.id);
                return;
            }

            DataStore.save(
                InventoryReceiveLine.copyOf(line[0], (updated) => {
                    updated.received = l.received;
                    updated.comments = l.comments;
                })
            );
        }
    });

    return dispatch(
        inventoryReceiveActions.update({ id: receive.id, changes: receive })
    );
}

const updateInventory = async (count: InventoryReceiveDTO) => {
    try {
        for (let i = 0; i < count.lines.length; i++) {
            const l = count.lines[i];
            const p = await DataStore.query(Product, (p) =>
                p.id('eq', l.productId)
            );

            if (!p.length) {
                Alert.alert(
                    'Error',
                    `Product ${l.productName} was not found while updating the inventory`
                );
            }
            
            if (p[0].quantity !== l.received)
                return await DataStore.save(
                    Product.copyOf(p[0], (updated) => {
                        updated.quantity = l.received;
                    })
                );

            
            const halfQuantity = +((l.received / 2).toFixed(2));
            await DataStore.save(Product.copyOf(p[0], (updated) => { updated.quantity = halfQuantity }));

            const subs = DataStore.observeQuery(Product, (prod) => prod.id('eq', p[0].id))
                .subscribe(async res => {
                    const newProd = res.items[0];
                    console.log('*********************** prod received', newProd);
                    if (
                        (newProd as any)._version === (p[0] as any)._version
                     || newProd.quantity === halfQuantity
                    ) return;

                    console.log('Saving the other half');
                    
                    await DataStore.save(Product.copyOf(newProd, (updated) => { updated.quantity = halfQuantity }));
                    subs.unsubscribe();
                })

            // console.log('====================================');
            // console.log(`Half quantity: ${halfQuantity}`);
            // console.log('====================================');
            // setTimeout(() => {
            //     DataStore.save(Product.copyOf(res, (updated) => { updated.quantity = halfQuantity }));
            // }, 2000);    
                
            
        }
    } catch (error) {
        Alert.alert('Error while updating inventory received', (error as any).message);
    }
};
