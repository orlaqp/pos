import moment from 'moment';
import { Dispatch } from '@reduxjs/toolkit';
import { DataStore } from '@pos/shared/amplify';
import { createSharedObserveQueryManager } from '@pos/shared/data-store';
import { Order } from '@pos/shared/models';
import { sortByCreatedAt } from '@pos/shared/utils';
import { logSyncDebug, startSyncMeasure } from '@pos/shared/utils';
import { OrderEntityMapper } from './order.entity';
import { ordersActions } from './slices/orders.slice';

const LAST_CLOSED_ORDER_DAYS = 3;
const ORDER_SYNC_MODEL = 'orders';
export const ORDER_SYNC_STALE_THRESHOLD_MS = 60_000;

const getRecentClosedSince = () =>
    moment().subtract(LAST_CLOSED_ORDER_DAYS, 'days').toISOString();

const isNotDeleted = (item: { _deleted?: boolean | null } | null | undefined) =>
    !!item && item._deleted !== true;

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
            (order.status === 'PAID' || order.status === 'REFUNDED')
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
    const refundedOrders = items.filter((order) => order.status === 'REFUNDED');
    logSyncDebug('orders', 'updateStoreOrders', {
        totalCount: items.length,
        paidCount: paidOrders.length,
        refundedCount: refundedOrders.length,
        paidSample: summarizeOrders(paidOrders),
        refundedSample: summarizeOrders(refundedOrders),
    });

    sortByCreatedAt(items);
    dispatch(
        ordersActions.setAll(items.map((order) => OrderEntityMapper.fromModel(order)))
    );
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
