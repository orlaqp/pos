
import React from 'react';
import { ordersActions, fetchOrders, selectFilteredList, selectIsEmpty, selectLoadingStatus } from '@pos/orders/data-access';
import { ItemListProps, UIGenericItemList } from '@pos/shared/ui-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import OrderItem from '../order-item/order-item';

export interface OrderListProps {
    navigation: NativeStackNavigationProp<any>;
}

export function OrderList({ navigation }: OrderListProps) {
    const props: ItemListProps<any, any> = {
        ItemComponent: OrderItem,
        formNavName: 'Order Form',
        navigation: navigation,
        isEmptySelector: selectIsEmpty,
        loadingStatusSelector: selectLoadingStatus,
        filteredListSelector: selectFilteredList,
        clearSelectionAction: ordersActions.clearSelection,
        filterAction: ordersActions.filter,
        fetchItemsAction: fetchOrders,
    }

    return <UIGenericItemList {...props} />
};

export default OrderList;
