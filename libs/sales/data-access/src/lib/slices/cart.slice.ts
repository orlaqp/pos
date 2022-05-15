import { RootState } from '@pos/store';
import { ProductEntity } from '@pos/products/data-access';
import {
    createAsyncThunk,
    createEntityAdapter,
    createSelector,
    createSlice,
    EntityState,
    PayloadAction,
} from '@reduxjs/toolkit';

export const CART_FEATURE_KEY = 'cart';

export interface CartState extends EntityState<ProductEntity> {
    loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
    error?: string;
    selected?: ProductEntity;
}

export const cartAdapter = createEntityAdapter<ProductEntity>();

// export const fetchSlicesCart = createAsyncThunk(
//     'slicesCart/fetchStatus',
//     async (_, thunkAPI) => {
//         /**
//          * Replace this with your custom fetch call.
//          * For example, `return myApi.getSlicesCarts()`;
//          * Right now we just return an empty array.
//          */
//         return Promise.resolve([]);
//     }
// );

export const initialCartState: CartState =
    cartAdapter.getInitialState({
        loadingStatus: 'not loaded',
        error: undefined,
        selected: undefined,
    });

export const cartSlice = createSlice({
    name: CART_FEATURE_KEY,
    initialState: initialCartState,
    reducers: {
        select: (state: CartState, action: PayloadAction< ProductEntity | undefined >) => {
            state.selected = action.payload;
        },
        add: cartAdapter.addOne,
        remove: cartAdapter.removeOne,
        // ...
    },
    // extraReducers: (builder) => {
    //     builder
    //         .addCase(fetchSlicesCart.pending, (state: SlicesCartState) => {
    //             state.loadingStatus = 'loading';
    //         })
    //         .addCase(
    //             fetchSlicesCart.fulfilled,
    //             (
    //                 state: SlicesCartState,
    //                 action: PayloadAction<SlicesCartEntity[]>
    //             ) => {
    //                 slicesCartAdapter.setAll(state, action.payload);
    //                 state.loadingStatus = 'loaded';
    //             }
    //         )
    //         .addCase(
    //             fetchSlicesCart.rejected,
    //             (state: SlicesCartState, action) => {
    //                 state.loadingStatus = 'error';
    //                 state.error = action.error.message;
    //             }
    //         );
    // },
});

/*
 * Export reducer for store configuration.
 */
export const cartReducer = cartSlice.reducer;

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
 *   dispatch(slicesCartActions.add({ id: 1 }))
 * }, [dispatch]);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#usedispatch
 */
export const cartActions = cartSlice.actions;

/*
 * Export selectors to query state. For use with the `useSelector` hook.
 *
 * e.g.
 * ```
 * import { useSelector } from 'react-redux';
 *
 * // ...
 *
 * const entities = useSelector(selectAllSlicesCart);
 * ```
 *
 * See: https://react-redux.js.org/next/api/hooks#useselector
 */
const { selectAll, selectEntities } = cartAdapter.getSelectors();

export const getSlicesCartState = (rootState: RootState): CartState =>
    rootState[CART_FEATURE_KEY];

export const selectAllSlicesCart = createSelector(
    getSlicesCartState,
    selectAll
);

export const selectSlicesCartEntities = createSelector(
    getSlicesCartState,
    selectEntities
);

export const selectActiveProduct = createSelector(
    getSlicesCartState,
    (state: CartState) => state.selected
);
