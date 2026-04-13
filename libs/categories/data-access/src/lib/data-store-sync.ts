import { DataStore } from '@pos/shared/amplify';
import { Dispatch } from '@reduxjs/toolkit';
import { Category } from '@pos/shared/models';
import { categoriesActions } from './slices/categories.slice';
import { CategoryEntityMapper } from './category.entity';
import { sortListBy } from '@pos/shared/utils';
import { logSyncDebug, startSyncMeasure, trackSyncSubscription } from '@pos/shared/utils';

const categoryDispatchRefs = new Map<Dispatch, number>();

let sharedCategorySubscription:
    | {
          unsubscribe: () => void;
      }
    | undefined;

let categorySnapshot: Category[] = [];

export const syncCategories = (dispatch: Dispatch) => {
    const finish = startSyncMeasure('categories', 'syncCategories');
    let subscription: { unsubscribe: () => void } | undefined = undefined;
    let shouldUnsubscribeAfterSubscribe = false;
    subscription = DataStore.observeQuery(Category).subscribe(({ items }) => {
        finish({ itemCount: items.length });
        updateStore(dispatch, items);
        if (subscription) {
            subscription.unsubscribe();
            return;
        }

        shouldUnsubscribeAfterSubscribe = true;
    });

    if (shouldUnsubscribeAfterSubscribe) {
        subscription.unsubscribe();
    }
};

export const subscribeToCategoryChanges = (dispatch: Dispatch) => {
    const currentCount = categoryDispatchRefs.get(dispatch) || 0;
    categoryDispatchRefs.set(dispatch, currentCount + 1);

    if (!sharedCategorySubscription) {
        const release = trackSyncSubscription('categories.observeQuery');
        const subscription = DataStore.observeQuery(Category).subscribe(
            ({ isSynced, items }) => {
                logSyncDebug('categories.observeQuery', 'update', {
                    isSynced,
                    itemCount: items.length,
                });
                categorySnapshot = items;
                categoryDispatchRefs.forEach((_, activeDispatch) => {
                    updateStore(activeDispatch, items);
                });
            }
        );

        sharedCategorySubscription = {
            unsubscribe() {
                subscription.unsubscribe();
                release();
                categorySnapshot = [];
                sharedCategorySubscription = undefined;
            },
        };
    } else if (categorySnapshot.length > 0) {
        updateStore(dispatch, categorySnapshot);
    }

    return {
        unsubscribe() {
            const nextCount = (categoryDispatchRefs.get(dispatch) || 1) - 1;

            if (nextCount <= 0) {
                categoryDispatchRefs.delete(dispatch);
            } else {
                categoryDispatchRefs.set(dispatch, nextCount);
            }

            if (categoryDispatchRefs.size === 0) {
                sharedCategorySubscription?.unsubscribe();
            }
        },
    };
};

const updateStore = (dispatch: Dispatch, items: Category[]) => {
    logSyncDebug('categories', 'updateStore', {
        itemCount: items.length,
    });
    sortListBy(items, 'name');
    dispatch(
        categoriesActions.setAll(
            items.map((i) => CategoryEntityMapper.fromCategory(i))
        )
    );
};
