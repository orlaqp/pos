import { productsActions, ProductEntity } from '@pos/products/data-access';
import { Product } from '@pos/shared/models';
import { Dispatch } from '@reduxjs/toolkit';
import { ProductEntityMapper } from '../product.entity';
import { observeChanges } from '@pos/shared/utils';

export const observeProductChanges = (dispatch: Dispatch) => observeChanges<Product, ProductEntity>({
    dispatch,
    mapper: ProductEntityMapper.fromProduct,
    addAction: productsActions.add,
    updateAction: productsActions.update,
    deleteAction: productsActions.remove,
    modelConstructor: Product
})
