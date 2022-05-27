import {
    InventoryCount,
    InventoryCountLine,
    Product,
} from '@pos/shared/models';
import { Dispatch } from '@reduxjs/toolkit';
import { DataStore } from 'aws-amplify';
import { inventoryCountActions } from './slices/inventory-count.slice';
import {
    InventoryCountDTO,
    InventoryCountMapper,
} from './inventory-count.entity';
import { ZenObservable } from 'zen-observable-ts';
import { DatesService } from '@pos/shared/utils';

export class InventoryCountService {
    static async save(dispatch: Dispatch<any>, count: InventoryCountDTO) {
        if (!count.id) {
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
                    console.error(
                        'Inventory Count Line not found for: ' + l.id
                    );
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

    static getAll() {
        return DataStore.query(InventoryCount);
    }

    static async delete(id: string) {
        const item = await DataStore.query(InventoryCount, id);
        if (!item) return console.error(`Inventory Id: ${id} not found`);

        // TODO: Do any extra cleanup here like for example remove image
        // if (item.picture)
        //     AssetsService.deleteAsset(item.picture);

        return DataStore.delete(item);
    }
}

export let icSubscription: ZenObservable.Subscription | null;
export let iclSubscription: ZenObservable.Subscription | null;

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
