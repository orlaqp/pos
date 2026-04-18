import { Dispatch } from '@reduxjs/toolkit';
import { DataStore } from '@pos/shared/amplify';
import { createSharedObserveQueryManager } from '@pos/shared/data-store';
import { Category } from '@pos/shared/models';
import { sortListBy } from '@pos/shared/utils';
import { logSyncDebug, startSyncMeasure } from '@pos/shared/utils';
import { CategoryEntityMapper } from './category.entity';
import { categoriesActions } from './slices/categories.slice';

const CATEGORY_SYNC_MODEL = 'categories';

const isNotDeleted = (item: { _deleted?: boolean | null } | null | undefined) =>
    !!item && item._deleted !== true;

const updateStore = (dispatch: Dispatch, items: Category[]) => {
    logSyncDebug('categories', 'updateStore', {
        itemCount: items.length,
    });
    sortListBy(items, 'name');
    dispatch(
        categoriesActions.setAll(
            items.map((category) => CategoryEntityMapper.fromCategory(category))
        )
    );
};

const categorySyncManager = createSharedObserveQueryManager<Category, Category[]>({
    model: CATEGORY_SYNC_MODEL,
    trackKey: 'categories.observeQuery',
    observeQuery: () => DataStore.observeQuery(Category),
    mapSnapshot: ({ isSynced, items }) => {
        const activeItems = items.filter((item) =>
            isNotDeleted(item as { _deleted?: boolean | null })
        );

        logSyncDebug('categories.observeQuery', 'update', {
            isSynced,
            itemCount: activeItems.length,
        });

        return activeItems;
    },
    publishSnapshot: (dispatch, items) => {
        updateStore(dispatch, items);
    },
});

export const syncCategories = async (dispatch: Dispatch) => {
    const finish = startSyncMeasure('categories', 'syncCategories');
    const items = (await DataStore.query(Category)).filter((item) =>
        isNotDeleted(item as { _deleted?: boolean | null })
    );
    finish({ itemCount: items.length });
    updateStore(dispatch, items);
};

export const ensureCategorySyncHealthy = async (
    dispatch: Dispatch,
    options?: {
        staleAfterMs?: number;
        tenantId?: string;
    }
) => categorySyncManager.ensureHealthy(dispatch, options);

export const subscribeToCategoryChanges = (
    dispatch: Dispatch,
    tenantId?: string
) => categorySyncManager.subscribe(dispatch, tenantId);
