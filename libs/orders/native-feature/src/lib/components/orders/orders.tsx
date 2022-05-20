
import React from 'react';

import OrderList from '../order-list/order-list';
import OrderForm from '../order-form/order-form';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StackNavigation } from '@pos/shared/ui-native';

const Stack = createNativeStackNavigator();

export function Orders() {
  return (
    <StackNavigation Stack={Stack}>
        <Stack.Screen name="Order List"  component={OrderList} />
        <Stack.Screen name="Order Form" component={OrderForm} />
    </StackNavigation>
  );
}

export default Orders;
