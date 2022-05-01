/* eslint-disable jsx-a11y/accessible-emoji */
import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { DataStore } from '@aws-amplify/datastore';
import { Store } from '@pos/models';

import { Text, ThemeProvider, useTheme } from '@rneui/themed';
import { HomeScreen } from './HomeScreen';
import { LoginScreen } from '@pos/auth/native-feature';
import { theme } from './theme';


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
  const styles = useStyles(theme);
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
            <Stack.Screen name="Login" component={LoginScreen} />
          </Stack.Navigator>
          
      </ThemeProvider>
    </NavigationContainer>
  );
};

const useStyles = (theme) => {
  return StyleSheet.create({
    appContainer: {
      flex: 1,
      backgroundColor: theme.darkColors.background,
    },
  });
};

export default App;
