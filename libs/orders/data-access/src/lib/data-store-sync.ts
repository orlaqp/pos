import { sortByCreatedAt } from '@pos/shared/utils';
import { Order } from '@pos/shared/models';
import { Dispatch } from '@reduxjs/toolkit';
import { DataStore } from '@pos/shared/amplify';
import { OrderEntityMapper } from './order.entity';
import { ordersActions } from './slices/orders.slice';
import { logSyncDebug, startSyncMeasure, trackSyncSubscription } from '@pos/shared/utils';

import moment from 'moment';

const LAST_CLOSED_ORDER_DAYS = 3;
const ORDER_SYNC_MODEL = 'orders';
export const ORDER_SYNC_STALE_THRESHOLD_MS = 60_000;
const ORDER_SYNC_SILENT_RECOVERY_THRESHOLD_MS =
    ORDER_SYNC_STALE_THRESHOLD_MS * 5;
const ORDER_SYNC_RECOVERY_BASE_DELAY_MS = 1_000;
const ORDER_SYNC_RECOVERY_MAX_DELAY_MS = 5_000;
const orderDispatchRefs = new Map<Dispatch, number>();

let sharedOrderSubscription:
    | {
          unsubscribe: () => void;
      }
    | undefined;
let activeOrderTenantId: string | undefined;
let orderLastSubscriptionStartedAt: string | undefined;
let orderLastSnapshotAt: string | undefined;
let orderLastRecoveryAttemptAt: string | undefined;
let orderLastRecoveryError: string | undefined;
let orderLastError: string | undefined;
let orderRecoveryRetryCount = 0;
let orderRecoveryTimer: ReturnType<typeof setTimeout> | undefined;

let openOrdersSnapshot: Order[] = [];
let recentPaidOrdersSnapshot: Order[] = [];
let recentRefundedOrdersSnapshot: Order[] = [];

const getRecentClosedSince = () =>
    moment().subtract(LAST_CLOSED_ORDER_DAYS, 'days').toISOString();

const summarizeOrders = (items: Order[]) =>
    items.slice(0, 5).map((order) => ({
        id: order.id,
        orderNo: order.orderNo,
        status: order.status,
        orderDate: order.orderDate,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
    }));

const getSubscriberCount = () => {
    let count = 0;
    orderDispatchRefs.forEach((dispatchCount) => {
        count += dispatchCount;
    });
    return count;
};

type SyncHealthChanges = {
    status?: 'idle' | 'subscribing' | 'healthy' | 'stale' | 'recovering' | 'error';
    subscriberCount?: number;
    tenantId?: string;
    lastSnapshotAt?: string;
    lastRecoveryAttemptAt?: string;
    lastRecoveryError?: string;
    lastError?: string;
};

const updateSyncHealthAction = (model: string, changes: SyncHealthChanges) => ({
    type: 'events/updateSyncHealth',
    payload: {
        model,
        changes,
    },
});

const clearSyncHealthAction = (model?: string) => ({
    type: 'events/clearSyncHealth',
    payload: model ? { model } : undefined,
});

const updateSyncHealth = (
    dispatch: Dispatch,
    changes: SyncHealthChanges
) => {
    dispatch(
        updateSyncHealthAction(ORDER_SYNC_MODEL, {
            tenantId: activeOrderTenantId,
            subscriberCount: getSubscriberCount(),
            ...changes,
        })
    );
};

const broadcastSyncHealth = (
    changes: SyncHealthChanges
) => {
    if (orderDispatchRefs.size === 0) {
        return;
    }

    orderDispatchRefs.forEach((_, activeDispatch) => {
        updateSyncHealth(activeDispatch, changes);
    });
};

const teardownOrderSubscriptions = () => {
    sharedOrderSubscription?.unsubscribe();
    sharedOrderSubscription = undefined;
    if (orderRecoveryTimer) {
        clearTimeout(orderRecoveryTimer);
        orderRecoveryTimer = undefined;
    }
};

const resetOrderSyncState = () => {
    teardownOrderSubscriptions();
    openOrdersSnapshot = [];
    recentPaidOrdersSnapshot = [];
    recentRefundedOrdersSnapshot = [];
    activeOrderTenantId = undefined;
    orderLastSubscriptionStartedAt = undefined;
    orderLastSnapshotAt = undefined;
    orderLastRecoveryAttemptAt = undefined;
    orderLastRecoveryError = undefined;
    orderLastError = undefined;
    orderRecoveryRetryCount = 0;
};

