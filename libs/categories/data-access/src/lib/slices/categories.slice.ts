import { Category } from '@pos/models';
import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  EntityState,
  PayloadAction,
} from '@reduxjs/toolkit';
import { DataStore } from 'aws-amplify';

export const CATEGORIES_FEATURE_KEY = 'categories';

export interface CategoriesState extends EntityState<Category> {
  loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
  error?: string;
}

export const categoriesAdapter = createEntityAdapter<Category>();

export const fetchCategories = createAsyncThunk(
  'categories/fetchStatus',
  async (_, thunkAPI) => {
    const res = await DataStore.query(Category);
    return res;
  }
);

export const initialCategoriesState: CategoriesState =
  categoriesAdapter.getInitialState({
    loadingStatus: 'not loaded',
  });

export const categoriesSlice = createSlice({
  name: CATEGORIES_FEATURE_KEY,
  initialState: initialCategoriesState,
  reducers: {
    add: categoriesAdapter.addOne,
    remove: categoriesAdapter.removeOne,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state: CategoriesState) => {
        state.loadingStatus = 'loading';
      })
      .addCase(
        fetchCategories.fulfilled,
        (state: CategoriesState, action: PayloadAction<Category[]>) => {
          categoriesAdapter.setAll(state, action.payload);
          state.loadingStatus = 'loaded';
        }
      )
      .addCase(fetchCategories.rejected, (state: CategoriesState, action) => {
        state.loadingStatus = 'error';
        state.error = action.error.message;
      });
  },
});

/*
 * Export reducer for store configuration.
 */
export const categoriesReducer = categoriesSlice.reducer;

/*
 * Export action creators to be dispatched. For use with the `useDispatch` hook.
 *
 * e.g.
 * ```
 * import React, { useEffect } from 'react';
 * import { useDispatch } from 'react-redux';
 *
 * // ...
 *
 * const dispatch = useDispatch();
 * useEffect(() => {
 *   dispatch(categoriesActions.add({ id: 1 }))
 * }, [dispatch]);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#usedispatch
 */
export const categoriesActions = categoriesSlice.actions;

/*
 * Export selectors to query state. For use with the `useSelector` hook.
 *
 * e.g.
 * ```
 * import { useSelector } from 'react-redux';
 *
 * // ...
 *
 * const entities = useSelector(selectAllCategories);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#useselector
 */
const { selectAll, selectEntities } = categoriesAdapter.getSelectors();

export const getCategoriesState = (rootState: unknown): CategoriesState =>
  rootState[CATEGORIES_FEATURE_KEY];

export const selectAllCategories = createSelector(
  getCategoriesState,
  selectAll
);

export const selectCategoriesEntities = createSelector(
  getCategoriesState,
  selectEntities
);
