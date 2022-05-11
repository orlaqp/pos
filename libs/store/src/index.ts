/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import logger from 'redux-logger';

import { productsReducer } from './../../products/data-access/src/lib/slices/products.slice';
import { authReducer } from '@pos/auth/data-access';
import { categoriesReducer } from '@pos/categories/data-access';
import { configureStore } from '@reduxjs/toolkit'
import { useDispatch } from 'react-redux';
import { brandsReducer } from '@pos/brands/data-access';
import { unitOfMeasuresReducer } from '@pos/unit-of-measures/data-access';

export const store = configureStore({
  reducer: {
      auth: authReducer,
      categories: categoriesReducer,
      products: productsReducer,
      brands: brandsReducer,
      unitOfMeasures: unitOfMeasuresReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>() ;

export default store;