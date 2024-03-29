/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import logger from 'redux-logger';
import { configureStore } from '@reduxjs/toolkit'
import { useDispatch } from 'react-redux';

import { authReducer, AUTH_FEATURE_KEY } from '@pos/auth/data-access';
import { brandsReducer, BRAND_FEATURE_KEY } from '@pos/brands/data-access';
import { unitOfMeasuresReducer, UNITOFMEASURE_FEATURE_KEY } from '@pos/unit-of-measures/data-access';
import { cartReducer, CART_FEATURE_KEY } from '@pos/sales/data-access';
import { fetchStoreInfo, storeInfoReducer, STORE_INFO_FEATURE_KEY } from '@pos/store-info/data-access';
import { PRINTER_FEATURE_KEY, printingsReducer } from '@pos/printings/data-access';
import { ordersReducer, ORDER_FEATURE_KEY } from '@pos/orders/data-access';
import { awsConfigReducer, AWS_CONFIG_FEATURE_KEY, fetchGlobalSettings, fetchStationInfo, settingsReducer, SETTINGS_FEATURE_KEY, stationReducer, STATION_FEATURE_KEY } from '@pos/settings/data-access';
import { inventoryCountReducer, inventoryReceiveReducer, INVENTORY_COUNT_FEATURE_KEY, INVENTORY_RECEIVE_FEATURE_KEY } from '@pos/inventory/data-access';
import { categoriesReducer, CATEGORIES_FEATURE_KEY } from '@pos/categories/data-access';
import { employeesReducer, EMPLOYEE_FEATURE_KEY } from '@pos/employees/data-access';
import { productsReducer, PRODUCT_FEATURE_KEY } from '@pos/products/data-access';
import { eventsReducer, EVENTS_FEATURE_KEY } from '@pos/shared/data-store';

export const store = configureStore({
  reducer: {
      [AWS_CONFIG_FEATURE_KEY]: awsConfigReducer,
      [AUTH_FEATURE_KEY]: authReducer,
      [CATEGORIES_FEATURE_KEY]: categoriesReducer,
      [EMPLOYEE_FEATURE_KEY]: employeesReducer,
      [PRODUCT_FEATURE_KEY]: productsReducer,
      [BRAND_FEATURE_KEY]: brandsReducer,
      [UNITOFMEASURE_FEATURE_KEY]: unitOfMeasuresReducer,
      [CART_FEATURE_KEY]: cartReducer,
      [ORDER_FEATURE_KEY]: ordersReducer,
      [PRINTER_FEATURE_KEY]: printingsReducer,
      [STORE_INFO_FEATURE_KEY]: storeInfoReducer,
      [SETTINGS_FEATURE_KEY]: settingsReducer,
      [STATION_FEATURE_KEY]: stationReducer,
      [INVENTORY_COUNT_FEATURE_KEY]: inventoryCountReducer,
      [INVENTORY_RECEIVE_FEATURE_KEY]: inventoryReceiveReducer,
      [EVENTS_FEATURE_KEY]: eventsReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>() ;

// fetch something to trigger datastore sync
store.dispatch(fetchStoreInfo());
store.dispatch(fetchStationInfo());
store.dispatch(fetchGlobalSettings());

export default store;