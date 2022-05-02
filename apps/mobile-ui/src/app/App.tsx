/* eslint-disable jsx-a11y/accessible-emoji */
import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { DataStore } from '@aws-amplify/datastore';
import { Store } from '@pos/models';

import { ThemeProvider } from '@rneui/themed';
import { HomeScreen } from './HomeScreen';
import { LoginScreen, SignUpScreen } from '@pos/auth/native-feature';
import { SalesScreen } from '@pos/sales/native-feature';
import { theme } from '@pos/theme/native';


const createStore = async () => {
  await DataStore.save(
    new Store({
      name: 'Store 1',
      address: 'address 1',
      city: 'Miami',
      country: 'USA',
      email: 'email@address.com',
      phone: '123-123-1234',
      state: 'FL',
    })
  );

  const stores = await DataStore.query(Store);
  console.log(stores);
};

const Stack = createNativeStackNavigator();

export const App = () => {
  return (
    <NavigationContainer>
      <ThemeProvider theme={theme}>
          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
                title: '',
                headerStyle: {
                    backgroundColor: theme.darkColors.background,
                },
                headerTitleStyle: {
                    color: theme.darkColors.grey0
                }
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Login" component={SignUpScreen} />
            <Stack.Screen name="Sales" component={SalesScreen} />
          </Stack.Navigator>
          
      </ThemeProvider>
    </NavigationContainer>
  );
};

export default App;
