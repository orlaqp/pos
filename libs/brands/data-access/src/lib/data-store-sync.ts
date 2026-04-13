import { DataStore } from '@pos/shared/amplify';
import { Dispatch } from '@reduxjs/toolkit';
import { Brand } from '@pos/shared/models';
import { brandsActions } from './slices/brands.slice';
import { BrandEntityMapper } from './brand.entity';
import { sortListBy } from '@pos/shared/utils';

const BRAND_SYNC_MODEL = 'brands';
const brandDispatchRefs = new Map<Dispatch, number>();
let sharedBrandSubscription:
    | {
          unsubscribe: () => void;
      }
    | undefined;
let brandSnapshot: Brand[] = [];

const getSubscriberCount = () => {
    let count = 0;
    brandDispatchRefs.forEach((dispatchCount) => {
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
        updateSyncHealthAction(BRAND_SYNC_MODEL, {
            status: sharedBrandSubscription ? 'healthy' : 'subscribing',
            subscriberCount: getSubscriberCount(),
        })
    );
};

export const syncBrands = (dispatch: Dispatch) => {
    const subscription = DataStore.observeQuery(Brand).subscribe(({ items }) => {
        updateStore(dispatch, items);
        subscription.unsubscribe();
    });
};

export const subscribeToBrandChanges = (dispatch: Dispatch) => {
    const currentCount = brandDispatchRefs.get(dispatch) || 0;
    brandDispatchRefs.set(dispatch, currentCount + 1);

    if (!sharedBrandSubscription) {
        const subscription = DataStore.observeQuery(Brand).subscribe(({ isSynced, items }) => {
            void isSynced;
            brandSnapshot = items;
            brandDispatchRefs.forEach((_, activeDispatch) => {
                updateStore(activeDispatch, items);
            });
        });

        sharedBrandSubscription = {
            unsubscribe() {
                subscription.unsubscribe();
                brandSnapshot = [];
                sharedBrandSubscription = undefined;
            },
        };
    } else if (brandSnapshot.length > 0) {
        updateStore(dispatch, brandSnapshot);
    }

    updateSyncHealth(dispatch);

    return {
        unsubscribe() {
            const nextCount = (brandDispatchRefs.get(dispatch) || 1) - 1;

            if (nextCount <= 0) {
                brandDispatchRefs.delete(dispatch);
            } else {
                brandDispatchRefs.set(dispatch, nextCount);
            }

            if (brandDispatchRefs.size === 0) {
                sharedBrandSubscription?.unsubscribe();
                dispatch(clearSyncHealthAction(BRAND_SYNC_MODEL));
                return;
            }

            updateSyncHealth(dispatch);
        },
    };
};

const updateStore = (dispatch: Dispatch, items: Brand[]) => {
    sortListBy(items, 'name');
    dispatch(
        brandsActions.setAll(items.map((b) => BrandEntityMapper.fromModel(b)))
    );
};
