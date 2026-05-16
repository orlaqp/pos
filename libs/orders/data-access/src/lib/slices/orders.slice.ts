/* eslint-disable @nx/enforce-module-boundaries */
// eslint-disable-next-line @nx/enforce-module-boundaries
import { PrinterEntity, printReceipt } from '@pos/printings/data-access';
import { productsActions } from '@pos/products/data-access';
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
    Update,
} from '@reduxjs/toolkit';
import { OrderEntity, OrderEntityMapper } from '../order.entity';
import { FilterRequest, OrderService } from '../order.service';
import {
    PendingOrderJournalEntry,
    PendingOrderSyncState,
} from '../pending-order-journal';

export const ORDER_FEATURE_KEY = 'orders';
const EMPTY_REFUNDED_QUANTITIES: Record<string, number> = {};

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

export interface OrderRefundRecordSnapshot {
    id: string;
    orderId: string;
    refundAmount: number;
    refundDate?: string | null;
    refundPayments?: Array<{
        type: string;
        amount: number;
    }>;
}

export interface OrderRefundLineRecordSnapshot {
    id: string;
    orderId: string;
    orderLineIdentifier: string;
    quantityRefunded: number;
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
    pendingOrderSyncState: Record<string, PendingOrderSyncState>;
    pendingOrderLastError: Record<string, string | undefined>;
    refundedAmountsByOrderId: Record<string, number>;
    refundedQuantitiesByOrderId: Record<string, Record<string, number>>;
}

const ORDER_COMPARISON_FIELDS: Array<keyof OrderEntity> = [
    'orderNo',
    'baseSubtotal',
    'subtotal',
    'lineDiscountTotal',
    'orderDiscountTotal',
    'discountTotal',
    'savingsTotal',
    'tax',
    'total',
    'currentSubtotal',
    'currentDiscountTotal',
    'currentTax',
    'currentTotal',
    'status',
    'employeeId',
    'employeeName',
    'pricingVersion',
    'pricingSnapshotHash',
    'pricingSource',
    'reconciliationStatus',
    'orderDate',
    'createdAt',
    'updatedAt',
];

const areOrdersEquivalent = (
    left: OrderEntity | undefined,
    right: OrderEntity
) => {
    if (!left) {
        return false;
    }

    const primitiveFieldsEqual = ORDER_COMPARISON_FIELDS.every(
        (field) => left[field] === right[field]
    );

    if (!primitiveFieldsEqual) {
        return false;
    }

    return (
        JSON.stringify(left.promoCodes || null) ===
            JSON.stringify(right.promoCodes || null) &&
        JSON.stringify(left.appliedDiscountSummary || null) ===
            JSON.stringify(right.appliedDiscountSummary || null) &&
        JSON.stringify(left.lines || null) ===
            JSON.stringify(right.lines || null) &&
        JSON.stringify(left.payments || null) ===
            JSON.stringify(right.payments || null) &&
        JSON.stringify(left.paymentInfo || null) ===
            JSON.stringify(right.paymentInfo || null) &&
        JSON.stringify(left.refundInfo || null) ===
            JSON.stringify(right.refundInfo || null)
    );
};

const reconcileIncomingOrders = (
    state: OrdersState,
    incoming: OrderEntity[]
) => {
    const nextOrders = incoming.map((order) => {
        const pendingStatus = state.pendingStatusOverrides[order.id];
        if (pendingStatus && order.status === pendingStatus) {
            delete state.pendingStatusOverrides[order.id];
        } else if (
            pendingStatus === 'PAID' &&
            (order.status === 'PARTIALLY_REFUNDED' ||
                order.status === 'REFUNDED')
        ) {
            delete state.pendingStatusOverrides[order.id];
        }

        return applyPendingOverride(order, state.pendingStatusOverrides);
    });
    const previousIds = (state.ids as string[]) || [];
    const nextIds = new Set(nextOrders.map((order) => order.id));
    const removals = previousIds.filter((id) => !nextIds.has(id));
    const additions: OrderEntity[] = [];
    const updates: Update<OrderEntity, string>[] = [];

    nextOrders.forEach((order) => {
        const existing = state.entities[order.id];

        if (!existing) {
            additions.push(order);
            return;
        }

        if (areOrdersEquivalent(existing, order)) {
            return;
        }

        const { id, ...changes } = order;
        updates.push({
            id,
            changes,
        });
    });

    if (removals.length > 0) {
        ordersAdapter.removeMany(state, removals);
    }

    if (additions.length > 0) {
        ordersAdapter.addMany(state, additions);
    }

    if (updates.length > 0) {
        ordersAdapter.updateMany(state, updates);
    }

    if (removals.length > 0 || additions.length > 0 || updates.length > 0) {
        filterList(state, state.filterQuery);
        return;
    }

    state.loadingStatus = 'loaded';
};

