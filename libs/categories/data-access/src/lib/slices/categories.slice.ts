// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { RootState } from '@pos/store';
import {
    createAsyncThunk,
    createEntityAdapter,
    createSelector,
    createSlice,
    Dictionary,
    EntityState,
    PayloadAction,
} from '@reduxjs/toolkit';
import { CategoryService } from '../category.service';

export const CATEGORIES_FEATURE_KEY = 'categories';

export type CategoryEntity = {
    id?: string,
    name?: string | null,
    description?: string | null,
    code?: string | null,
    color?: string | null,
    picture?: string | null,
    createdAt?: string | null | undefined,
    updatedAt?: string | null | undefined,
};

export interface CategoriesState extends EntityState<CategoryEntity> {
  loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
  error?: string;
  selected?: CategoryEntity;
  filterQuery?: string;
  filteredList?: Dictionary<CategoryEntity>;
}

export const categoriesAdapter = createEntityAdapter<CategoryEntity>();

export const fetchCategories = createAsyncThunk(
  'categories/fetchStatus',
  async (_, thunkAPI) => {
    const categories = await CategoryService.getAll();
    return categories.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        code: c.code,
        color: c.color,
        picture: c.picture,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt
    }))
  }
);

export const initialCategoriesState: CategoriesState =
  categoriesAdapter.getInitialState({
    loadingStatus: 'not loaded',
    selected: undefined,
    filterQuery: undefined,
    filteredList: undefined
  });

export const categoriesSlice = createSlice({
  name: CATEGORIES_FEATURE_KEY,
  initialState: initialCategoriesState,
  reducers: {
    add: categoriesAdapter.addOne,
    remove: categoriesAdapter.removeOne,
    update: categoriesAdapter.updateOne,
    select: (state: CategoriesState, action: PayloadAction<CategoryEntity>) => {
        state.selected = action.payload;
    },
    clearSelection: (state: CategoriesState) => {
        state.selected = undefined;
    },
    filter: (state: CategoriesState, action: PayloadAction<string>) => {
        filterList(state, action.payload);
        state.filterQuery = action.payload;
    }
    
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state: CategoriesState) => {
        state.loadingStatus = 'loading';
      })
      .addCase(
        fetchCategories.fulfilled,
        (state: CategoriesState, action: PayloadAction<CategoryEntity[]>) => {
          categoriesAdapter.setAll(state, action.payload);
          filterList(state, state.filterQuery);
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

export const getCategoriesState = (rootState: RootState): CategoriesState =>
  rootState[CATEGORIES_FEATURE_KEY];

export const selectAllCategories = createSelector(
  getCategoriesState,
  selectAll
);

export const selectCategoriesEntities = createSelector(
  getCategoriesState,
  selectEntities
);

export const selectLoadingStatus = createSelector(
    getCategoriesState,
    (state: CategoriesState) => state.loadingStatus
)

export const selectIsEmpty = createSelector(
    getCategoriesState,
    (state: CategoriesState) => state.ids.length === 0
)

export const selectFilteredList = createSelector(
    getCategoriesState,
    (state: CategoriesState) => state.filteredList
)




function filterList(state: CategoriesState, query?: string) {
    console.log('Query', query);
    
    const filteredList: Dictionary<CategoryEntity> = {};
    
    if (!query) {
        state.filteredList = state.entities;
        return;
    }

    const lowerQuery = query.toLowerCase();
    
    // const queryString = query || state.filterQuery;
    
    state.ids.forEach(id => {
        if (state.entities[id]?.name?.toLowerCase().indexOf(lowerQuery) === -1)
            return;

        filteredList[id] = state.entities[id];
    });

    state.filteredList = filteredList;
}

