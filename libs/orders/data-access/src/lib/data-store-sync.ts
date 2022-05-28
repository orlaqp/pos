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
