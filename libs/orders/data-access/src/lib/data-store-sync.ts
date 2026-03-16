import { sortByCreatedAt } from '@pos/shared/utils';
import { Order } from '@pos/shared/models';
import { Dispatch } from '@reduxjs/toolkit';
import { DataStore } from '@pos/shared/amplify';
import { OrderEntityMapper } from './order.entity';
import { ordersActions } from './slices/orders.slice';

import moment from 'moment';

const LAST_CLOSED_ORDER_DAYS = 3;

const getRecentClosedSince = () =>
    moment().subtract(LAST_CLOSED_ORDER_DAYS, 'days').toISOString();

export const mergeSyncedOrders = (...groups: Order[][]) => {
    const deduped = new Map<string, Order>();

    groups.flat().forEach((order) => {
        deduped.set(order.id, order);
    });

    return Array.from(deduped.values());
};

export const syncOrders = (dispatch: Dispatch) => {
    console.log('Syncing orders to the store');
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
    ]).then(([openOrders, paidOrders, refundedOrders]) =>
        updateStoreOrders(
            dispatch,
            mergeSyncedOrders(openOrders, paidOrders, refundedOrders)
        )
    );
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

    const openSub = DataStore.observeQuery(Order, (o) => o.status.eq('OPEN')).subscribe(
        ({ isSynced, items }) => {
            console.log(`Open order changes detected (isSynced: ${isSynced})`);
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
        console.log(`Recent paid order changes detected (isSynced: ${isSynced})`);
        recentPaidOrders = items;
        publish();
    });

    const recentRefundedSub = DataStore.observeQuery(Order, (o) =>
        o.and((order) => [
            order.status.eq('REFUNDED'),
            order.orderDate.gt(getRecentClosedSince()),
        ])
    ).subscribe(({ isSynced, items }) => {
        console.log(`Recent refunded order changes detected (isSynced: ${isSynced})`);
        recentRefundedOrders = items;
        publish();
    });

    return {
        unsubscribe() {
            openSub.unsubscribe();
            recentPaidSub.unsubscribe();
            recentRefundedSub.unsubscribe();
        },
    };
};

const updateStoreOrders = (dispatch: Dispatch, items: Order[]) => {
    console.log('sending orders to the store');
    
    sortByCreatedAt(items);
    dispatch(
        ordersActions.setAll(
            items.map((r) => OrderEntityMapper.fromModel(r))
        )
    );
};
