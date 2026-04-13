import { sortListBy } from '@pos/shared/utils';
import { DataStore } from '@pos/shared/amplify';
import { Dispatch } from '@reduxjs/toolkit';
import { UnitOfMeasure } from '@pos/shared/models';
import { unitOfMeasuresActions } from './slices/unit-of-measures.slice';
import { UnitOfMeasureEntityMapper } from './unit-of-measure.entity';

const UNIT_OF_MEASURE_SYNC_MODEL = 'unitOfMeasures';
const unitOfMeasureDispatchRefs = new Map<Dispatch, number>();
let sharedUnitOfMeasureSubscription:
    | {
          unsubscribe: () => void;
      }
    | undefined;
let unitOfMeasureSnapshot: UnitOfMeasure[] = [];

const getSubscriberCount = () => {
    let count = 0;
    unitOfMeasureDispatchRefs.forEach((dispatchCount) => {
        count += dispatchCount;
    });
    return count;
};

type SyncHealthChanges = {
    status?: 'idle' | 'subscribing' | 'healthy' | 'stale' | 'recovering' | 'error';
    subscriberCount?: number;
};

const updateSyncHealthAction = (model: string, changes: SyncHealthChanges) => ({
    type: 'events/updateSyncHealth',
    payload: {
        model,
        changes,
    },
});

const clearSyncHealthAction = (model?: string) => ({
    type: 'events/clearSyncHealth',
    payload: model ? { model } : undefined,
});

const updateSyncHealth = (dispatch: Dispatch) => {
    dispatch(
        updateSyncHealthAction(UNIT_OF_MEASURE_SYNC_MODEL, {
            status: sharedUnitOfMeasureSubscription ? 'healthy' : 'subscribing',
            subscriberCount: getSubscriberCount(),
        })
    );
};

export const syncUnitOfMeasures = (dispatch: Dispatch) => {
    const subscription = DataStore.observeQuery(UnitOfMeasure).subscribe(({ items }) => {
        updateStore(dispatch, items);
        subscription.unsubscribe();
    });
};

export const subscribeToUnitOfMeasureChanges = (dispatch: Dispatch) => {
    const currentCount = unitOfMeasureDispatchRefs.get(dispatch) || 0;
    unitOfMeasureDispatchRefs.set(dispatch, currentCount + 1);

    if (!sharedUnitOfMeasureSubscription) {
        const subscription = DataStore.observeQuery(UnitOfMeasure).subscribe(
            ({ isSynced, items }) => {
                void isSynced;
                unitOfMeasureSnapshot = items;
                unitOfMeasureDispatchRefs.forEach((_, activeDispatch) => {
                    updateStore(activeDispatch, items);
                });
            }
        );

        sharedUnitOfMeasureSubscription = {
            unsubscribe() {
                subscription.unsubscribe();
                unitOfMeasureSnapshot = [];
                sharedUnitOfMeasureSubscription = undefined;
            },
        };
    } else if (unitOfMeasureSnapshot.length > 0) {
        updateStore(dispatch, unitOfMeasureSnapshot);
    }

    updateSyncHealth(dispatch);

    return {
        unsubscribe() {
            const nextCount =
                (unitOfMeasureDispatchRefs.get(dispatch) || 1) - 1;

            if (nextCount <= 0) {
                unitOfMeasureDispatchRefs.delete(dispatch);
            } else {
                unitOfMeasureDispatchRefs.set(dispatch, nextCount);
            }

            if (unitOfMeasureDispatchRefs.size === 0) {
                sharedUnitOfMeasureSubscription?.unsubscribe();
                dispatch(clearSyncHealthAction(UNIT_OF_MEASURE_SYNC_MODEL));
                return;
            }

            updateSyncHealth(dispatch);
        },
    };
};

const updateStore = (dispatch: Dispatch, items: UnitOfMeasure[]) => {
    sortListBy(items, 'name');
    dispatch(
        unitOfMeasuresActions.setAll(
            items.map((u) => UnitOfMeasureEntityMapper.fromModel(u))
        )
    );
};
