
import React from 'react';

import OrderList from '../order-list/order-list';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StackNavigation } from '@pos/shared/ui-native';
import { SalesScreen } from '@pos/sales/native-feature';

const Stack = createNativeStackNavigator();

export function Orders() {
  return (
    <StackNavigation Stack={Stack}>
        <Stack.Screen name="Order List"  component={OrderList} />
        <Stack.Screen name="Sales" component={SalesScreen} options={{ headerShown: false }} />
    </StackNavigation>
  );
}

export default Orders;
