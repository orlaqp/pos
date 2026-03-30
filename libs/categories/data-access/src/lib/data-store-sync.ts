import { DataStore } from '@pos/shared/amplify';
import { Dispatch } from '@reduxjs/toolkit';
import { Category } from '@pos/shared/models';
import { categoriesActions } from './slices/categories.slice';
import { CategoryEntityMapper } from './category.entity';
import { sortListBy } from '@pos/shared/utils';
import { logSyncDebug, startSyncMeasure, trackSyncSubscription } from '@pos/shared/utils';

export const syncCategories = (dispatch: Dispatch) => {
    const finish = startSyncMeasure('categories', 'syncCategories');
    DataStore.query(Category).then((categories) => {
        finish({ itemCount: categories.length });
        updateStore(dispatch, categories);
    });
};

export const subscribeToCategoryChanges = (dispatch: Dispatch) => {
    const release = trackSyncSubscription('categories.observeQuery');
    const subscription = DataStore.observeQuery(Category).subscribe(({ isSynced, items }) => {
        logSyncDebug('categories.observeQuery', 'update', {
            isSynced,
            itemCount: items.length,
        });
        updateStore(dispatch, items);
    });

    return {
        unsubscribe() {
            subscription.unsubscribe();
            release();
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
