import moment from 'moment';
import { Dispatch } from '@reduxjs/toolkit';
import { DataStore } from '@pos/shared/amplify';
import { createSharedObserveQueryManager } from '@pos/shared/data-store';
import { Order, OrderRefund, OrderRefundLine } from '@pos/shared/models';
import { sortByCreatedAt } from '@pos/shared/utils';
import { logSyncDebug, startSyncMeasure } from '@pos/shared/utils';
import { OrderEntityMapper } from './order.entity';
import {
    ordersActions,
    OrderRefundLineRecordSnapshot,
    OrderRefundRecordSnapshot,
} from './slices/orders.slice';

const LAST_CLOSED_ORDER_DAYS = 3;
const ORDER_SYNC_MODEL = 'orders';
export const ORDER_SYNC_STALE_THRESHOLD_MS = 60_000;

const getRecentClosedSince = () =>
    moment().subtract(LAST_CLOSED_ORDER_DAYS, 'days').toISOString();

const isNotDeleted = (item: { _deleted?: boolean | null } | null | undefined) =>
    !!item && item._deleted !== true;

const filterVisibleRefunds = (items: OrderRefund[]) =>
    items.filter((refund) => isNotDeleted(refund as { _deleted?: boolean | null }));

const filterVisibleRefundLines = (items: OrderRefundLine[]) =>
    items.filter((line) => isNotDeleted(line as { _deleted?: boolean | null }));

const summarizeOrders = (items: Order[]) =>
    items.slice(0, 5).map((order) => ({
        id: order.id,
        orderNo: order.orderNo,
        status: order.status,
        orderDate: order.orderDate,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
    }));

const filterVisibleOrders = (items: Order[]) => {
    const recentClosedSince = getRecentClosedSince();

    return items.filter((order) => {
        if (!isNotDeleted(order as { _deleted?: boolean | null })) {
            return false;
        }

        if (order.status === 'OPEN') {
            return true;
        }

        const isRecentClosed =
            !!order.orderDate && order.orderDate > recentClosedSince;

        return (
            isRecentClosed &&
            (order.status === 'PAID' ||
                order.status === 'PARTIALLY_REFUNDED' ||
                order.status === 'REFUNDED')
        );
    });
};

export const mergeSyncedOrders = (...groups: Order[][]) => {
    const deduped = new Map<string, Order>();

    groups.flat().forEach((order) => {
        deduped.set(order.id, order);
    });

    return Array.from(deduped.values());
};

const updateStoreOrders = (dispatch: Dispatch, items: Order[]) => {
    const paidOrders = items.filter((order) => order.status === 'PAID');
    const partiallyRefundedOrders = items.filter(
        (order) => order.status === 'PARTIALLY_REFUNDED'
    );
    const refundedOrders = items.filter((order) => order.status === 'REFUNDED');
    logSyncDebug('orders', 'updateStoreOrders', {
        totalCount: items.length,
        paidCount: paidOrders.length,
        partiallyRefundedCount: partiallyRefundedOrders.length,
        refundedCount: refundedOrders.length,
        paidSample: summarizeOrders(paidOrders),
        partiallyRefundedSample: summarizeOrders(partiallyRefundedOrders),
        refundedSample: summarizeOrders(refundedOrders),
    });

    sortByCreatedAt(items);
    dispatch(
        ordersActions.setAll(items.map((order) => OrderEntityMapper.fromModel(order)))
    );
};

const updateOrderRefundStore = (dispatch: Dispatch, items: OrderRefund[]) => {
    const visibleRefunds = filterVisibleRefunds(items);
    const refundSnapshots: OrderRefundRecordSnapshot[] = visibleRefunds.map(
        (refund) => ({
            id: String(refund.id),
            orderId: String(refund.orderId || ''),
            refundAmount: Number(refund.refundAmount || 0),
            refundDate: refund.refundDate ?? null,
            refundPayments: (refund.refundPayments || []).map((payment) => ({
                type: String(payment?.type || ''),
                amount: Number(payment?.amount || 0),
            })),
        })
    );
    logSyncDebug('orders.refunds', 'updateStore', {
        itemCount: refundSnapshots.length,
    });
    dispatch(ordersActions.setRefundRecords(refundSnapshots));
};

