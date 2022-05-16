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
    filter: (state: ProductsState, action: PayloadAction<{ filter?: string, categoryId?: string}>) => {
        filterList(state, action.payload.filter, action.payload.categoryId);
        state.filterQuery = action.payload.filter;
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

export const productsActions = productsSlice.actions;

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

export const selectProductsByCategory = (id?: string) => createSelector(
    getProductsState,
    (state: ProductsState) => {
        const products = selectAll(state);
        return id 
            ? products.filter(p => p.productCategoryId === id)
            : products;
    } 
        
)

function filterList(state: ProductsState, query?: string, categoryId?: string) {
    const filteredList: Dictionary<ProductEntity> = {};
    
    if (categoryId && !query) {
        state.ids.forEach(id => {
            const entity = state.entities[id];
            if (entity?.productCategoryId === categoryId) {
                filteredList[id] = entity;
            }
        });

        return state.filteredList = filteredList;
    }

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

