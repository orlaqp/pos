import { ProductEntity } from '@pos/products/data-access';
import {
    createAsyncThunk,
    createEntityAdapter,
    createSelector,
    createSlice,
    EntityState,
    PayloadAction,
} from '@reduxjs/toolkit';

export const CART_FEATURE_KEY = 'Cart';

export interface SlicesCartState extends EntityState<ProductEntity> {
    loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
    error?: string;
}

export const slicesCartAdapter = createEntityAdapter<ProductEntity>();

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

export const initialSlicesCartState: SlicesCartState =
    slicesCartAdapter.getInitialState({
        loadingStatus: 'not loaded',
        error: undefined,
    });

export const slicesCartSlice = createSlice({
    name: CART_FEATURE_KEY,
    initialState: initialSlicesCartState,
    reducers: {
        add: slicesCartAdapter.addOne,
        remove: slicesCartAdapter.removeOne,
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
export const slicesCartReducer = slicesCartSlice.reducer;

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
export const slicesCartActions = slicesCartSlice.actions;

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
const { selectAll, selectEntities } = slicesCartAdapter.getSelectors();

export const getSlicesCartState = (rootState: unknown): SlicesCartState =>
    rootState[CART_FEATURE_KEY];

export const selectAllSlicesCart = createSelector(
    getSlicesCartState,
    selectAll
);

export const selectSlicesCartEntities = createSelector(
    getSlicesCartState,
    selectEntities
);
