import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from './HomeScreen';
import { LoginScreen, SignUpScreen } from '@pos/auth/native-feature';
import { SalesScreen } from '@pos/sales/native-feature';
import { theme } from '@pos/theme/native';

import { View, Text } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@pos/store';
import { BackOffice } from '@pos/back-office/native-feature';

/* eslint-disable-next-line */
export interface NavigationProps {}

const Stack = createNativeStackNavigator();

export function Navigation(props: NavigationProps) {
  const user = useSelector((state: RootState) => state.auth.user);
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.darkColors.background,
        },
        headerTitleStyle: {
          color: theme.darkColors.grey0,
        },
      }}
    >
    { user ? (
        <>
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Sales" component={SalesScreen} options={{ headerShown: false }} />
            <Stack.Screen name="BackOffice" component={BackOffice} options={{ headerShown: false }} />
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
