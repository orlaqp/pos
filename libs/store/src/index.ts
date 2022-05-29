/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import logger from 'redux-logger';
import { configureStore } from '@reduxjs/toolkit'
import { useDispatch } from 'react-redux';

import { productsReducer } from './../../products/data-access/src/lib/slices/products.slice';
import { authReducer } from '@pos/auth/data-access';
import { brandsReducer } from '@pos/brands/data-access';
import { unitOfMeasuresReducer } from '@pos/unit-of-measures/data-access';
import { cartReducer } from '@pos/sales/data-access';
import { fetchStoreInfo, storeInfoReducer } from '@pos/store-info/data-access';
import { printingsReducer } from '@pos/printings/data-access';
import { ordersReducer } from '@pos/orders/data-access';
import { settingsReducer } from '@pos/settings/data-access';
import { inventoryCountReducer, inventoryReceiveReducer } from '@pos/inventory/data-access';
import { categoriesReducer } from '@pos/categories/data-access';

export const store = configureStore({
  reducer: {
      auth: authReducer,
      categories: categoriesReducer,
      products: productsReducer,
      brands: brandsReducer,
      unitOfMeasures: unitOfMeasuresReducer,
      cart: cartReducer,
      orders: ordersReducer,
      printings: printingsReducer,
      storeInfo: storeInfoReducer,
      settings: settingsReducer,
      inventoryCount: inventoryCountReducer,
      inventoryReceive: inventoryReceiveReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>() ;

// fetch something to trigger datastore sync
store.dispatch(fetchStoreInfo());

export default store;