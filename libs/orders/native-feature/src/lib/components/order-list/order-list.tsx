import React from 'react';
import {
    ordersActions,
    fetchOrders,
    selectFilteredList,
    selectIsEmpty,
    selectLoadingStatus,
} from '@pos/orders/data-access';
import { ItemListProps, UIGenericItemList } from '@pos/shared/ui-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import OrderItem from '../order-item/order-item';
import { Alert, View } from 'react-native';
import { useSharedStyles } from '@pos/theme/native';
import { Button } from '@rneui/themed';

export interface OrderListProps {
    navigation: NativeStackNavigationProp<any>;
}

export function OrderList({ navigation }: OrderListProps) {
    const styles = useSharedStyles();
    const props: ItemListProps<any, any> = {
        ItemComponent: OrderItem,
        formNavName: 'Order Form',
        navigation: navigation,
        isEmptySelector: selectIsEmpty,
        loadingStatusSelector: selectLoadingStatus,
        filteredListSelector: selectFilteredList,
        clearSelectionAction: ordersActions.clearSelection,
        filterAction: ordersActions.filter,
        fetchItemsAction: undefined,
    };

    return <UIGenericItemList {...props} goBackEnable={true} />;
}

export default OrderList;
