/* eslint-disable @nx/enforce-module-boundaries */
// eslint-disable-next-line @nx/enforce-module-boundaries
import { PrinterEntity, printReceipt } from '@pos/printings/data-access';
import { CartPayment, CartState } from '@pos/sales/data-access';
import { Order, OrderStatus } from '@pos/shared/models';
import { RootState } from '@pos/store';
import { StoreInfoEntity } from '@pos/store-info/data-access';
import {
    createAsyncThunk,
    createEntityAdapter,
    createSelector,
    createSlice,
    EntityState,
    PayloadAction,
} from '@reduxjs/toolkit';
import { OrderEntity, OrderEntityMapper } from '../order.entity';
import { FilterRequest, OrderService } from '../order.service';

export const ORDER_FEATURE_KEY = 'orders';

export interface CreateOrderRequest {
    storeInfo?: StoreInfoEntity;
    defaultPrinter?: PrinterEntity;
    cart: CartState;
    skipAutoPrint?: boolean;
}

export interface PayOrderRequest extends CreateOrderRequest {
    payments: CartPayment[];
}

export interface SubmitOrderResponse extends CreateOrderRequest {
    order: OrderEntity;
}

export interface OrdersState extends EntityState<OrderEntity, string> {
    loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
    submitStatus: 'not saved' | 'saving' | 'saved' | 'error';
    error?: string;
    submitError?: string;
    selected?: OrderEntity;
    filterQuery: FilterRequest;
    filteredList?: OrderEntity[];
    pendingStatusOverrides: Record<string, OrderStatus | keyof typeof OrderStatus | undefined>;
}

export const ordersAdapter = createEntityAdapter<OrderEntity, string>({
    selectId: (order) => order.id,
});

// export const fetchOpenOrders = createAsyncThunk(
//     'orders/fetchStatus',
//     async (_, thunkAPI) => {
//         const orders = await OrderService.getOpenOrders();
//         return orders.map((o) => OrderEntityMapper.fromModel(o));
//     }
// );

export const upsertOrder = createAsyncThunk(
    'order/save',
    async (request: CreateOrderRequest, thunkAPI) => {
        const employee = (thunkAPI.getState() as RootState).employees
            .loginEmployee!;
        const shouldAttemptUpdate =
            !!request.cart.id && !!request.cart.header?.orderNumber;

        let o: Order | null;
        if (shouldAttemptUpdate) {
            const updatedOrder = await OrderService.update({
                id: request.cart.id,
                by: employee as any,
                order: request.cart,
            });
            o = updatedOrder;
        } else {
            o = null;
        }

        if (!o) {
            o = await OrderService.create({
                by: employee as any,
                order: request.cart,
            });
        }

        return {
            ...request,
            order: OrderEntityMapper.fromModel(o),
        };
    }
);

export const payOrder = createAsyncThunk(
    'order/pay',
    async (request: PayOrderRequest, thunkAPI) => {
        const employee = (thunkAPI.getState() as RootState).employees
            .loginEmployee!;
        const o = await OrderService.closeOrder({
            id: request.cart.id!,
            by: employee as any,
            order: request.cart,
            payments: request.payments,
        });
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
    pendingStatusOverrides: {},
});

