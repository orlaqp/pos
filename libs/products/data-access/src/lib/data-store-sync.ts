import { productsActions } from './slices/products.slice';
import { DataStore } from 'aws-amplify';
import { Dispatch } from '@reduxjs/toolkit';
import { Product } from '@pos/shared/models';
import { ProductEntityMapper } from './product.entity';
import { sortListBy } from '@pos/shared/utils';

export const syncProducts = (dispatch: Dispatch) => {
    console.log('Syncing products to the store');
    DataStore.query(Product).then((products) =>
        updateStore(dispatch, products)
    );
};


export const subscribeToProductChanges = (dispatch: Dispatch) => {
    return DataStore.observeQuery(Product).subscribe(({ isSynced, items }) => {
        if (!isSynced) return;
        console.log('Product changes detected');
        updateStore(dispatch, items);
        
    });
};

const updateStore = (dispatch: Dispatch, items: Product[]) => {
    sortListBy(items, 'name');
    dispatch(productsActions.setAll(
        items.map((p) => ProductEntityMapper.fromProduct(p))
    ))
};
