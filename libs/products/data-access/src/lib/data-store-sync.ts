import { Dispatch } from '@reduxjs/toolkit';
import { DataStore } from '@pos/shared/amplify';
import { createSharedObserveQueryManager } from '@pos/shared/data-store';
import { Product } from '@pos/shared/models';
import { sortListBy } from '@pos/shared/utils';
import { logSyncDebug, startSyncMeasure } from '@pos/shared/utils';
import { ProductEntityMapper } from './product.entity';
import { productsActions } from './slices/products.slice';

const PRODUCT_SYNC_MODEL = 'products';
export const PRODUCT_SYNC_STALE_THRESHOLD_MS = 60_000;

const previousProductSnapshot = new Map<
    string,
    { quantity?: number; updatedAt?: string | null | undefined }
>();

const isNotDeleted = (item: { _deleted?: boolean | null } | null | undefined) =>
    !!item && item._deleted !== true;

const logChangedProducts = (items: Product[]) => {
    const changed = items
        .filter((item) => {
            const previous = previousProductSnapshot.get(item.id);
            return (
                !previous ||
                previous.quantity !== item.quantity ||
                previous.updatedAt !== item.updatedAt
            );
        })
        .slice(0, 10)
        .map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            updatedAt: item.updatedAt,
        }));

    if (changed.length > 0) {
        logSyncDebug('products.observeQuery', 'changedItems', {
            itemCount: changed.length,
            items: changed,
        });
    }

    previousProductSnapshot.clear();
    items.forEach((item) => {
        previousProductSnapshot.set(item.id, {
            quantity: item.quantity,
            updatedAt: item.updatedAt,
        });
    });
};

const updateStore = (dispatch: Dispatch, items: Product[]) => {
    logSyncDebug('products', 'updateStore', {
        itemCount: items.length,
    });
    sortListBy(items, 'name');
    dispatch(
        productsActions.setAll(
            items.map((product) => ProductEntityMapper.fromProduct(product))
        )
    );
};

const productSyncManager = createSharedObserveQueryManager<Product, Product[]>({
    model: PRODUCT_SYNC_MODEL,
    trackKey: 'products.observeQuery',
    staleThresholdMs: PRODUCT_SYNC_STALE_THRESHOLD_MS,
    observeQuery: () => DataStore.observeQuery(Product),
    mapSnapshot: ({ isSynced, items }) => {
        const activeItems = items.filter((item) =>
            isNotDeleted(item as { _deleted?: boolean | null })
        );

        logSyncDebug('products.observeQuery', 'update', {
            isSynced,
            itemCount: activeItems.length,
        });

        return activeItems;
    },
    publishSnapshot: (dispatch, items, context) => {
        if (!context.replay) {
            logChangedProducts(items);
        }

        updateStore(dispatch, items);
    },
    onReset: () => {
        previousProductSnapshot.clear();
    },
});

export const teardownProductSync = () => {
    productSyncManager.teardown();
};

export const restartProductSync = async (
    dispatch: Dispatch,
    reason = 'manual',
    tenantId?: string
) => {
    logSyncDebug('products.sync', 'restart', {
        reason,
        tenantId: tenantId || null,
    });
    await productSyncManager.restart(dispatch, reason, tenantId);
};

export const ensureProductSyncHealthy = async (
    dispatch: Dispatch,
    options?: {
        staleAfterMs?: number;
        tenantId?: string;
    }
) => productSyncManager.ensureHealthy(dispatch, options);

export const syncProducts = async (dispatch: Dispatch) => {
    const finish = startSyncMeasure('products', 'syncProducts');
    const items = (await DataStore.query(Product)).filter((item) =>
        isNotDeleted(item as { _deleted?: boolean | null })
    );
    finish({ itemCount: items.length });
    updateStore(dispatch, items);
};

export const subscribeToProductChanges = (
    dispatch: Dispatch,
    tenantId?: string
) => productSyncManager.subscribe(dispatch, tenantId);