const updateOrderRefundLineStore = (
    dispatch: Dispatch,
    items: OrderRefundLine[]
) => {
    const visibleRefundLines = filterVisibleRefundLines(items);
    const refundLineSnapshots: OrderRefundLineRecordSnapshot[] =
        visibleRefundLines.map((line) => ({
            id: String(line.id),
            orderId: String(line.orderId || ''),
            orderLineIdentifier: String(line.orderLineIdentifier || ''),
            quantityRefunded: Number(line.quantityRefunded || 0),
        }));
    logSyncDebug('orders.refundLines', 'updateStore', {
        itemCount: refundLineSnapshots.length,
    });
    dispatch(ordersActions.setRefundLineRecords(refundLineSnapshots));
};

const orderSyncManager = createSharedObserveQueryManager<Order, Order[]>({
    model: ORDER_SYNC_MODEL,
    trackKey: 'orders.observeQuery',
    staleThresholdMs: ORDER_SYNC_STALE_THRESHOLD_MS,
    observeQuery: () => DataStore.observeQuery(Order),
    mapSnapshot: ({ isSynced, items }) => {
        const visibleOrders = filterVisibleOrders(items);
        logSyncDebug('orders.observeQuery', 'update', {
            isSynced,
            itemCount: visibleOrders.length,
            recentClosedSince: getRecentClosedSince(),
            sample: summarizeOrders(visibleOrders),
        });

        return visibleOrders;
    },
    publishSnapshot: (dispatch, items) => {
        updateStoreOrders(dispatch, items);
    },
});

const orderRefundSyncManager = createSharedObserveQueryManager<
    OrderRefund,
    OrderRefund[]
>({
    model: 'orderRefunds',
    trackKey: 'orders.refunds.observeQuery',
    observeQuery: () => DataStore.observeQuery(OrderRefund),
    mapSnapshot: ({ isSynced, items }) => {
        logSyncDebug('orders.refunds.observeQuery', 'update', {
            isSynced,
            itemCount: items.length,
        });
        return items;
    },
    publishSnapshot: (dispatch, items) => {
        updateOrderRefundStore(dispatch, items);
    },
});

const orderRefundLineSyncManager = createSharedObserveQueryManager<
    OrderRefundLine,
    OrderRefundLine[]
>({
    model: 'orderRefundLines',
    trackKey: 'orders.refundLines.observeQuery',
    observeQuery: () => DataStore.observeQuery(OrderRefundLine),
    mapSnapshot: ({ isSynced, items }) => {
        logSyncDebug('orders.refundLines.observeQuery', 'update', {
            isSynced,
            itemCount: items.length,
        });
        return items;
    },
    publishSnapshot: (dispatch, items) => {
        updateOrderRefundLineStore(dispatch, items);
    },
});

export const restartOrderSync = async (
    dispatch: Dispatch,
    reason = 'manual',
    tenantId?: string
) => {
    logSyncDebug('orders.sync', 'restart', {
        reason,
        tenantId: tenantId || null,
    });
    await orderSyncManager.restart(dispatch, reason, tenantId);
};

export const ensureOrderSyncHealthy = async (
    dispatch: Dispatch,
    options?: {
        tenantId?: string;
        staleAfterMs?: number;
    }
) => orderSyncManager.ensureHealthy(dispatch, options);

export const syncOrders = async (dispatch: Dispatch) => {
    const finish = startSyncMeasure('orders', 'syncOrders');
    const visibleOrders = filterVisibleOrders(await DataStore.query(Order));
    finish({
        totalCount: visibleOrders.length,
        paidSample: summarizeOrders(
            visibleOrders.filter((order) => order.status === 'PAID')
        ),
        partiallyRefundedSample: summarizeOrders(
            visibleOrders.filter(
                (order) => order.status === 'PARTIALLY_REFUNDED'
            )
        ),
        refundedSample: summarizeOrders(
            visibleOrders.filter((order) => order.status === 'REFUNDED')
        ),
    });
    updateStoreOrders(dispatch, visibleOrders);
};

export const subscribeToOrderChanges = (
    dispatch: Dispatch,
    tenantId?: string
) => orderSyncManager.subscribe(dispatch, tenantId);

export const subscribeToOrderRefundChanges = (
    dispatch: Dispatch,
    tenantId?: string
) => orderRefundSyncManager.subscribe(dispatch, tenantId);

export const subscribeToOrderRefundLineChanges = (
    dispatch: Dispatch,
    tenantId?: string
) => orderRefundLineSyncManager.subscribe(dispatch, tenantId);
