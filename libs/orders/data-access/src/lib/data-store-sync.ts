import { sortByCreatedAt, sortListBy } from '@pos/shared/utils';
import { Order, OrderLine } from '@pos/shared/models';
import { Dispatch } from '@reduxjs/toolkit';
import { DataStore } from 'aws-amplify';
import { OrderEntityMapper } from './order.entity';
import { ordersActions } from './slices/orders.slice';

export const syncOrders = (dispatch: Dispatch) => {
    console.log('Syncing orders to the store');
    DataStore.query(Order).then((orders) =>
        dispatch(
            ordersActions.setAll(
                orders.map((r) => OrderEntityMapper.fromModel(r))
            )
        )
    );
};

export const syncOrderLines = (dispatch: Dispatch) => {
    console.log('Syncing order lines to the store');
    DataStore.query(OrderLine).then((lines) =>
        dispatch(
            ordersActions.setLines(
                lines.map((l) => OrderEntityMapper.fromLine(l))
            )
        )
    );
};

export const subscribeToOrderChanges = (dispatch: Dispatch) => {
    return DataStore.observeQuery(Order).subscribe(({ isSynced, items }) => {
        if (!isSynced) return;
        console.log('Order changes detected');
        updateStoreOrders(dispatch, items);
    });
};

export const subscribeToOrderLineChanges = (dispatch: Dispatch) => {
    return DataStore.observeQuery(OrderLine).subscribe(({ isSynced, items }) => {
        if (!isSynced) return;
        console.log('Order line changes detected');
        updateStoreOrderLines(dispatch, items);
    });
};

const updateStoreOrders = (dispatch: Dispatch, items: Order[]) => {
    sortByCreatedAt(items);
    dispatch(
        ordersActions.setAll(
            items.map((r) => OrderEntityMapper.fromModel(r))
        )
    );
};

const updateStoreOrderLines = (dispatch: Dispatch, items: OrderLine[]) => {
    sortListBy(items, 'productName');
    dispatch(
        ordersActions.setLines(
            items.map((r) => OrderEntityMapper.fromLine(r))
        )
    );
};
