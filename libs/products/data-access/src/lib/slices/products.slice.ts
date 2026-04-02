import { sortListBy } from '@pos/shared/utils';
import { ProductEntityMapper } from './../product.entity';

// eslint-disable-next-line @nx/enforce-module-boundaries
import { RootState } from '@pos/store';
import {
    createAsyncThunk,
    createEntityAdapter,
    createSelector,
    createSlice,
    EntityState,
    PayloadAction,
    Update,
} from '@reduxjs/toolkit';
import { ProductEntity } from '../product.entity';
import { ProductService } from '../product.service';

export const PRODUCT_FEATURE_KEY = 'products';

export interface ProductFilterRequest {
    filter?: string;
    categoryId?: string;
}

export interface ProductsState extends EntityState<ProductEntity, string> {
    loadingStatus: 'not loaded' | 'loaded' | 'loading' | 'new' | 'error';
    error?: string;
    selected?: ProductEntity;
    filterQuery?: string;
    filteredList?: ProductEntity[];
    pendingQuantityDeltas?: Record<string, number>;
}

export const productsAdapter = createEntityAdapter<ProductEntity, string>({
    selectId: (product) => product.id,
});

export const fetchProducts = createAsyncThunk(
    'products/fetchStatus',
    async (_, thunkAPI) => {
        const products = await ProductService.getAll();
        return products.map((p) => ProductEntityMapper.fromProduct(p));
    }
);

export const initialProductsState: ProductsState =
    productsAdapter.getInitialState({
        loadingStatus: 'not loaded',
        selected: undefined,
        filterQuery: undefined,
        filteredList: undefined,
        pendingQuantityDeltas: {},
    });

const applyPendingQuantityDeltasToIncoming = (
    incoming: ProductEntity[],
    previous: Record<string, ProductEntity | undefined>,
    pendingQuantityDeltas: Record<string, number> = {}
) => {
    const nextPending: Record<string, number> = {};

    const items = incoming.map((item) => {
        const pendingDelta = pendingQuantityDeltas[item.id];
        if (!pendingDelta) {
            return item;
        }

        const previousDisplayedQuantity = previous[item.id]?.quantity;
        if (
            previousDisplayedQuantity !== undefined &&
            item.quantity === previousDisplayedQuantity
        ) {
            return item;
        }

        nextPending[item.id] = pendingDelta;
        return {
            ...item,
            quantity: item.quantity + pendingDelta,
        };
    });

    return { items, nextPending };
};

