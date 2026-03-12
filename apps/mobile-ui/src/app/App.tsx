/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from '@rneui/themed';
import { theme } from '@pos/theme/native';
import { Provider } from 'react-redux';
import { store } from '@pos/store';
import Navigation from './navigation';
import { Appearance } from 'react-native';
import { setI18nConfig } from '@pos/settings/data-access';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export const App = () => {
    const colorScheme = Appearance.getColorScheme();

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Provider store={store}>
                <NavigationContainer>
                    <ThemeProvider
                        // theme={theme(colorScheme === 'light' ? 'light' : 'dark')}
                        theme={theme('dark')}
                    >
                        <SafeAreaProvider>
                            <Navigation />
                        </SafeAreaProvider>
                    </ThemeProvider>
                </NavigationContainer>
            </Provider>
        </GestureHandlerRootView>
    );
};

export default App;
