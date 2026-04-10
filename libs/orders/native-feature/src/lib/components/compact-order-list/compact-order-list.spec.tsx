import React from 'react';
import { render } from '@testing-library/react-native';
import { CompactOrderList } from './compact-order-list';

const mockDispatch = jest.fn();
const mockSubscribeUnsubscribe = jest.fn();

const mockOpenOrders = [
    {
        id: 'open-1',
        orderNo: '51-25-260410-0001',
        total: 42,
        employeeName: 'Cashier',
        orderDate: '2026-04-10T12:00:00.000Z',
        lines: [],
        status: 'OPEN',
    },
];

jest.mock('react-redux', () => ({
    useDispatch: () => mockDispatch,
    useSelector: (selector: () => unknown) => selector(),
}));

jest.mock('@pos/theme/native/design-tokens', () => ({
    useDesignTokens: () => ({
        spacing: { xs: 4, sm: 8, md: 12, xl: 24 },
        radii: { md: 12, sm: 8 },
        colors: {
            border: '#2f374288',
            surfaceMuted: '#2f37422a',
            accent: '#4aa3eb',
            textMuted: '#8491a2',
            textPrimary: '#f7f9fc',
            textSecondary: '#cbd5e1',
        },
    }),
}));

jest.mock('@pos/shared/ui-native', () => ({
    UICard: ({ children }: { children: React.ReactNode }) => {
        const { View } = require('react-native');
        return <View>{children}</View>;
    },
    UIEmptyState: ({ text }: { text: string }) => {
        const { Text } = require('react-native');
        return <Text>{text}</Text>;
    },
    UISearchInput: ({ value, onChangeText }: any) => {
        const { TextInput } = require('react-native');
        return <TextInput value={value} onChangeText={onChangeText} />;
    },
}));

jest.mock('@pos/shared/api', () => ({
    OrderStatus: {
        OPEN: 'OPEN',
    },
}));

jest.mock('@pos/orders/data-access', () => ({
    selectOpenOrders: () => mockOpenOrders,
    subscribeToOrderChanges: () => ({
        unsubscribe: mockSubscribeUnsubscribe,
    }),
    OrderService: {
        search: (orders: typeof mockOpenOrders) => orders,
    },
}));

jest.mock('../compact-order-item/compact-order-item', () => ({
    __esModule: true,
    default: ({ item }: { item: { orderNo: string } }) => {
        const { Text } = require('react-native');
        return <Text>{item.orderNo}</Text>;
    },
}));

describe('CompactOrderList', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('keeps taps active on the order list while search is focused', () => {
        const { getByTestId, getByText } = render(
            <CompactOrderList onSelect={jest.fn()} onClose={jest.fn()} />
        );

        expect(getByTestId('compact-order-list-flat-list').props.keyboardShouldPersistTaps).toBe(
            'handled'
        );
        expect(getByText('51-25-260410-0001')).toBeTruthy();
    });
});
