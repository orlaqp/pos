/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('@react-navigation/native-stack', () => ({
    createNativeStackNavigator: () => ({
        Screen: ({ name }: { name: string }) => {
            const { Text } = require('react-native');
            return <Text>{name}</Text>;
        },
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
    it('should render successfully', () => {
        const { container, getByText } = render(<Orders />);
        expect(container).toBeTruthy();
        expect(getByText('Order List')).toBeTruthy();
        expect(getByText('Sales')).toBeTruthy();
    });
});
