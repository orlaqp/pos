
import React from 'react';

import OrderList from '../order-list/order-list';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StackNavigation } from '@pos/shared/ui-native';
import { SalesScreen } from '@pos/sales/native-feature';
import { useNavigation } from '@react-navigation/native';
import { Button } from '@rneui/themed';
import i18next from 'i18next';

const Stack = createNativeStackNavigator();

export function Orders() {
  const rootNavigation = useNavigation<any>();
  const t = (key: string, fallback: string) =>
    i18next.isInitialized && i18next.exists(key)
      ? String(i18next.t(key))
      : fallback;

  return (
    <StackNavigation Stack={Stack}>
        <Stack.Screen
          name="Order List"
          component={OrderList}
          options={{
            headerShown: true,
            title: t('ORDERS_ScreenTitle', 'Payments'),
            headerLeft: () => (
              <Button
                type="clear"
                title={t('ORDERS_HomeTitle', 'Home')}
                onPress={() => {
                  if (rootNavigation?.canGoBack?.()) {
                    rootNavigation.goBack();
                    return;
                  }
                  rootNavigation?.navigate?.('Home');
                }}
              />
            ),
          }}
        />
        <Stack.Screen
          name="Sales"
          component={SalesScreen}
          options={{
            headerShown: true,
            title: t('ORDERS_PaymentTitle', 'Payment'),
            headerBackTitle: t('ORDERS_BackTitle', 'Orders'),
          }}
        />
    </StackNavigation>
  );
}

export default Orders;
