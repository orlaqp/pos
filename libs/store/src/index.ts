/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import logger from 'redux-logger';

import { productsReducer } from './../../products/data-access/src/lib/slices/products.slice';
import { authReducer } from '@pos/auth/data-access';
import { categoriesReducer, observeCategoryChanges } from '@pos/categories/data-access';
import { configureStore } from '@reduxjs/toolkit'
import { useDispatch } from 'react-redux';
import { brandsReducer, observeBrandChanges } from '@pos/brands/data-access';
import { unitOfMeasuresReducer } from '@pos/unit-of-measures/data-access';
import { cartReducer, observeOpenOrderChanges, orderReducer } from '@pos/sales/data-access';
import { observeProductChanges } from '@pos/products/data-access';
import { fetchStoreInfo, storeInfoReducer } from '@pos/store-info/data-access';
import { fetchDefaultPrinter, printingsReducer } from '@pos/printings/data-access';

export const store = configureStore({
  reducer: {
      auth: authReducer,
      categories: categoriesReducer,
      products: productsReducer,
      brands: brandsReducer,
      unitOfMeasures: unitOfMeasuresReducer,
      cart: cartReducer,
      order: orderReducer,
      printings: printingsReducer,
      storeInfo: storeInfoReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>() ;

// fetch store info
store.dispatch(fetchStoreInfo());
// fetch default printer config
store.dispatch(fetchDefaultPrinter());

// subscriptions
observeProductChanges(store.dispatch);
observeCategoryChanges(store.dispatch);
observeBrandChanges(store.dispatch);
observeOpenOrderChanges(store.dispatch);
// observeUnitOfMeasureChanges(store.dispatch);

export default store;