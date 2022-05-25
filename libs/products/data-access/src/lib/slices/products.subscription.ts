import { Product } from '@pos/shared/models';
import { Dispatch } from '@reduxjs/toolkit';
import { ProductEntityMapper } from '../product.entity';
import { DataStore } from 'aws-amplify';
import { productsActions } from './products.slice';
import { ZenObservable } from 'zen-observable-ts';

export let productsSubscription: ZenObservable.Subscription | null;

export const observeProductChanges = (dispatch: Dispatch) => {
    if (productsSubscription) {
        productsSubscription.unsubscribe();
        productsSubscription = null;
    }

    productsSubscription = DataStore.observeQuery(Product).subscribe(({ isSynced, items }) => {
        if (isSynced) {
            dispatch(productsActions.setAll(items.map(i => ProductEntityMapper.fromProduct(i))));
        }
    }, (error) => {
        dispatch(productsActions.error(error));
    });
}
