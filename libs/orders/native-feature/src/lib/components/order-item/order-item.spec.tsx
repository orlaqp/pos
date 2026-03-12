/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';

const mockDispatch = jest.fn();
const mockNavigate = jest.fn();

jest.mock('@pos/theme/native', () => ({
    useSharedStyles: () => ({
        dataRow: {},
        name: {},
        primaryText: {},
        secondaryText: {},
    }),
}));

jest.mock('@rneui/themed', () => ({
    useTheme: () => ({ theme: { colors: { primary: '#4da3ff', error: '#ff5f5f' } } }),
    Button: ({ title, onPress, testID }: { title?: string; onPress: () => void; testID?: string }) => (
        <Pressable onPress={onPress} testID={testID || title}>
            <Text>{title || 'icon-button'}</Text>
        </Pressable>
    ),
}));

jest.mock('react-redux', () => ({
    useDispatch: () => mockDispatch,
    useSelector: jest.fn(() => undefined),
}));

jest.mock('@pos/printings/data-access', () => ({
    getDefaultPrinter: jest.fn(),
    printReceipt: jest.fn(),
}));

jest.mock('@pos/store-info/data-access', () => ({
    selectStore: jest.fn(),
}));

jest.mock('@pos/employees/data-access', () => ({
    selectLoginEmployee: jest.fn(),
}));

jest.mock('@pos/auth/data-access', () => ({
    Role: { VoidOrder: 'VoidOrder', RemoveSale: 'RemoveSale' },
}));

const setAction = jest.fn((payload) => ({ type: 'cart/set', payload }));

jest.mock('@pos/sales/data-access', () => ({
    cartActions: {
        set: (payload: unknown) => setAction(payload),
    },
}));

jest.mock('@pos/orders/data-access', () => ({
    ordersActions: { remove: jest.fn() },
    OrderService: { delete: jest.fn() },
    OrderEntityMapper: { asCartState: jest.fn() },
}));

const { OrderItem } = require('./order-item');

describe('OrderItem integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shows Pay action for OPEN orders and navigates to Sales payment mode', () => {
        const item = {
            id: 'o-1',
            orderNo: '51-TEST-0001',
            subtotal: 20,
            tax: 0,
            total: 20,
            status: 'OPEN',
            employeeId: 'emp-1',
            employeeName: 'Cashier',
            orderDate: '2026-03-12T12:00:00.000Z',
            lines: [],
        };

        const { getByTestId, queryByText } = render(
            <OrderItem
                item={item}
                navigation={{ navigate: mockNavigate }}
                onVoid={jest.fn()}
            />
        );

        expect(queryByText('Pay')).toBeTruthy();
        fireEvent.press(getByTestId('order-item-pay-button'));

        expect(setAction).toHaveBeenCalledWith(item);
        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'cart/set',
            payload: item,
        });
        expect(mockNavigate).toHaveBeenCalledWith('Sales', { mode: 'payment' });
    });
});
