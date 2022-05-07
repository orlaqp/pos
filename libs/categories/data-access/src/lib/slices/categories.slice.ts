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

const categories_old: Category[] = [
    new Category({
      code: '1',
      color: '#2962FF',
      name: 'Beverages',
      description: 'Beverages, soft drinks, Coca Cola',
    }),
    new Category({
      code: '2',
      color: '#AA00FF',
      name: 'Bread',
      description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
    }),
    new Category({
      code: '3',
      color: '#D32F2F',
      name: 'Meat',
      description:
        'officia adipisci a recusandae assumenda inventore quidem sapiente molestiae. Cum, accusamus.',
    }),
    new Category({
      code: '4',
      color: '#F5F5F5',
      name: 'Dairy',
      description:
        'Veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo',
    }),
    new Category({
      code: '5',
      color: '#4DD0E1',
      name: 'Canned',
      description:
        'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    }),
    new Category({
      code: '1',
      color: '#2962FF',
      name: 'Beverages',
      description: 'Beverages, soft drinks, Coca Cola',
    }),
    new Category({
      code: '2',
      color: '#AA00FF',
      name: 'Bread',
      description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
    }),
    new Category({
      code: '3',
      color: '#D32F2F',
      name: 'Meat',
      description:
        'officia adipisci a recusandae assumenda inventore quidem sapiente molestiae. Cum, accusamus.',
    }),
    new Category({
      code: '4',
      color: '#F5F5F5',
      name: 'Dairy',
      description:
        'Veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo',
    }),
    new Category({
      code: '5',
      color: '#4DD0E1',
      name: 'Canned',
      description:
        'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    }),
    new Category({
      code: '1',
      color: '#2962FF',
      name: 'Beverages',
      description: 'Beverages, soft drinks, Coca Cola',
    }),
    new Category({
      code: '2',
      color: '#AA00FF',
      name: 'Bread',
      description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
    }),
    new Category({
      code: '3',
      color: '#D32F2F',
      name: 'Meat',
      description:
        'officia adipisci a recusandae assumenda inventore quidem sapiente molestiae. Cum, accusamus.',
    }),
    new Category({
      code: '4',
      color: '#F5F5F5',
      name: 'Dairy',
      description:
        'Veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo',
    }),
    new Category({
      code: '5',
      color: '#4DD0E1',
      name: 'Canned',
      description:
        'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    }),
  ];
  

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
    debugger;
    return res;
  }
);

export const addCategory = createAsyncThunk(
    'categories/addStatus',
    async (category: Category, thunkAPI) => {
      const res = await DataStore.save(category);
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