const scheduleOrderRecovery = (dispatch: Dispatch, reason: string, error?: unknown) => {
    orderLastRecoveryAttemptAt = new Date().toISOString();
    orderLastRecoveryError = error
        ? error instanceof Error
            ? error.message
            : String(error)
        : undefined;
    orderRecoveryRetryCount += 1;

    updateSyncHealth(dispatch, {
        status: 'recovering',
        lastRecoveryAttemptAt: orderLastRecoveryAttemptAt,
        lastRecoveryError: orderLastRecoveryError || `Recovery requested: ${reason}`,
    });

    if (orderRecoveryTimer) {
        return;
    }

    const delayMs = Math.min(
        ORDER_SYNC_RECOVERY_BASE_DELAY_MS *
            2 ** Math.max(0, orderRecoveryRetryCount - 1),
        ORDER_SYNC_RECOVERY_MAX_DELAY_MS
    );

    orderRecoveryTimer = setTimeout(() => {
        orderRecoveryTimer = undefined;
        void restartOrderSync(dispatch, reason);
    }, delayMs);
};

const publishOrders = () => {
    const mergedOrders = mergeSyncedOrders(
        openOrdersSnapshot,
        recentPaidOrdersSnapshot,
        recentRefundedOrdersSnapshot
    );

    orderDispatchRefs.forEach((_, activeDispatch) => {
        updateStoreOrders(activeDispatch, mergedOrders);
    });
};

const handleOrderSnapshot = (
    key: 'open' | 'paid' | 'refunded',
    items: Order[],
    metadata: Record<string, unknown>
) => {
    orderRecoveryRetryCount = 0;
    orderLastError = undefined;
    orderLastSnapshotAt = new Date().toISOString();

    if (key === 'open') {
        openOrdersSnapshot = items;
    } else if (key === 'paid') {
        recentPaidOrdersSnapshot = items;
    } else {
        recentRefundedOrdersSnapshot = items;
    }

    publishOrders();
    broadcastSyncHealth({
        status: 'healthy',
        lastSnapshotAt: orderLastSnapshotAt,
        lastError: undefined,
    });
    logSyncDebug('orders.observeQuery', `${key}:update`, metadata);
};

const startSharedOrderSubscriptions = (dispatch: Dispatch, tenantId?: string) => {
    activeOrderTenantId = tenantId;
    orderLastSubscriptionStartedAt = new Date().toISOString();
    updateSyncHealth(dispatch, {
        status: 'subscribing',
        lastError: undefined,
    });

    const release = trackSyncSubscription('orders.observeQuery');

    const openSub = DataStore.observeQuery(Order, (o) =>
        o.status.eq('OPEN')
    ).subscribe({
        next: ({ isSynced, items }) => {
            handleOrderSnapshot('open', items, {
                isSynced,
                itemCount: items.length,
            });
        },
        error: (error) => {
            release();
            orderLastError =
                error instanceof Error ? error.message : String(error);
            console.error('[orders.sync] open subscription failed', error);
            broadcastSyncHealth({
                status: 'error',
                lastError: orderLastError,
            });
            scheduleOrderRecovery(dispatch, 'open subscription error', error);
        },
    });

    const recentPaidSub = DataStore.observeQuery(Order, (o) =>
        o.and((order) => [
            order.status.eq('PAID'),
            order.orderDate.gt(getRecentClosedSince()),
        ])
    ).subscribe({
        next: ({ isSynced, items }) => {
            handleOrderSnapshot('paid', items, {
                isSynced,
                itemCount: items.length,
                recentClosedSince: getRecentClosedSince(),
                sample: summarizeOrders(items),
            });
        },
        error: (error) => {
            release();
            orderLastError =
                error instanceof Error ? error.message : String(error);
            console.error('[orders.sync] paid subscription failed', error);
            broadcastSyncHealth({
                status: 'error',
                lastError: orderLastError,
            });
            scheduleOrderRecovery(dispatch, 'paid subscription error', error);
        },
    });

    const recentRefundedSub = DataStore.observeQuery(Order, (o) =>
        o.and((order) => [
            order.status.eq('REFUNDED'),
            order.orderDate.gt(getRecentClosedSince()),
        ])
    ).subscribe({
        next: ({ isSynced, items }) => {
            handleOrderSnapshot('refunded', items, {
                isSynced,
                itemCount: items.length,
                recentClosedSince: getRecentClosedSince(),
                sample: summarizeOrders(items),
            });
        },
        error: (error) => {
            release();
            orderLastError =
                error instanceof Error ? error.message : String(error);
            console.error('[orders.sync] refunded subscription failed', error);
            broadcastSyncHealth({
                status: 'error',
                lastError: orderLastError,
            });
            scheduleOrderRecovery(dispatch, 'refunded subscription error', error);
        },
    });

    sharedOrderSubscription = {
        unsubscribe() {
            openSub.unsubscribe();
            recentPaidSub.unsubscribe();
            recentRefundedSub.unsubscribe();
            release();
        },
    };
};

export const restartOrderSync = async (
    dispatch: Dispatch,
    reason = 'manual',
    tenantId?: string
) => {
    const resolvedTenantId = tenantId ?? activeOrderTenantId;
    logSyncDebug('orders.sync', 'restart', {
        reason,
        tenantId: resolvedTenantId || null,
    });
    teardownOrderSubscriptions();
    startSharedOrderSubscriptions(dispatch, resolvedTenantId);
};