export const productsSlice = createSlice({
    name: PRODUCT_FEATURE_KEY,
    initialState: initialProductsState,
    reducers: {
        setAll: (
            state: ProductsState,
            action: PayloadAction<ProductEntity[]>
        ) => {
            const previousEntities = { ...state.entities };
            const { items, nextPending } = applyPendingQuantityDeltasToIncoming(
                action.payload,
                previousEntities,
                state.pendingQuantityDeltas
            );
            productsAdapter.setAll(state, items);
            state.pendingQuantityDeltas = nextPending;
            state.loadingStatus = 'loaded';
            filterList(state, state.filterQuery);
        },
        add: (state: ProductsState, action: PayloadAction<ProductEntity>) => {
            productsAdapter.addOne(state, action.payload);
            filterList(state, state.filterQuery);
        },
        remove: (state: ProductsState, action: PayloadAction<string>) => {
            productsAdapter.removeOne(state, action.payload);
            filterList(state, state.filterQuery);
        },
        update: (
            state: ProductsState,
            action: PayloadAction<Update<ProductEntity, string>>
        ) => {
            productsAdapter.updateOne(state, action.payload);
            filterList(state, state.filterQuery);
        },
        applyRealtimePatch: (
            state: ProductsState,
            action: PayloadAction<
                Partial<ProductEntity> & { id: string }
            >
        ) => {
            const existing = state.entities[action.payload.id];
            if (!existing) return;

            productsAdapter.updateOne(state, {
                id: action.payload.id,
                changes: action.payload,
            });

            if (state.pendingQuantityDeltas?.[action.payload.id] !== undefined) {
                delete state.pendingQuantityDeltas[action.payload.id];
            }
            filterList(state, state.filterQuery);
        },
        select: (
            state: ProductsState,
            action: PayloadAction<ProductEntity>
        ) => {
            state.selected = action.payload;
        },
        clearSelection: (state: ProductsState) => {
            state.selected = undefined;
        },
        filter: (state: ProductsState, action: PayloadAction<string>) => {
            filterList(state, action.payload);
            state.filterQuery = action.payload;
        },
        error: (state: ProductsState, action: PayloadAction<Error>) => {
            state.error = action.payload.message;
        },
        reset: (state: ProductsState) => {
            productsAdapter.removeAll(state);
            state.error = initialProductsState.error;
            state.filterQuery = initialProductsState.filterQuery;
            state.filteredList = initialProductsState.filteredList;
            state.loadingStatus = initialProductsState.loadingStatus;
            state.selected = initialProductsState.selected;
            state.pendingQuantityDeltas = initialProductsState.pendingQuantityDeltas;
        },
        updateQuantities(
            state: ProductsState,
            action: PayloadAction<{ productId: string; newCount?: number | undefined }[]>
        ) {
            if (!action.payload) return;
            productsAdapter.updateMany(
                state,
                action.payload.map((p) => ({
                    id: p.productId,
                    changes: { quantity: p.newCount },
                }))
            );
        },
        applyQuantityDeltas(
            state: ProductsState,
            action: PayloadAction<{ productId: string; delta?: number | undefined }[]>
        ) {
            if (!action.payload) return;

            const updates = action.payload.flatMap((p) => {
                const delta = p.delta;
                if (
                    delta === undefined ||
                    delta === null ||
                    Number.isNaN(delta)
                ) {
                    return [];
                }

                const existing = state.entities[p.productId];
                if (!existing) {
                    return [];
                }

                return [{
                    id: p.productId,
                    changes: { quantity: (existing.quantity || 0) + delta },
                }];
            });

            if (updates.length === 0) return;
            productsAdapter.updateMany(state, updates);
            action.payload.forEach((p) => {
                const delta = p.delta;
                if (
                    delta === undefined ||
                    delta === null ||
                    Number.isNaN(delta)
                ) {
                    return;
                }

                state.pendingQuantityDeltas = state.pendingQuantityDeltas || {};
                state.pendingQuantityDeltas[p.productId] =
                    (state.pendingQuantityDeltas[p.productId] || 0) + delta;
            });
            filterList(state, state.filterQuery);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state: ProductsState) => {
                state.loadingStatus = 'loading';
            })
            .addCase(
                fetchProducts.fulfilled,
                (
                    state: ProductsState,
                    action: PayloadAction<ProductEntity[]>
                ) => {
                    const previousEntities = { ...state.entities };
                    const { items, nextPending } = applyPendingQuantityDeltasToIncoming(
                        action.payload,
                        previousEntities,
                        state.pendingQuantityDeltas
                    );
                    productsAdapter.setAll(state, items);
                    state.pendingQuantityDeltas = nextPending;
                    filterList(state, state.filterQuery);
                    state.loadingStatus = 'loaded';
                }
            )
            .addCase(fetchProducts.rejected, (state: ProductsState, action) => {
                state.loadingStatus = 'error';
                state.error = action.error.message;
            });
    },
});

/*
 * Export reducer for store configuration.
 */
export const productsReducer = productsSlice.reducer;

export const productsActions = productsSlice.actions;

export const getProductsState = (rootState: RootState): ProductsState =>
    rootState[PRODUCT_FEATURE_KEY];

const productSelectors = productsAdapter.getSelectors<RootState>(getProductsState);

export const selectAllProducts = createSelector(
    getProductsState,
    (state) => productSelectors.selectAll({ [PRODUCT_FEATURE_KEY]: state } as RootState)
);

export const selectProduct = (id: string) =>
    createSelector(getProductsState, (state) => state.entities[id]);

export const selectProductsEntities = createSelector(
    getProductsState,
    (state) => productSelectors.selectEntities({ [PRODUCT_FEATURE_KEY]: state } as RootState)
);

export const selectLoadingStatus = createSelector(
    getProductsState,
    (state: ProductsState) => state.loadingStatus
);

export const selectIsEmpty = createSelector(
    getProductsState,
    (state: ProductsState) => state.ids.length === 0
);

export const selectFilterQuery = createSelector(
    getProductsState,
    (state: ProductsState) => state.filterQuery
);

export const selectFilteredList = createSelector(
    getProductsState,
    (state: ProductsState) => state.filteredList
);

export const selectProductsByCategory = (id?: string) =>
    createSelector(getProductsState, (state: ProductsState) => {
        const products = productsAdapter.getSelectors().selectAll(state);
        return id
            ? products.filter((p) => p.productCategoryId === id)
            : products;
    });

function filterList(state: ProductsState, text?: string, categoryId?: string) {
    const allProducts = productsAdapter.getSelectors().selectAll(state);
    const res = ProductService.search(allProducts, { text, categoryId });

    // res.items.forEach(i => filteredList[i.id] = i);
    state.filteredList = res.items;
}