export const ordersSlice = createSlice({
    name: ORDER_FEATURE_KEY,
    initialState: initialOrdersState,
    reducers: {
        setAll: (state: OrdersState, action: PayloadAction<OrderEntity[]>) => {
            ordersAdapter.setAll(
                state,
                action.payload.map((order) => applyPendingOverride(order, state.pendingStatusOverrides))
            );
            filterList(state, state.filterQuery);
            state.loadingStatus = 'loaded';
        },
        remove: (state: OrdersState, action: PayloadAction<string>) => {
            ordersAdapter.removeOne(state, action.payload);
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
        optimisticMarkPaid: (
            state: OrdersState,
            action: PayloadAction<{
                id: string;
                payments: CartPayment[];
                employeeId?: string;
                employeeName?: string;
            }>
        ) => {
            state.pendingStatusOverrides[action.payload.id] = 'PAID';
            ordersAdapter.updateOne(state, {
                id: action.payload.id,
                changes: {
                    status: 'PAID',
                    paymentInfo: {
                        employeeId: action.payload.employeeId,
                        employeeName: action.payload.employeeName,
                        payments: action.payload.payments.map((payment) => ({
                            type: payment.type.toUpperCase() as OrderEntity['paymentInfo']['payments'][number]['type'],
                            amount: payment.amount,
                        })),
                    },
                },
            });
            filterList(state, state.filterQuery);
        },
        optimisticRestoreOpen: (
            state: OrdersState,
            action: PayloadAction<{
                id: string;
            }>
        ) => {
            delete state.pendingStatusOverrides[action.payload.id];
            ordersAdapter.updateOne(state, {
                id: action.payload.id,
                changes: {
                    status: 'OPEN',
                    paymentInfo: null,
                },
            });
            filterList(state, state.filterQuery);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(upsertOrder.pending, (state: OrdersState) => {
                state.submitStatus = 'saving';
            })
            .addCase(
                upsertOrder.fulfilled,
                (
                    state: OrdersState,
                    action: PayloadAction<SubmitOrderResponse>
                ) => {
                    ordersAdapter.upsertOne(state, action.payload.order);
                    filterList(state, state.filterQuery);
                    state.submitStatus = 'saved';
                    if (!action.payload.skipAutoPrint) {
                        printReceipt(
                            normalizeReceiptStoreInfo(action.payload.storeInfo),
                            action.payload.defaultPrinter!,
                            action.payload.cart,
                            {
                                ...normalizeReceiptOrder(action.payload.order),
                                copyType: 'CUSTOMER',
                            }
                        );
                    }
                }
            )
            .addCase(upsertOrder.rejected, (state: OrdersState, action) => {
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

                    delete state.pendingStatusOverrides[action.payload.order.id];
                    ordersAdapter.updateOne(state, {
                        id: action.payload.order.id,
                        changes: action.payload.order,
                    });
                    filterList(state, state.filterQuery);
                    state.submitStatus = 'saved';
                    if (!action.payload.skipAutoPrint) {
                        printReceipt(
                            normalizeReceiptStoreInfo(action.payload.storeInfo),
                            action.payload.defaultPrinter!,
                            action.payload.cart,
                            {
                                ...normalizeReceiptOrder(action.payload.order),
                                copyType: 'MERCHANT',
                            }
                        );
                    }
                }
            )
            .addCase(payOrder.rejected, (state: OrdersState, action) => {
                const orderId = action.meta.arg?.cart?.id;
                if (orderId) {
                    delete state.pendingStatusOverrides[orderId];
                }
                state.submitStatus = 'error';
                state.error = action.error.message;
            });
    },
});

/*
 * Export reducer for store configuration.
 */
export const ordersReducer = ordersSlice.reducer;

export const ordersActions = ordersSlice.actions;
export const getOrdersState = (rootState: RootState): OrdersState =>
    rootState[ORDER_FEATURE_KEY];

const orderSelectors = ordersAdapter.getSelectors<RootState>(getOrdersState);

export const selectAllOrders = createSelector(
    getOrdersState,
    (state) => ordersAdapter.getSelectors<OrdersState>((ordersState) => ordersState).selectAll(state)
);
export const selectOpenOrders = createSelector(getOrdersState, (state) =>
    ordersAdapter
        .getSelectors()
        .selectAll(state)
        .filter((o) => o.status === 'OPEN')
);

export const selectOrderLines = (id: string) =>
    createSelector(getOrdersState, (state) => state.entities[id]?.lines);

export const selectOrdersEntities = createSelector(
    getOrdersState,
    (state) => ordersAdapter.getSelectors<OrdersState>((ordersState) => ordersState).selectEntities(state)
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

function normalizeReceiptStoreInfo(storeInfo?: StoreInfoEntity) {
    return {
        name: storeInfo?.name ?? undefined,
        address: storeInfo?.address ?? undefined,
        city: storeInfo?.city ?? undefined,
        state: storeInfo?.state ?? undefined,
        zipCode: storeInfo?.zipCode ?? undefined,
        phone: storeInfo?.phone ?? undefined,
        fax: storeInfo?.fax ?? undefined,
        email: storeInfo?.email ?? undefined,
        disclaimer: storeInfo?.disclaimer ?? undefined,
    };
}

function applyPendingOverride(
    order: OrderEntity,
    pendingOverrides: OrdersState['pendingStatusOverrides']
) {
    const pendingStatus = pendingOverrides[order.id];
    if (!pendingStatus) {
        return order;
    }

    return {
        ...order,
        status: pendingStatus,
    };
}

function normalizeReceiptOrder(order?: OrderEntity) {
    if (!order) return undefined;
    return {
        id: order.id,
        status: order.status,
        orderNo: order.orderNo,
        paymentInfo: order.paymentInfo
            ? {
                  payments: order.paymentInfo.payments?.map((payment) => ({
                      type: String(payment.type),
                      amount: payment.amount,
                  })),
              }
            : undefined,
        lines:
            order.lines?.map((line) => ({
                quantity: line.quantity,
                productName: line.productName,
                ebtPaidAmount: line.ebtPaidAmount ?? undefined,
                nonEbtPaidAmount: line.nonEbtPaidAmount ?? undefined,
            })) ?? undefined,
    };
}
