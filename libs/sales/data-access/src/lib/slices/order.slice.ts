import { PrinterEntity } from './../../../../../printings/data-access/src/lib/slices/printer.entity';
import { StoreInfoEntity } from 'libs/store-info/data-access/src/lib/slices/store-info.entity';
import { printReceipt } from '@pos/printings/data-access';
import { RootState } from '@pos/store';
import {
    createAsyncThunk,
    createEntityAdapter,
    createSelector,
    createSlice,
    EntityState,
    PayloadAction,
} from '@reduxjs/toolkit';
import { CartState } from '../cart-entity';
import { OrderEntity, OrderEntityMapper } from '../order.entity';
import { saveOrder } from '../order.service';

export const ORDER_FEATURE_KEY = 'order';

export interface SubmitOrderRequest {
    storeInfo?: StoreInfoEntity;
    defaultPrinter?: PrinterEntity;
    cart: CartState;
}

export interface SubmitOrderResponse extends SubmitOrderRequest {
    order: OrderEntity;
}

export interface OrderState extends EntityState<OrderEntity> {
    orderStatus: 'new' | 'saving' | 'saved' | 'error';
    error?: string;
}

export const orderAdapter = createEntityAdapter<OrderEntity>();
export const submitOrder = createAsyncThunk(
    'order/save',
    async (request: SubmitOrderRequest, thunkAPI) => {
        const o = await saveOrder(request.cart);
        return {
            ...request,
            order: o,
        };
    }
);

export const initialOrderState: OrderState = orderAdapter.getInitialState({
    orderStatus: 'new',
    error: undefined,
});

export const orderSlice = createSlice({
    name: ORDER_FEATURE_KEY,
    initialState: initialOrderState,
    reducers: {
        setAll: (state: OrderState, action: PayloadAction<OrderEntity[]>) => {
            orderAdapter.setAll(state, action.payload);
            state.orderStatus = 'saved';
            // filterList(state, state.filterQuery);
        },
        error: (state: OrderState, action: PayloadAction<Error>) => {
            state.error = action.payload.message;
        },
        add: orderAdapter.addOne,
        remove: orderAdapter.removeOne,
        // ...
    },
    extraReducers: (builder) => {
        builder
            .addCase(submitOrder.pending, (state: OrderState) => {
                state.orderStatus = 'saving';
            })
            .addCase(
                submitOrder.fulfilled,
                (
                    state: OrderState,
                    action: PayloadAction<SubmitOrderResponse>
                ) => {
                    orderAdapter.addOne(state, action.payload.order);
                    state.orderStatus = 'saved';
                    printReceipt(
                        action.payload.storeInfo,
                        action.payload.defaultPrinter,
                        action.payload.cart,
                        action.payload.order
                    );
                }
            )
            .addCase(submitOrder.rejected, (state: OrderState, action) => {
                state.orderStatus = 'error';
                state.error = action.error.message;
            });
    },
});

/*
 * Export reducer for store configuration.
 */
export const orderReducer = orderSlice.reducer;
export const orderActions = orderSlice.actions;

const { selectAll, selectEntities } = orderAdapter.getSelectors();

export const getOrderState = (rootState: RootState): OrderState =>
    rootState[ORDER_FEATURE_KEY];

export const selectAllOrder = createSelector(getOrderState, selectAll);

export const selectOrderEntities = createSelector(
    getOrderState,
    selectEntities
);

export const getOrderStatus = createSelector(
    getOrderState,
    (state: OrderState) => state.orderStatus
);