export const ensureOrderSyncHealthy = async (
    dispatch: Dispatch,
    options?: {
        tenantId?: string;
        staleAfterMs?: number;
    }
) => {
    const tenantId = options?.tenantId;
    const staleAfterMs = options?.staleAfterMs ?? ORDER_SYNC_STALE_THRESHOLD_MS;
    const silentRecoveryAfterMs = Math.max(
        staleAfterMs,
        ORDER_SYNC_SILENT_RECOVERY_THRESHOLD_MS
    );
    const now = Date.now();
    const lastSignalAt = orderLastSnapshotAt
        ? new Date(orderLastSnapshotAt).getTime()
        : 0;
    const subscriptionStartedAt = orderLastSubscriptionStartedAt
        ? new Date(orderLastSubscriptionStartedAt).getTime()
        : 0;

    if (tenantId && activeOrderTenantId && tenantId !== activeOrderTenantId) {
        resetOrderSyncState();
        await restartOrderSync(dispatch, 'tenant changed', tenantId);
        return true;
    }

    if (!sharedOrderSubscription) {
        if (getSubscriberCount() === 0) {
            return false;
        }
        await restartOrderSync(dispatch, 'missing shared subscription', tenantId);
        return true;
    }

    if (!lastSignalAt && subscriptionStartedAt && now - subscriptionStartedAt > staleAfterMs) {
        updateSyncHealth(dispatch, {
            status: 'stale',
        });
        scheduleOrderRecovery(dispatch, 'stale subscription');
        return true;
    }

    if (
        lastSignalAt &&
        now - lastSignalAt > silentRecoveryAfterMs &&
        (!orderLastRecoveryAttemptAt ||
            now - new Date(orderLastRecoveryAttemptAt).getTime() >
                silentRecoveryAfterMs)
    ) {
        updateSyncHealth(dispatch, {
            status: 'stale',
            lastSnapshotAt: orderLastSnapshotAt,
        });
        scheduleOrderRecovery(
            dispatch,
            `no order sync signal for ${Math.round(
                (now - lastSignalAt) / 1000
            )}s`
        );
        return true;
    }

    updateSyncHealth(dispatch, {
        status: 'healthy',
    });
    return false;
};

export const mergeSyncedOrders = (...groups: Order[][]) => {
    const deduped = new Map<string, Order>();

    groups.flat().forEach((order) => {
        deduped.set(order.id, order);
    });

    return Array.from(deduped.values());
};

export const syncOrders = (dispatch: Dispatch) => {
    const finish = startSyncMeasure('orders', 'syncOrders');
    Promise.all([
        DataStore.query(Order, (o) => o.status.eq('OPEN')),
        DataStore.query(Order, (o) =>
            o.and((order) => [
                order.status.eq('PAID'),
                order.orderDate.gt(getRecentClosedSince()),
            ])
        ),
        DataStore.query(Order, (o) =>
            o.and((order) => [
                order.status.eq('REFUNDED'),
                order.orderDate.gt(getRecentClosedSince()),
            ])
        ),
    ]).then(([openOrders, paidOrders, refundedOrders]) => {
        finish({
            openCount: openOrders.length,
            recentPaidCount: paidOrders.length,
            recentRefundedCount: refundedOrders.length,
            paidSample: summarizeOrders(paidOrders),
            refundedSample: summarizeOrders(refundedOrders),
        });
        updateStoreOrders(
            dispatch,
            mergeSyncedOrders(openOrders, paidOrders, refundedOrders)
        );
    });
};

export const subscribeToOrderChanges = (dispatch: Dispatch) => {
    const currentCount = orderDispatchRefs.get(dispatch) || 0;
    orderDispatchRefs.set(dispatch, currentCount + 1);

    if (!sharedOrderSubscription) {
        startSharedOrderSubscriptions(dispatch, activeOrderTenantId);
    } else {
        publishOrders();
    }

    updateSyncHealth(dispatch, {
        status: sharedOrderSubscription ? 'healthy' : 'subscribing',
        lastSnapshotAt: orderLastSnapshotAt,
        lastRecoveryAttemptAt: orderLastRecoveryAttemptAt,
        lastRecoveryError: orderLastRecoveryError,
        lastError: orderLastError,
    });

    return {
        unsubscribe() {
            const nextCount = (orderDispatchRefs.get(dispatch) || 1) - 1;

            if (nextCount <= 0) {
                orderDispatchRefs.delete(dispatch);
            } else {
                orderDispatchRefs.set(dispatch, nextCount);
            }

            if (orderDispatchRefs.size === 0) {
                resetOrderSyncState();
                dispatch(clearSyncHealthAction(ORDER_SYNC_MODEL));
            }
        },
    };
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
        ordersActions.setAll(
            items.map((r) => OrderEntityMapper.fromModel(r))
        )
    );
};
