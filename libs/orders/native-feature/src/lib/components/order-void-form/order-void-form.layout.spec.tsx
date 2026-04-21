import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';

const mockPreviewRefund = jest.fn(async () => ({
    refundTotal: 4.99,
    newTotal: 12.0,
}));

jest.mock('react-redux', () => ({
    useSelector: (selector: (state: unknown) => unknown) => selector({}),
}));

jest.mock('@pos/theme/native', () => ({
    useSharedStyles: () => ({
        pageBackground: {},
        secondaryText: { color: '#94a3b8' },
        primaryText: { color: '#f8fafc' },
        textRight: { textAlign: 'right' },
    }),
}));

jest.mock('@pos/theme/native/design-tokens', () => ({
    useDesignTokens: () => ({
        spacing: { xs: 4, sm: 8, md: 12, lg: 16 },
        radii: { sm: 8, md: 12, lg: 18 },
        colors: {
            textPrimary: '#f8fafc',
            textMuted: '#94a3b8',
            border: '#334155',
            surface: '#0f172a',
            surfaceMuted: '#1e293b',
            warning: '#f59e0b',
            error: '#ef4444',
            success: '#22c55e',
            primary: '#38bdf8',
        },
    }),
}));

jest.mock('@rneui/themed', () => ({
    useTheme: () => ({
        theme: {
            colors: {
                error: '#ef4444',
                success: '#22c55e',
                grey2: '#94a3b8',
            },
        },
    }),
    Button: ({ title, onPress, testID, disabled }: any) => {
        const { Pressable, Text } = require('react-native');
        return (
            <Pressable testID={testID} onPress={onPress} disabled={disabled}>
                <Text>{title}</Text>
            </Pressable>
        );
    },
}));

jest.mock('@pos/employees/data-access', () => ({
    selectLoginEmployee: () => ({
        id: 'emp-1',
        firstName: 'Orlando',
        lastName: 'Quero',
    }),
}));

jest.mock('@pos/shared/ui-native', () => ({
    UICard: ({ children, testID }: any) => {
        const { View } = require('react-native');
        return <View testID={testID}>{children}</View>;
    },
}));

jest.mock('@pos/orders/data-access', () => ({
    OrderService: {
        previewRefund: (...args: unknown[]) => mockPreviewRefund(...args),
        refund: jest.fn(),
    },
    selectRefundedAmountForOrder: () => 0,
    selectRefundedQuantitiesForOrder: () => ({}),
}));

jest.mock('@pos/unit-of-measures/data-access', () => ({
    EACH: 'EA',
}));

jest.mock('../order-voidable-item/order-voidable-item', () => ({
    __esModule: true,
    default: ({
        line,
        onToggle,
        selected,
        readOnly,
        testIDPrefix,
    }: any) => {
        const { Pressable, Text } = require('react-native');
        return (
            <Pressable
                testID={`${testIDPrefix}-${line.identifier}`}
                disabled={readOnly}
                onPress={() => onToggle(line, !selected)}
            >
                <Text>{line.productName}</Text>
            </Pressable>
        );
    },
}));

import { OrderVoidForm } from './order-void-form';

describe('OrderVoidForm layout', () => {
    const originalConsoleError = console.error;

    beforeEach(() => {
        console.error = jest.fn();
    });

    afterEach(() => {
        console.error = originalConsoleError;
    });

    it('renders the redesigned two-column layout with right-rail controls', async () => {
        const { getByTestId, getByText, findByText } = render(
            <OrderVoidForm
                order={
                    {
                        id: 'order-1',
                        total: 16.99,
                        paymentInfo: {
                            payments: [{ type: 'CASH', amount: 16.99 }],
                        },
                        lines: [
                            {
                                identifier: 'line-1',
                                productId: 'product-1',
                                productName: 'Color huevo',
                                quantity: 1,
                                price: 4.99,
                                unitOfMeasure: 'EA',
                                tax: 0,
                                lineTotalBeforeTax: 4.99,
                                barcode: null,
                                sku: null,
                            },
                        ],
                    } as any
                }
                onRefundComplete={jest.fn()}
            />
        );

        expect(getByTestId('order-void-two-column-layout')).toBeTruthy();
        expect(getByText('Payment Reference')).toBeTruthy();
        expect(getByText('Refund Payment')).toBeTruthy();
        expect(getByText('Available to refund')).toBeTruthy();

        await act(async () => {
            fireEvent.press(getByTestId('order-void-available-line-line-1'));
            await Promise.resolve();
        });

        expect(await findByText('Refund Amount:')).toBeTruthy();
    });
});