const buildPendingInventoryDeltas = (
    order: Pick<OrderEntity, 'lines'>,
    multiplier: number
) => {
    const summary = (order.lines || []).reduce<Record<string, number>>(
        (acc, line) => {
            if (!line?.productId) {
                return acc;
            }

            acc[line.productId] =
                (acc[line.productId] || 0) +
                multiplier * Number(line.quantity || 0);
            return acc;
        },
        {}
    );

    return Object.entries(summary).map(([productId, delta]) => ({
        productId,
        delta,
    }));
};

export const ordersAdapter = createEntityAdapter<OrderEntity, string>({
    selectId: (order) => order.id,
    sortComparer: (left, right) =>
        (left.createdAt || '').localeCompare(right.createdAt || ''),
});
const ordersEntitySelectors = ordersAdapter.getSelectors<OrdersState>(
    (ordersState) => ordersState
);

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
                id: request.cart.id!,
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
            order: OrderEntityMapper.fromModel(o as Order),
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

        thunkAPI.dispatch(
            productsActions.applyQuantityDeltas(
                buildPendingInventoryDeltas(
                    OrderEntityMapper.fromModel(o),
                    -1
                )
            )
        );

        return {
            ...request,
            order: OrderEntityMapper.fromModel(o),
        };
    }
);

