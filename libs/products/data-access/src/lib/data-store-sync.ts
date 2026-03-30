import { productsActions } from './slices/products.slice';
import { DataStore } from '@pos/shared/amplify';
import { Dispatch } from '@reduxjs/toolkit';
import { Product } from '@pos/shared/models';
import { ProductEntityMapper } from './product.entity';
import { sortListBy } from '@pos/shared/utils';
import { logSyncDebug, startSyncMeasure, trackSyncSubscription } from '@pos/shared/utils';

export const syncProducts = (dispatch: Dispatch) => {
    const finish = startSyncMeasure('products', 'syncProducts');
    DataStore.query(Product).then((products) => {
        finish({ itemCount: products.length });
        updateStore(dispatch, products);
    });
};


export const subscribeToProductChanges = (dispatch: Dispatch) => {
    const release = trackSyncSubscription('products.observeQuery');
    const subscription = DataStore.observeQuery(Product).subscribe(({ isSynced, items }) => {
        if (!isSynced) {
            return;
        }
        logSyncDebug('products.observeQuery', 'update', {
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

const updateStore = (dispatch: Dispatch, items: Product[]) => {
    logSyncDebug('products', 'updateStore', {
        itemCount: items.length,
    });
    sortListBy(items, 'name');
    dispatch(productsActions.setAll(
        items.map((p) => ProductEntityMapper.fromProduct(p))
    ))
};
