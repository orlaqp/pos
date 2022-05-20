
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { RootState } from '@pos/store';
import {
    createAsyncThunk,
    createEntityAdapter,
    createSelector,
    createSlice,
    Dictionary,
    EntityId,
    EntityState,
    PayloadAction,
    Update,
} from '@reduxjs/toolkit';
import { BrandEntity } from '../brand.entity';
import { BrandService } from '../brand.service';

export const BRAND_FEATURE_KEY = 'brands';

export interface BrandsState extends EntityState< BrandEntity > {
  loadingStatus: 'new' | 'loading' | 'loaded' | 'error';
  error?: string;
  selected?: BrandEntity;
  filterQuery?: string;
  filteredList?: Dictionary< BrandEntity >;
}

export const brandsAdapter = createEntityAdapter< BrandEntity >();

export const fetchBrands = createAsyncThunk(
  'brands/fetchStatus',
  async (_, thunkAPI) => {
    const brands = await BrandService.getAll();
    return brands.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt
    }))
  }
);

export const initialBrandsState: BrandsState =
  brandsAdapter.getInitialState({
    loadingStatus: 'not loaded',
    selected: undefined,
    filterQuery: undefined,
    filteredList: undefined
  });

export const brandsSlice = createSlice({
  name: BRAND_FEATURE_KEY,
  initialState: initialBrandsState,
  reducers: {
    setAll: (state: BrandsState, action: PayloadAction< BrandEntity[] >) =>{
        brandsAdapter.setAll(state, action.payload);
        state.loadingStatus = 'loaded';
        filterList(state, state.filterQuery);
    },
    add: (state: BrandsState, action: PayloadAction<BrandEntity>) =>{
        brandsAdapter.addOne(state, action);
        filterList(state, state.filterQuery);
    },
    remove: (state: BrandsState, action: PayloadAction< EntityId >) => {
        brandsAdapter.removeOne(state, action);
        filterList(state, state.filterQuery);
    },
    update: (state: BrandsState, action: PayloadAction<Update<BrandEntity>>) => {
        brandsAdapter.updateOne(state, action);
        filterList(state, state.filterQuery);
    },
    select: (state: BrandsState, action: PayloadAction< BrandEntity >) => {
        state.selected = action.payload;
    },
    clearSelection: (state: BrandsState) => {
        state.selected = undefined;
    },
    filter: (state: BrandsState, action: PayloadAction<string>) => {
        filterList(state, action.payload);
        state.filterQuery = action.payload;
    }
    
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrands.pending, (state: BrandsState) => {
        state.loadingStatus = 'loading';
      })
      .addCase(
        fetchBrands.fulfilled,
        (state: BrandsState, action: PayloadAction< BrandEntity[] >) => {
          brandsAdapter.setAll(state, action.payload);
          filterList(state, state.filterQuery);
          state.loadingStatus = 'loaded';
        }
      )
      .addCase(fetchBrands.rejected, (state: BrandsState, action) => {
        state.loadingStatus = 'error';
        state.error = action.error.message;
      });
  },
});

/*
 * Export reducer for store configuration.
 */
export const brandsReducer = brandsSlice.reducer;

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
 *   dispatch(brandsActions.add({ id: 1 }))
 * }, [dispatch]);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#usedispatch
 */
export const brandsActions = brandsSlice.actions;

/*
 * Export selectors to query state. For use with the `useSelector` hook.
 *
 * e.g.
 * ```
 * import { useSelector } from 'react-redux';
 *
 * // ...
 *
 * const entities = useSelector(selectAllBrands);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#useselector
 */
const { selectAll, selectEntities } = brandsAdapter.getSelectors();

export const getBrandsState = (rootState: RootState): BrandsState =>
  rootState[BRAND_FEATURE_KEY];

export const selectAllBrands = createSelector(
  getBrandsState,
  selectAll
);

export const selectBrandsEntities = createSelector(
  getBrandsState,
  selectEntities
);

export const selectLoadingStatus = createSelector(
    getBrandsState,
    (state: BrandsState) => state.loadingStatus
)

export const selectIsEmpty = createSelector(
    getBrandsState,
    (state: BrandsState) => state.ids.length === 0
)

export const selectFilteredList = createSelector(
    getBrandsState,
    (state: BrandsState) => state.filteredList
)

export const selectBrand = (id: string | null | undefined) => createSelector(
    getBrandsState,
    (state: BrandsState) => id ? state.entities[id] : null
)


function filterList(state: BrandsState, query?: string) {
    const filteredList: Dictionary<BrandEntity> = {};
    
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

