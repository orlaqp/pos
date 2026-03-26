import { productsActions } from './slices/products.slice';
import { DataStore } from '@pos/shared/amplify';
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
        console.log(
            `[products-sync] observeQuery update: count=${items.length}, isSynced=${isSynced}`
        );
        const productsWithPlu = items.filter((product) => !!product.plu).length;
        const activeProducts = items.filter((product) => product.isActive).length;
        const cantimpaloMatches = items
            .filter((product) => product.name?.toLowerCase().includes('cantimpalo'))
            .map((product) => ({
                id: product.id,
                name: product.name,
                plu: product.plu,
                barcode: product.barcode,
                isActive: product.isActive,
            }));

        console.log(
            `[products-sync] details: active=${activeProducts}, withPlu=${productsWithPlu}, cantimpalo=${JSON.stringify(
                cantimpaloMatches
            )}`
        );
        updateStore(dispatch, items);
    });
};

const updateStore = (dispatch: Dispatch, items: Product[]) => {
    sortListBy(items, 'name');
    dispatch(productsActions.setAll(
        items.map((p) => ProductEntityMapper.fromProduct(p))
    ))
};
