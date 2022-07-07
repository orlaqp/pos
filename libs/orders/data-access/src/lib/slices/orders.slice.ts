/* eslint-disable @nrwl/nx/enforce-module-boundaries */
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { PrinterEntity, printReceipt } from '@pos/printings/data-access';
import { CartPayment, CartState } from '@pos/sales/data-access';
import { OrderStatus } from '@pos/shared/models';
import { RootState } from '@pos/store';
import { StoreInfoEntity } from '@pos/store-info/data-access';
import {
    createAsyncThunk,
    createEntityAdapter,
    createSelector,
    createSlice,
    EntityId,
    EntityState,
    PayloadAction,
} from '@reduxjs/toolkit';
import {
    OrderEntity,
    OrderEntityMapper,
} from '../order.entity';
import { FilterRequest, OrderService } from '../order.service';

export const ORDER_FEATURE_KEY = 'orders';

export interface CreateOrderRequest {
    storeInfo?: StoreInfoEntity;
    defaultPrinter?: PrinterEntity;
    cart: CartState;
}

export interface PayOrderRequest extends CreateOrderRequest {
    payments: CartPayment[];
}

export interface SubmitOrderResponse extends CreateOrderRequest {
    order: OrderEntity;
}

export interface OrdersState extends EntityState<OrderEntity> {
    loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
    submitStatus: 'not saved' | 'saving' | 'saved' | 'error';
    error?: string;
    submitError?: string;
    selected?: OrderEntity;
    filterQuery: FilterRequest;
    filteredList?: OrderEntity[];
}

export const ordersAdapter = createEntityAdapter<OrderEntity>();

// export const fetchOpenOrders = createAsyncThunk(
//     'orders/fetchStatus',
//     async (_, thunkAPI) => {
//         const orders = await OrderService.getOpenOrders();
//         return orders.map((o) => OrderEntityMapper.fromModel(o));
//     }
// );

export const createOrder = createAsyncThunk(
    'order/save',
    async (request: CreateOrderRequest, thunkAPI) => {
        const employee = (thunkAPI.getState() as RootState).employees.loginEmployee!;
        const o = await OrderService.saveOrder(employee, request.cart);
        return {
            ...request,
            order: OrderEntityMapper.fromModel(o),
        };
    }
);

export const payOrder = createAsyncThunk(
    'order/pay',
    async (request: PayOrderRequest, thunkAPI) => {
        const employee = (thunkAPI.getState() as RootState).employees.loginEmployee!;
        debugger;
        const o = await OrderService.saveOrder(employee, request.cart, 'PAID', request.payments);
        // const o = await OrderService.payOrder(request.cart);

        if (!o) return;

        return {
            ...request,
            order: OrderEntityMapper.fromModel(o),
        };
    }
);

export const initialOrdersState: OrdersState = ordersAdapter.getInitialState({
    loadingStatus: 'not loaded',
    submitStatus: 'not saved',
    selected: undefined,
    filterQuery: { status: OrderStatus.OPEN },
    filteredList: undefined,
});

export const ordersSlice = createSlice({
    name: ORDER_FEATURE_KEY,
    initialState: initialOrdersState,
    reducers: {
        setAll: (state: OrdersState, action: PayloadAction<OrderEntity[]>) => {
            ordersAdapter.setAll(state, action.payload);
            filterList(state, state.filterQuery);
            state.loadingStatus = 'loaded';
        },
        remove: (state: OrdersState, action: PayloadAction<EntityId>) => {
            ordersAdapter.removeOne(state, action);
            filterList(state, state.filterQuery);
        },
        clearSelection: (state: OrdersState) => {
            state.selected = undefined;
        },
        filter: (state: OrdersState, action: PayloadAction<FilterRequest>) => {
            state.filterQuery = action.payload;
            filterList(state, action.payload);
        },
        submitError: (state: OrdersState, action: PayloadAction<string>) => {
            state.submitStatus = 'error';
            state.submitError = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createOrder.pending, (state: OrdersState) => {
                state.submitStatus = 'saving';
            })
            .addCase(
                createOrder.fulfilled,
                (
                    state: OrdersState,
                    action: PayloadAction<SubmitOrderResponse>
                ) => {
                    ordersAdapter.addOne(state, action.payload.order);
                    state.submitStatus = 'saved';
                    printReceipt(
                        action.payload.storeInfo!,
                        action.payload.defaultPrinter!,
                        action.payload.cart,
                        action.payload.order
                    );
                }
            )
            .addCase(createOrder.rejected, (state: OrdersState, action) => {
                state.submitStatus = 'error';
                state.error = action.error.message;
            })
            .addCase(
                payOrder.fulfilled,
                (
                    state: OrdersState,
                    action: PayloadAction<SubmitOrderResponse | undefined>
                ) => {
                    if (!action.payload) return;

                    ordersAdapter.updateOne(state, {
                        id: action.payload.order.id,
                        changes: action.payload.order,
                    });
                    state.submitStatus = 'saved';
                    printReceipt(
                        action.payload.storeInfo!,
                        action.payload.defaultPrinter!,
                        action.payload.cart,
                        action.payload.order
                    );
                }
            );
    },
});

/*
 * Export reducer for store configuration.
 */
export const ordersReducer = ordersSlice.reducer;

export const ordersActions = ordersSlice.actions;
const { selectAll, selectEntities } = ordersAdapter.getSelectors();

export const getOrdersState = (rootState: RootState): OrdersState =>
    rootState[ORDER_FEATURE_KEY];

export const selectAllOrders = createSelector(getOrdersState, selectAll);
export const selectOpenOrders = createSelector(getOrdersState, (state) =>
    ordersAdapter
        .getSelectors()
        .selectAll(state)
        .filter((o) => o.status === 'OPEN')
);

export const selectOrderLines = (id: string) => createSelector(getOrdersState, (state) =>
    state.entities[id]?.lines
);

export const selectOrdersEntities = createSelector(
    getOrdersState,
    selectEntities
);

export const selectLoadingStatus = createSelector(
    getOrdersState,
    (state: OrdersState) => state.loadingStatus
);

export const selectIsEmpty = createSelector(
    getOrdersState,
    (state: OrdersState) => state.ids.length === 0
);

export const selectFilteredOrderList = createSelector(
    getOrdersState,
    (state: OrdersState) => state.filteredList
);

function filterList(state: OrdersState, options: FilterRequest) {
    state.filteredList = OrderService.search(
        ordersAdapter.getSelectors().selectAll(state),
        options
    );
    state.loadingStatus = 'loaded';
}
