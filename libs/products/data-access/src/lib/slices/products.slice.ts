import { ProductEntityMapper } from './../product.entity';

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
import { ProductEntity } from '../product.entity';
import { ProductService } from '../product.service';

export const PRODUCT_FEATURE_KEY = 'products';

export interface ProductsState extends EntityState< ProductEntity > {
  loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
  error?: string;
  selected?: ProductEntity;
  filterQuery?: string;
  filteredList?: Dictionary< ProductEntity >;
}

export const productsAdapter = createEntityAdapter< ProductEntity >();

// export const fetchProducts = createAsyncThunk(
//   'products/fetchStatus',
//   async (_, thunkAPI) => {
//     const products = await ProductService.getAll();

//     return products.map(p => ProductEntityMapper.fromProduct(p))
//   }
// );

export const initialProductsState: ProductsState =
  productsAdapter.getInitialState({
    loadingStatus: 'not loaded',
    selected: undefined,
    filterQuery: undefined,
    filteredList: undefined
  });

export const productsSlice = createSlice({
  name: PRODUCT_FEATURE_KEY,
  initialState: initialProductsState,
  reducers: {
    setAll: (state: ProductsState, action: PayloadAction< ProductEntity[] >) =>{
        productsAdapter.setAll(state, action.payload);
        state.loadingStatus = 'loaded';
        filterList(state, state.filterQuery);
    },
    add: (state: ProductsState, action: PayloadAction< ProductEntity >) =>{
        productsAdapter.addOne(state, action);
        filterList(state, state.filterQuery);
    },
    remove: (state: ProductsState, action: PayloadAction< EntityId >) => {
        productsAdapter.removeOne(state, action);
        filterList(state, state.filterQuery);
    },
    update: (state: ProductsState, action: PayloadAction<Update< ProductEntity>>) => {
        productsAdapter.updateOne(state, action);
        filterList(state, state.filterQuery);
    },
    select: (state: ProductsState, action: PayloadAction< ProductEntity >) => {
        state.selected = action.payload;
    },
    clearSelection: (state: ProductsState) => {
        state.selected = undefined;
    },
    filter: (state: ProductsState, action: PayloadAction<string>) => {
        filterList(state, action.payload);
        state.filterQuery = action.payload;
    }
    
  },
  extraReducers: (builder) => {
    // builder
    //   .addCase(fetchProducts.pending, (state: ProductsState) => {
    //     state.loadingStatus = 'loading';
    //   })
    //   .addCase(
    //     fetchProducts.fulfilled,
    //     (state: ProductsState, action: PayloadAction< ProductEntity[] >) => {
    //       productsAdapter.setAll(state, action.payload);
    //       filterList(state, state.filterQuery);
    //       state.loadingStatus = 'loaded';
    //     }
    //   )
    //   .addCase(fetchProducts.rejected, (state: ProductsState, action) => {
    //     state.loadingStatus = 'error';
    //     state.error = action.error.message;
    //   });
  },
});

/*
 * Export reducer for store configuration.
 */
export const productsReducer = productsSlice.reducer;

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
 *   dispatch(productsActions.add({ id: 1 }))
 * }, [dispatch]);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#usedispatch
 */
export const productsActions = productsSlice.actions;

/*
 * Export selectors to query state. For use with the `useSelector` hook.
 *
 * e.g.
 * ```
 * import { useSelector } from 'react-redux';
 *
 * // ...
 *
 * const entities = useSelector(selectAllProducts);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#useselector
 */
const { selectAll, selectEntities } = productsAdapter.getSelectors();

export const getProductsState = (rootState: RootState): ProductsState =>
  rootState[PRODUCT_FEATURE_KEY];

export const selectAllProducts = createSelector(
  getProductsState,
  selectAll
);

export const selectProductsEntities = createSelector(
  getProductsState,
  selectEntities
);

export const selectLoadingStatus = createSelector(
    getProductsState,
    (state: ProductsState) => state.loadingStatus
)

export const selectIsEmpty = createSelector(
    getProductsState,
    (state: ProductsState) => state.ids.length === 0
)

export const selectFilteredList = createSelector(
    getProductsState,
    (state: ProductsState) => state.filteredList
)




function filterList(state: ProductsState, query?: string) {
    const filteredList: Dictionary<ProductEntity> = {};
    
    if (!query) {
        state.filteredList = state.entities;
        return;
    }

    const lowerQuery = query.toLowerCase();
    
    // const queryString = query || state.filterQuery;
    
    state.ids.forEach(id => {
        const entity = state.entities[id];
        if (
            entity?.name?.toLowerCase().indexOf(lowerQuery) !== -1
            || entity.description?.toLowerCase().indexOf(lowerQuery) !== -1
            || entity.barcode?.toLowerCase().indexOf(lowerQuery) !== -1
            || entity.sku?.toLowerCase().indexOf(lowerQuery) !== -1
        ) {
            filteredList[id] = entity;
        }

    });

    state.filteredList = filteredList;
}

