import { productsActions } from './slices/products.slice';
import { DataStore } from 'aws-amplify';
import { Dispatch } from '@reduxjs/toolkit';
import { Product } from '@pos/shared/models';
import { ProductEntityMapper } from './product.entity';

export const syncProducts = (dispatch: Dispatch) => {
    console.log('Syncing products to the store');
    DataStore.query(Product).then((products) =>
        dispatch(productsActions.setAll(
            products.map((p) => ProductEntityMapper.fromProduct(p))
        ))
    );
};
