/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

const mockDispatch = jest.fn();
const mockNavigate = jest.fn();
const mockUseSelector = jest.fn(() => undefined);

jest.mock('@pos/theme/native', () => ({
    useSharedStyles: () => ({
        dataRow: {},
        name: {},
        primaryText: {},
        secondaryText: {},
    }),
}));
jest.mock('@pos/theme/native/design-tokens', () => ({
    useDesignTokens: () => ({
        spacing: { xs: 4, sm: 8, md: 12 },
        radii: { sm: 6 },
        colors: {
            border: '#2f374288',
            surfaceMuted: '#2f37422a',
            textMuted: '#8491a2',
            accent: '#4aa3eb',
            success: '#34c759',
            warning: '#ffb020',
        },
    }),
}));

jest.mock('@rneui/themed', () => ({
    useTheme: () => ({ theme: { colors: { primary: '#4da3ff', error: '#ff5f5f' } } }),
    Button: ({ title, onPress, testID }: { title?: string; onPress: () => void; testID?: string }) => {
        const { Pressable, Text } = require('react-native');
        return (
            <Pressable onPress={onPress} testID={testID || title}>
                <Text>{title || 'icon-button'}</Text>
            </Pressable>
        );
    },
}));

jest.mock('react-redux', () => ({
    useDispatch: () => mockDispatch,
    useSelector: (selector: unknown) => mockUseSelector(selector),
}));

jest.mock('@pos/printings/data-access', () => ({
    getDefaultPrinter: jest.fn(),
    printReceipt: jest.fn(),
    PrinterEntityMapper: { fromModel: jest.fn((printer) => printer) },
    PrinterService: { getDefaultPrinter: jest.fn() },
}));

jest.mock('@pos/store-info/data-access', () => ({
    selectStore: jest.fn(),
    StoreInfoEntityMapper: { fromModel: jest.fn((store) => store) },
    StoreInfoService: { getStore: jest.fn() },
}));

jest.mock('@pos/employees/data-access', () => ({
    selectLoginEmployee: jest.fn(),
}));

jest.mock('@pos/auth/data-access', () => ({
    Role: { VoidOrder: 'VoidOrder', RemoveSale: 'RemoveSale' },
}));

const mockSetAction = jest.fn((payload) => ({ type: 'cart/set', payload }));

jest.mock('@pos/sales/data-access', () => ({
    cartActions: {
        set: (payload: unknown) => mockSetAction(payload),
    },
}));

jest.mock('@pos/orders/data-access', () => ({
    ordersActions: { remove: jest.fn() },
    OrderService: { delete: jest.fn() },
    OrderEntityMapper: { asCartState: jest.fn() },
}));

const {
    OrderItem,
    getStatusAccentColor,
    parseOrderNoSegments,
} = require('./order-item');
const { printReceipt } = require('@pos/printings/data-access');
const { OrderEntityMapper } = require('@pos/orders/data-access');

describe('OrderItem integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseSelector.mockReset();
        mockUseSelector.mockImplementation(() => undefined);
    });

    it('shows Payment action for OPEN orders and navigates to Sales payment mode', () => {
        const item = {
            id: 'o-1',
            orderNo: '51-EBTDEV01-260311-0001',
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

        expect(queryByText('Payment')).toBeTruthy();
        fireEvent.press(getByTestId('order-item-pay-button'));

        expect(mockSetAction).toHaveBeenCalledWith(item);
        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'cart/set',
            payload: item,
        });
        expect(mockNavigate).toHaveBeenCalledWith('Sales', { mode: 'payment' });
    });

    it('renders segmented order chips and metadata for parseable order number', () => {
        const item = {
            id: 'o-2',
            orderNo: '51-EBTDEV01-260311-0002',
            subtotal: 20,
            tax: 0,
            total: 20,
            status: 'PAID',
            employeeId: 'emp-1',
            employeeName: 'EBT Cashier',
            orderDate: '2026-03-11T17:03:25.000Z',
            paymentInfo: { employeeName: 'Manager' },
            lines: [],
        };

        const { getByText } = render(
            <OrderItem item={item} navigation={{ navigate: mockNavigate }} onVoid={jest.fn()} />
        );

        expect(getByText('Store')).toBeTruthy();
        expect(getByText('51')).toBeTruthy();
        expect(getByText('Station')).toBeTruthy();
        expect(getByText('EBTDEV01')).toBeTruthy();
        expect(getByText('Date')).toBeTruthy();
        expect(getByText('2026-03-11')).toBeTruthy();
        expect(getByText('0002')).toBeTruthy();
        expect(getByText('PAID')).toBeTruthy();
        expect(getByText('By: Manager')).toBeTruthy();
    });

    it('falls back to raw order number when format is invalid', () => {
        const item = {
            id: 'o-3',
            orderNo: 'INVALID-ORDER',
            subtotal: 20,
            tax: 0,
            total: 20,
            status: 'OPEN',
            employeeId: 'emp-1',
            employeeName: 'Cashier',
            orderDate: '2026-03-11T17:03:25.000Z',
            lines: [],
        };

        const { getByText, queryByText } = render(
            <OrderItem item={item} navigation={{ navigate: mockNavigate }} onVoid={jest.fn()} />
        );

        expect(getByText('INVALID-ORDER')).toBeTruthy();
        expect(queryByText('Store')).toBeNull();
    });

    it('parses order number segments and validates date format', () => {
        expect(parseOrderNoSegments('51-EBTDEV01-260311-0002')).toEqual({
            store: '51',
            station: 'EBTDEV01',
            date: '2026-03-11',
            sequence: '0002',
        });
        expect(parseOrderNoSegments('bad-format')).toBeNull();
        expect(parseOrderNoSegments('51-EBTDEV01-261332-0002')).toBeNull();
    });

    it('maps status to accent colors', () => {
        const colors = { accent: '#a', success: '#b', warning: '#c' };
        expect(getStatusAccentColor('OPEN', colors)).toBe('#a');
        expect(getStatusAccentColor('PAID', colors)).toBe('#b');
        expect(getStatusAccentColor('REFUNDED', colors)).toBe('#c');
    });

    it('prints merchant copy for paid orders', () => {
        const item = {
            id: 'o-4',
            orderNo: '51-EBTDEV01-260311-0004',
            subtotal: 20,
            tax: 0,
            total: 20,
            status: 'PAID',
            employeeId: 'emp-1',
            employeeName: 'Cashier',
            orderDate: '2026-03-12T12:00:00.000Z',
            lines: [],
        };
        const printer = { identifier: 'printer-1' };
        const store = { name: 'Test Store' };
        const cartState = { items: [], footer: { total: 20 } };

        mockUseSelector
            .mockImplementationOnce(() => printer)
            .mockImplementationOnce(() => undefined)
            .mockImplementationOnce(() => store);
        OrderEntityMapper.asCartState.mockReturnValue(cartState);

        const { getByTestId } = render(
            <OrderItem
                item={item}
                navigation={{ navigate: mockNavigate }}
                onVoid={jest.fn()}
            />
        );

        fireEvent.press(getByTestId('order-item-print-button'));

        expect(printReceipt).toHaveBeenCalledWith(
            store,
            printer,
            cartState,
            expect.objectContaining({
                copyType: 'MERCHANT',
            })
        );
    });
});
