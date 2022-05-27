import {
    InventoryCount,
    InventoryCountLine,
    Product,
} from '@pos/shared/models';
import { Dispatch } from '@reduxjs/toolkit';
import { DataStore } from 'aws-amplify';
import { inventoryCountActions } from './inventory-count.slice';
import {
    InventoryCountDTO,
    InventoryCountMapper,
} from './inventory-count.entity';
import { ZenObservable } from 'zen-observable-ts';
import { DatesService } from '@pos/shared/utils';
import { Alert } from 'react-native';

export class InventoryCountService {
    static async save(
        dispatch: Dispatch<any>,
        count: InventoryCountDTO,
        updateInv: boolean
    ) {
        if (!count.id) {
            await createCount(count, dispatch);
        } else {
            await updateCount(count, dispatch);
        }

        if (!updateInv) return;

        await updateInventory(count);

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

export let icSubscription: ZenObservable.Subscription | null;
export let iclSubscription: ZenObservable.Subscription | null;

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
    return dispatch(inventoryCountActions.add(count));
}

async function updateCount(count: InventoryCountDTO, dispatch: Dispatch<any>) {
    if (!count.id) return;

    const existing = await DataStore.query(InventoryCount, count.id);

    if (!existing) {
        return console.log(
            `It seems that inventory: ${count.id} has been removed`
        );
    }

    await DataStore.save(
        InventoryCount.copyOf(existing, (updated) => {
            updated.comments = count.comments;
            updated.status = 'IN_PROGRESS';
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

    return dispatch(
        inventoryCountActions.update({ id: count.id, changes: count })
    );
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
                updated.quantity = l.newCount - l.current;
            }))
        }
    } catch (error) {
        Alert.alert('Error while updating inventory', (error as any).message);
    }
}

export function observeInventoryCountChanges(dispatch: Dispatch) {
    const sevenDaysAgo = DatesService.daysAgo(365);
    const isoDate = DatesService.toISO8601(sevenDaysAgo);

    if (icSubscription) {
        icSubscription.unsubscribe();
        icSubscription = null;
    }

    icSubscription = DataStore.observeQuery(InventoryCount, (o) =>
        o.createdAt('gt', isoDate)
    ).subscribe(({ isSynced, items }) => {
        if (isSynced) {
            dispatch(
                inventoryCountActions.setAll(
                    items.map((i) => InventoryCountMapper.fromModel(i, []))
                )
            );
        }
    });

    if (iclSubscription) {
        iclSubscription.unsubscribe();
        iclSubscription = null;
    }

    iclSubscription = DataStore.observeQuery(InventoryCountLine, (o) =>
        o.createdAt('gt', isoDate)
    ).subscribe(({ isSynced, items }) => {
        if (isSynced) {
            dispatch(
                inventoryCountActions.setLines(
                    items.map((i) => InventoryCountMapper.fromLine(i))
                )
            );
        }
    });
}
