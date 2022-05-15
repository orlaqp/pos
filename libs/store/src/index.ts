import { cartReducer } from './../../sales/data-access/src/lib/slices/cart.slice';
import { observeProductChanges } from '../../products/data-access/src/lib/slices/products.subscription';
/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import logger from 'redux-logger';

import { productsReducer } from './../../products/data-access/src/lib/slices/products.slice';
import { authReducer } from '@pos/auth/data-access';
import { categoriesReducer, observeCategoryChanges } from '@pos/categories/data-access';
import { configureStore } from '@reduxjs/toolkit'
import { useDispatch } from 'react-redux';
import { brandsReducer, observeBrandChanges } from '@pos/brands/data-access';
import { unitOfMeasuresReducer } from '@pos/unit-of-measures/data-access';

export const store = configureStore({
  reducer: {
      auth: authReducer,
      categories: categoriesReducer,
      products: productsReducer,
      brands: brandsReducer,
      unitOfMeasures: unitOfMeasuresReducer,
      cart: cartReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>() ;

// subscriptions
observeProductChanges(store.dispatch);
observeCategoryChanges(store.dispatch);
observeBrandChanges(store.dispatch);

export default store;