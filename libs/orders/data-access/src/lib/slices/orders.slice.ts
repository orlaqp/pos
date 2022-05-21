// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { PrinterEntity, printReceipt } from '@pos/printings/data-access';
import { CartState } from '@pos/sales/data-access';
import { RootState } from '@pos/store';
import { StoreInfoEntity } from '@pos/store-info/data-access';
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
import { OrderEntity, OrderEntityMapper } from '../order.entity';
import { OrderService } from '../order.service';

export const ORDER_FEATURE_KEY = 'orders';

export interface SubmitOrderRequest {
    storeInfo?: StoreInfoEntity;
    defaultPrinter?: PrinterEntity;
    cart: CartState;
}

export interface SubmitOrderResponse extends SubmitOrderRequest {
    order: OrderEntity;
}

export interface OrdersState extends EntityState<OrderEntity> {
    loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
    submitStatus: 'not saved' | 'saving' | 'saved' | 'error';
    error?: string;
    submitError?: string;
    selected?: OrderEntity;
    filterQuery?: string;
    filteredList?: Dictionary<OrderEntity>;
}

export const ordersAdapter = createEntityAdapter<OrderEntity>();

export const fetchOpenOrders = createAsyncThunk(
    'orders/fetchStatus',
    async (_, thunkAPI) => {
        const orders = await OrderService.getOpenOrders();
        debugger;
        return orders.map((o) => OrderEntityMapper.fromModel(o));
    }
);

export const submitOrder = createAsyncThunk(
    'order/save',
    async (request: SubmitOrderRequest, thunkAPI) => {
        const o = await OrderService.saveOrder(request.cart);
        return {
            ...request,
            order: OrderEntityMapper.fromModel(o),
        };
    }
);

export const payOrder = createAsyncThunk(
    'order/pay',
    async (request: SubmitOrderRequest, thunkAPI) => {
        const o = await OrderService.payOrder(request.cart);

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
    filterQuery: undefined,
    filteredList: undefined,
});

export const ordersSlice = createSlice({
    name: ORDER_FEATURE_KEY,
    initialState: initialOrdersState,
    reducers: {
        add: (state: OrdersState, action: PayloadAction<OrderEntity>) => {
            ordersAdapter.addOne(state, action);
            filterList(state, state.filterQuery);
        },
        addMany: (state: OrdersState, action: PayloadAction<OrderEntity[]>) => {
            ordersAdapter.addMany(state, action);
            filterList(state, state.filterQuery);
        },
        remove: (state: OrdersState, action: PayloadAction<EntityId>) => {
            ordersAdapter.removeOne(state, action);
            filterList(state, state.filterQuery);
        },
        update: (
            state: OrdersState,
            action: PayloadAction<Update<OrderEntity>>
        ) => {
            ordersAdapter.updateOne(state, action);
            filterList(state, state.filterQuery);
        },
        select: (state: OrdersState, action: PayloadAction<OrderEntity>) => {
            state.selected = action.payload;
        },
        clearSelection: (state: OrdersState) => {
            state.selected = undefined;
        },
        filter: (state: OrdersState, action: PayloadAction<string>) => {
            filterList(state, action.payload);
            state.filterQuery = action.payload;
        },
        submitError: (state: OrdersState, action: PayloadAction<string>) => {
            state.submitStatus = 'error';
            state.submitError = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchOpenOrders.pending, (state: OrdersState) => {
                state.loadingStatus = 'loading';
            })
            .addCase(
                fetchOpenOrders.fulfilled,
                (state: OrdersState, action: PayloadAction<OrderEntity[]>) => {
                    ordersAdapter.setAll(state, action.payload);
                    filterList(state, state.filterQuery);
                    state.loadingStatus = 'loaded';
                }
            )
            .addCase(fetchOpenOrders.rejected, (state: OrdersState, action) => {
                state.loadingStatus = 'error';
                state.error = action.error.message;
            })
            .addCase(submitOrder.pending, (state: OrdersState) => {
                state.submitStatus = 'saving';
            })
            .addCase(
                submitOrder.fulfilled,
                (
                    state: OrdersState,
                    action: PayloadAction<SubmitOrderResponse>
                ) => {
                    ordersAdapter.addOne(state, action.payload.order);
                    state.submitStatus = 'saved';
                    printReceipt(
                        action.payload.storeInfo,
                        action.payload.defaultPrinter,
                        action.payload.cart,
                        action.payload.order
                    );
                }
            )
            .addCase(submitOrder.rejected, (state: OrdersState, action) => {
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
                        action.payload.storeInfo,
                        action.payload.defaultPrinter,
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

export const selectFilteredList = createSelector(
    getOrdersState,
    (state: OrdersState) => state.filteredList
);

function filterList(state: OrdersState, query?: string) {
    const filteredList: Dictionary<OrderEntity> = {};
    state.loadingStatus = 'loaded';

    if (!query) {
        state.filteredList = state.entities;
        return;
    }

    const lowerQuery = query.toLowerCase();

    state.ids.forEach((id) => {
        if (state.entities[id]?.id?.toLowerCase().indexOf(lowerQuery) === -1)
            return;

        filteredList[id] = state.entities[id];
    });

    state.filteredList = filteredList;
}
