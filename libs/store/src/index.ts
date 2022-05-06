import { authReducer } from '@pos/auth/data-access';
import { categoriesReducer } from '@pos/categories/data-access';
import { configureStore } from '@reduxjs/toolkit'
import { useDispatch } from 'react-redux';

export const store = configureStore({
  reducer: {
      auth: authReducer,
      categories: categoriesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>() ;

export default store;