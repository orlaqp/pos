import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from '@rneui/themed';
import { Provider } from 'react-redux';
import { store } from '@pos/store';
import { theme } from '@pos/theme/native';

import Navigation from './navigation';

describe('Navigation', () => {
    it('should render successfully', () => {
        const { toJSON } = render(
            <Provider store={store}>
                <NavigationContainer>
                    <ThemeProvider theme={theme('dark')}>
                        <Navigation />
                    </ThemeProvider>
                </NavigationContainer>
            </Provider>
        );
        expect(toJSON()).toBeTruthy();
    });
});