export const submitOrderAndPay = createAsyncThunk(
    'order/submitAndPay',
    async (request: PayOrderRequest, thunkAPI) => {
        const employee = (thunkAPI.getState() as RootState).employees
            .loginEmployee!;
        const paidOrder = await OrderService.createPaidOrder({
            by: employee as any,
            order: request.cart,
            payments: request.payments,
        });

        if (!paidOrder) return;

        thunkAPI.dispatch(
            productsActions.applyQuantityDeltas(
                buildPendingInventoryDeltas(
                    OrderEntityMapper.fromModel(paidOrder),
                    -1
                )
            )
        );

        return {
            ...request,
            cart: {
                ...request.cart,
                id: paidOrder.id,
                orderNo: paidOrder.orderNo,
            },
            order: OrderEntityMapper.fromModel(paidOrder),
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
    pendingOrderSyncState: {},
    pendingOrderLastError: {},
    refundedAmountsByOrderId: {},
    refundedQuantitiesByOrderId: {},
});

export const ordersSlice = createSlice({
    name: ORDER_FEATURE_KEY,
    initialState: initialOrdersState,
    reducers: {
        setAll: (state: OrdersState, action: PayloadAction<OrderEntity[]>) => {
            reconcileIncomingOrders(state, action.payload);
        },
        remove: (state: OrdersState, action: PayloadAction<string>) => {
            ordersAdapter.removeOne(state, action.payload);
            filterList(state, state.filterQuery);
        },
        clearSelection: (state: OrdersState) => {
            state.selected = undefined;
        },
        hydratePendingOrders: (
            state: OrdersState,
            action: PayloadAction<PendingOrderJournalEntry[]>
        ) => {
            state.pendingOrderSyncState = Object.fromEntries(
                action.payload.map((entry) => [entry.orderId, entry.syncState])
            );
            state.pendingOrderLastError = Object.fromEntries(
                action.payload.map((entry) => [entry.orderId, entry.lastError])
            );
        },
        markPendingOrderSyncState: (
            state: OrdersState,
            action: PayloadAction<{
                orderId: string;
                syncState: PendingOrderSyncState;
                error?: string;
            }>
        ) => {
            state.pendingOrderSyncState[action.payload.orderId] =
                action.payload.syncState;
            state.pendingOrderLastError[action.payload.orderId] =
                action.payload.error;
        },
        markAllPendingOrdersSyncFailed: (
            state: OrdersState,
            action: PayloadAction<string | undefined>
        ) => {
            Object.keys(state.pendingOrderSyncState).forEach((orderId) => {
                if (state.pendingOrderSyncState[orderId] !== 'synced') {
                    state.pendingOrderSyncState[orderId] = 'sync_failed';
                    state.pendingOrderLastError[orderId] = action.payload;
                }
            });
        },
        clearPendingOrderTracking: (
            state: OrdersState,
            action: PayloadAction<string[]>
        ) => {
            action.payload.forEach((orderId) => {
                delete state.pendingOrderSyncState[orderId];
                delete state.pendingOrderLastError[orderId];
            });
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
        setRefundRecords: (
            state: OrdersState,
            action: PayloadAction<OrderRefundRecordSnapshot[]>
        ) => {
            state.refundedAmountsByOrderId = action.payload.reduce<
                Record<string, number>
            >((acc, refund) => {
                const orderId = String(refund.orderId || '');
                if (!orderId) {
                    return acc;
                }

                acc[orderId] =
                    Number(
                        (
                            (acc[orderId] || 0) +
                            Number(refund.refundAmount || 0)
                        ).toFixed(2)
                    );
                return acc;
            }, {});
        },
        setRefundLineRecords: (
            state: OrdersState,
            action: PayloadAction<OrderRefundLineRecordSnapshot[]>
        ) => {
            state.refundedQuantitiesByOrderId = action.payload.reduce<
                Record<string, Record<string, number>>
            >((acc, line) => {
                const orderId = String(line.orderId || '');
                const identifier = String(line.orderLineIdentifier || '');

                if (!orderId || !identifier) {
                    return acc;
                }

                const orderLines = acc[orderId] || {};
                orderLines[identifier] =
                    (orderLines[identifier] || 0) +
                    Number(line.quantityRefunded || 0);
                acc[orderId] = orderLines;
                return acc;
            }, {});
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
                    state.pendingOrderSyncState[action.payload.order.id] =
                        'sync_pending';
                    delete state.pendingOrderLastError[action.payload.order.id];
                    filterList(state, state.filterQuery);
                    state.submitStatus = 'saved';
                    if (!action.payload.skipAutoPrint) {
                        const ticket =
                            OrderService.buildPrintTicketForOrderEntitySnapshot(
                                action.payload.order,
                                {
                                    copyType: 'CUSTOMER',
                                }
                            );
                        printReceipt(
                            normalizeReceiptStoreInfo(action.payload.storeInfo),
                            action.payload.defaultPrinter!,
                            ticket
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

                    state.pendingStatusOverrides[action.payload.order.id] = 'PAID';
                    state.pendingOrderSyncState[action.payload.order.id] =
                        'sync_pending';
                    delete state.pendingOrderLastError[action.payload.order.id];
                    ordersAdapter.updateOne(state, {
                        id: action.payload.order.id,
                        changes: action.payload.order,
                    });
                    filterList(state, state.filterQuery);
                    state.submitStatus = 'saved';
                    if (!action.payload.skipAutoPrint) {
                        const ticket =
                            OrderService.buildPrintTicketForOrderEntitySnapshot(
                                action.payload.order,
                                {
                                    copyType: 'MERCHANT',
                                }
                            );
                        printReceipt(
                            normalizeReceiptStoreInfo(action.payload.storeInfo),
                            action.payload.defaultPrinter!,
                            ticket
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
            })
            .addCase(
                submitOrderAndPay.fulfilled,
                (
                    state: OrdersState,
                    action: PayloadAction<SubmitOrderResponse | undefined>
                ) => {
                    if (!action.payload) return;

                    state.pendingStatusOverrides[action.payload.order.id] = 'PAID';
                    state.pendingOrderSyncState[action.payload.order.id] =
                        'sync_pending';
                    delete state.pendingOrderLastError[action.payload.order.id];
                    ordersAdapter.upsertOne(state, action.payload.order);
                    filterList(state, state.filterQuery);
                    state.submitStatus = 'saved';
                }
            )
            .addCase(submitOrderAndPay.rejected, (state: OrdersState, action) => {
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

export const selectAllOrders = createSelector(
    getOrdersState,
    ordersEntitySelectors.selectAll
);
export const selectOpenOrders = createSelector(getOrdersState, (state) =>
    ordersEntitySelectors.selectAll(state).filter((o) => o.status === 'OPEN')
);

export const selectOrderLines = (id: string) =>
    createSelector(getOrdersState, (state) => state.entities[id]?.lines);

export const selectOrdersEntities = createSelector(
    getOrdersState,
    ordersEntitySelectors.selectEntities
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

export const selectPendingOrderSyncState = createSelector(
    getOrdersState,
    (state: OrdersState) => state.pendingOrderSyncState
);

export const selectPendingUnsyncedOrderCount = createSelector(
    getOrdersState,
    (state: OrdersState) =>
        Object.values(state.pendingOrderSyncState).filter(
            (value) => value !== 'synced'
        ).length
);

export const selectHasPendingUnsyncedOrders = createSelector(
    selectPendingUnsyncedOrderCount,
    (count) => count > 0
);

export const selectRefundedAmountForOrder = (
    rootState: RootState,
    orderId?: string
) => {
    if (!orderId) {
        return 0;
    }

    return getOrdersState(rootState).refundedAmountsByOrderId[orderId] || 0;
};

export const selectRefundedQuantitiesForOrder = (
    rootState: RootState,
    orderId?: string
) => {
    if (!orderId) {
        return EMPTY_REFUNDED_QUANTITIES;
    }

    return (
        getOrdersState(rootState).refundedQuantitiesByOrderId[orderId] ||
        EMPTY_REFUNDED_QUANTITIES
    );
};

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
