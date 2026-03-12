/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { render } from '@testing-library/react-native';
import { Text, View } from 'react-native';

jest.mock('@react-navigation/native-stack', () => ({
    createNativeStackNavigator: () => ({
        Screen: ({ name }: { name: string }) => <Text>{name}</Text>,
    }),
}));

jest.mock('@pos/shared/ui-native', () => ({
    StackNavigation: ({ children }: { children: React.ReactNode }) => (
        <View>{children}</View>
    ),
}));

jest.mock('@pos/sales/native-feature', () => ({
    SalesScreen: () => <Text>Sales Screen</Text>,
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
