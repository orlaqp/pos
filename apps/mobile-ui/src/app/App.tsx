/* eslint-disable jsx-a11y/accessible-emoji */
import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { DataStore } from '@aws-amplify/datastore';
import { Store } from '@pos/models';

import { Button, ThemeProvider } from '@rneui/themed';
import { theme } from './theme';
import { HomeScreen } from './HomeScreen';

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
    <ThemeProvider theme={theme}>
      <SafeAreaView>
        <NavigationContainer>
          <Stack.Navigator initialRouteName='Home'>
            <Stack.Screen name="Home" component={HomeScreen} />
            
          </Stack.Navigator>
        </NavigationContainer>
        <HomeScreen />
      </SafeAreaView>
    </ThemeProvider>
  );
};

export default App;
