import { authReducer } from './../../auth/data-access/src/lib/auth.slice';
import { configureStore } from '@reduxjs/toolkit'
import { useDispatch } from 'react-redux';

export const store = configureStore({
  reducer: {
      auth: authReducer
  },
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>() ;

export default store;