import React from 'react';
import {
    fetchOpenOrders,
    ordersActions,
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
        fetchItemsAction: fetchOpenOrders,
        emptyAction: () => navigation.goBack(),
        emptyActionText: 'Go back',
        emptyText: 'No orders have been created yet',
        emptyActionIcon: 'arrow-left',
    };

    return <UIGenericItemList {...props} goBackEnable={true} />;
}

export default OrderList;
