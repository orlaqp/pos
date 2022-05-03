/* eslint-disable jsx-a11y/accessible-emoji */
import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import { DataStore } from '@aws-amplify/datastore';
import { Store } from '@pos/models';

import { ThemeProvider } from '@rneui/themed';
import { theme } from '@pos/theme/native';
import { Provider } from 'react-redux';
import { store } from '@pos/store';
import Navigation from './navigation';

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


export const App = () => {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <ThemeProvider theme={theme}>
          <Navigation />
        </ThemeProvider>
      </NavigationContainer>
    </Provider>
  );
};

export default App;
