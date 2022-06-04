import { sortByCreatedAt } from '@pos/shared/utils';
import { Order } from '@pos/shared/models';
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

export const subscribeToOrderChanges = (dispatch: Dispatch) => {
    return DataStore.observeQuery(Order).subscribe(({ isSynced, items }) => {
        if (!isSynced) return;
        console.log('Order changes detected');
        updateStoreOrders(dispatch, items);
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