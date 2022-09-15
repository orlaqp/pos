import { EmployeeEntity } from '@pos/employees/data-access';
import { sortByCreatedAt } from '@pos/shared/utils';
import { Order } from '@pos/shared/models';
import { Dispatch } from '@reduxjs/toolkit';
import { DataStore } from 'aws-amplify';
import { OrderEntityMapper } from './order.entity';
import { ordersActions } from './slices/orders.slice';
import { Role } from '@pos/auth/data-access';
import { Alert } from 'react-native';

import moment from 'moment';

const LAST_X_DAYS = 3;

export const syncOrders = (dispatch: Dispatch) => {
    console.log('Syncing orders to the store');
    DataStore
        .query(Order, (o) => o.orderDate('gt', moment().subtract(LAST_X_DAYS, 'days').toISOString()))
        .then((orders) => updateStoreOrders(dispatch, orders));
};

export const subscribeToOrderChanges = (dispatch: Dispatch, employee?: EmployeeEntity) => {
    // DataStore.observe(Order).subscribe(msg => {
    //     console.log(msg.model, msg.opType, msg.element);
    // });
    
    // return DataStore.observeQuery(Order, employee.roles.includes(Role.Payments)
    //     ? (o) => o.orderDate('gt', moment().subtract(LAST_X_DAYS, 'days').toISOString())
    //     : (o) => o.status('eq', 'OPEN').orderDate('gt', moment().subtract(LAST_X_DAYS, 'days').toISOString())
    // )
    return DataStore.observeQuery(Order, 
        (o) => o.orderDate('gt', moment().subtract(LAST_X_DAYS, 'days').toISOString())
    )
    .subscribe(({ isSynced, items }) => {
        if (!isSynced) return;
        console.log('Order changes detected');
        updateStoreOrders(dispatch, items);
    });
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