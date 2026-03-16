/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { render } from '@testing-library/react-native';

const screenOptionsByName: Record<string, any> = {};

jest.mock('@react-navigation/native-stack', () => ({
    createNativeStackNavigator: () => ({
        Screen: ({ name, options }: { name: string; options?: any }) => {
            screenOptionsByName[name] = options;
            const { Text } = require('react-native');
            return <Text>{name}</Text>;
        },
    }),
}));

const mockGoBack = jest.fn();
const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        canGoBack: () => true,
        goBack: mockGoBack,
        navigate: mockNavigate,
    }),
}));

jest.mock('@pos/shared/ui-native', () => ({
    StackNavigation: ({ children }: { children: React.ReactNode }) => {
        const { View } = require('react-native');
        return <View>{children}</View>;
    },
}));

jest.mock('@pos/sales/native-feature', () => ({
    SalesScreen: () => {
        const { Text } = require('react-native');
        return <Text>Sales Screen</Text>;
    },
}));

const { Orders } = require('./orders');

describe('Orders', () => {
    beforeEach(() => {
        mockGoBack.mockClear();
        mockNavigate.mockClear();
        Object.keys(screenOptionsByName).forEach((key) => delete screenOptionsByName[key]);
    });

    it('should render successfully', () => {
        const { container, getByText } = render(<Orders />);
        expect(container).toBeTruthy();
        expect(getByText('Order List')).toBeTruthy();
        expect(getByText('Sales')).toBeTruthy();
    });

    it('should provide a stable header for the order list screen', () => {
        render(<Orders />);

        expect(screenOptionsByName['Order List']).toEqual(
            expect.objectContaining({
                headerShown: true,
                title: 'Payments',
            })
        );
        expect(typeof screenOptionsByName['Order List'].headerLeft).toBe('function');
    });
});
