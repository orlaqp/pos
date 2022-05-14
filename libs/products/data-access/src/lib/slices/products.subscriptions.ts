import { productsActions, ProductEntity } from '@pos/products/data-access';
import { Product } from '@pos/shared/models';
import { Dispatch } from '@reduxjs/toolkit';
import { ProductEntityMapper } from '../product.entity';
import { observeChanges } from '@pos/shared/utils';
import { DataStore } from 'aws-amplify';

// export const observeProductChanges = (dispatch: Dispatch) => observeChanges<Product, ProductEntity>({
//     dispatch,
//     mapper: ProductEntityMapper.fromProduct,
//     addAction: productsActions.add,
//     updateAction: productsActions.update,
//     deleteAction: productsActions.remove,
//     modelConstructor: Product
// })

export const observeProductChanges = (dispatch: Dispatch) => {
    DataStore.observeQuery(Product).subscribe(({ isSynced, items }) => {
        if (isSynced) {
            dispatch(productsActions.setAll(items.map(i => ProductEntityMapper.fromProduct(i))));
        }
    });
}
