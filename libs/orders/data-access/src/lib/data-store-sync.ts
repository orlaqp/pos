import { sortByCreatedAt } from '@pos/shared/utils';
import { Order } from '@pos/shared/models';
import { Dispatch } from '@reduxjs/toolkit';
import { DataStore } from '@pos/shared/amplify';
import { OrderEntityMapper } from './order.entity';
import { ordersActions } from './slices/orders.slice';
import { logSyncDebug, startSyncMeasure, trackSyncSubscription } from '@pos/shared/utils';

import moment from 'moment';

const LAST_CLOSED_ORDER_DAYS = 3;

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
    let openOrders: Order[] = [];
    let recentPaidOrders: Order[] = [];
    let recentRefundedOrders: Order[] = [];

    const publish = () =>
        updateStoreOrders(
            dispatch,
            mergeSyncedOrders(openOrders, recentPaidOrders, recentRefundedOrders)
        );

    const release = trackSyncSubscription('orders.observeQuery');

    const openSub = DataStore.observeQuery(Order, (o) => o.status.eq('OPEN')).subscribe(
        ({ isSynced, items }) => {
            logSyncDebug('orders.observeQuery', 'open:update', {
                isSynced,
                itemCount: items.length,
            });
            openOrders = items;
            publish();
        }
    );

    const recentPaidSub = DataStore.observeQuery(Order, (o) =>
        o.and((order) => [
            order.status.eq('PAID'),
            order.orderDate.gt(getRecentClosedSince()),
        ])
    ).subscribe(({ isSynced, items }) => {
        logSyncDebug('orders.observeQuery', 'paid:update', {
            isSynced,
            itemCount: items.length,
            recentClosedSince: getRecentClosedSince(),
            sample: summarizeOrders(items),
        });
        recentPaidOrders = items;
        publish();
    });

    const recentRefundedSub = DataStore.observeQuery(Order, (o) =>
        o.and((order) => [
            order.status.eq('REFUNDED'),
            order.orderDate.gt(getRecentClosedSince()),
        ])
    ).subscribe(({ isSynced, items }) => {
        logSyncDebug('orders.observeQuery', 'refunded:update', {
            isSynced,
            itemCount: items.length,
            recentClosedSince: getRecentClosedSince(),
            sample: summarizeOrders(items),
        });
        recentRefundedOrders = items;
        publish();
    });

    return {
        unsubscribe() {
            openSub.unsubscribe();
            recentPaidSub.unsubscribe();
            recentRefundedSub.unsubscribe();
            release();
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
