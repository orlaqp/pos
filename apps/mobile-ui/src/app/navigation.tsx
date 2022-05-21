import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from './HomeScreen';
import { LoginScreen, SignUpScreen } from '@pos/auth/native-feature';
import { SalesScreen } from '@pos/sales/native-feature';

import { useSelector } from 'react-redux';
import { RootState } from '@pos/store';
import { BackOffice } from '@pos/back-office/native-feature';
import { DataStore } from 'aws-amplify';
import { Orders } from '@pos/orders/native-feature';
import { useTheme } from '@rneui/themed';

/* eslint-disable-next-line */
export interface NavigationParamList {
    [key: string]: object | undefined;
    'Sales': {
        mode: 'order' | 'payment';
    }
}


const Stack = createNativeStackNavigator<NavigationParamList>();

export function Navigation() {
    const theme = useTheme();
  const user = useSelector((state: RootState) => state.auth.user);
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.theme.colors.background,
        },
        headerTitleStyle: {
          color: theme.theme.colors.grey0,
        },
      }}
    >
    { user ? (
        <>
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Sales" component={SalesScreen} />
            <Stack.Screen name="Payments" component={Orders} />
            <Stack.Screen name="BackOffice" component={BackOffice} />
        </>
    ) : (
        <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Signup" component={SignUpScreen} options={{ headerShown: false }} />
        </>
    ) }
    </Stack.Navigator>
  );
}

export default Navigation;
