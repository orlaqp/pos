import {
    InventoryReceive,
    InventoryReceiveLine,
    Product,
} from '@pos/shared/models';
import { Dispatch } from '@reduxjs/toolkit';
import { DataStore } from 'aws-amplify';
import { inventoryReceiveActions } from './inventory-receive.slice';
import {
    InventoryReceiveDTO,
    InventoryReceiveMapper,
} from './inventory-receive.entity';
import { ZenObservable } from 'zen-observable-ts';
import { DatesService } from '@pos/shared/utils';
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

            await DataStore.save(
                Product.copyOf(p[0], (updated) => {
                    updated.quantity = l.received;
                })
            );
        }
    } catch (error) {
        Alert.alert('Error while updating inventory received', (error as any).message);
    }
};

export let irSubscription: ZenObservable.Subscription | null;
export let irlSubscription: ZenObservable.Subscription | null;

export function observeInventoryReceiveChanges(dispatch: Dispatch) {
    const sevenDaysAgo = DatesService.daysAgo(365);
    const isoDate = DatesService.toISO8601(sevenDaysAgo);

    if (irSubscription) {
        irSubscription.unsubscribe();
        irSubscription = null;
    }

    irSubscription = DataStore.observeQuery(InventoryReceive, (o) =>
        o.createdAt('gt', isoDate)
    ).subscribe(({ isSynced, items }) => {
        if (isSynced) {
            dispatch(
                inventoryReceiveActions.setAll(
                    items.map((i) => InventoryReceiveMapper.fromModel(i, []))
                )
            );
        }
    });

    if (irlSubscription) {
        irlSubscription.unsubscribe();
        irlSubscription = null;
    }

    irlSubscription = DataStore.observeQuery(InventoryReceiveLine, (o) =>
        o.createdAt('gt', isoDate)
    ).subscribe(({ isSynced, items }) => {
        if (isSynced) {
            dispatch(
                inventoryReceiveActions.setLines(
                    items.map((i) => InventoryReceiveMapper.fromLine(i))
                )
            );
        }
    });
}
