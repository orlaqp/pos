/* eslint-disable jsx-a11y/accessible-emoji */
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from '@rneui/themed';
import { theme } from '@pos/theme/native';
import { Provider } from 'react-redux';
import { store } from '@pos/store';
import Navigation from './navigation';

export const App = () => {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <ThemeProvider theme={theme(store.getState().settings.darkTheme ? 'dark' : 'light')}>
          <SafeAreaProvider>
            <Navigation />
          </SafeAreaProvider>
        </ThemeProvider>
      </NavigationContainer>
    </Provider>
  );
};

export default App;
