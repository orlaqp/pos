/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { OrderRefundedDetailsDialog } from './order-refunded-details-dialog';

const mockGetRefundRecordsForOrder = jest.fn();

jest.mock('@pos/theme/native/design-tokens', () => ({
    useDesignTokens: () => ({
        colors: {
            canvas: '#05070B',
            border: '#2f3742',
            surfaceMuted: '#0E141C',
            textPrimary: '#f3f7ff',
            textMuted: '#94a3b8',
            accent: '#4aa3eb',
        },
        spacing: { xs: 4, sm: 8, md: 12, lg: 16 },
        radii: { sm: 8, md: 12, lg: 18 },
    }),
}));

jest.mock('@pos/orders/data-access', () => ({
    OrderService: {
        getRefundRecordsForOrder: (...args: unknown[]) =>
            mockGetRefundRecordsForOrder(...args),
    },
}));

jest.mock('@pos/shared/ui-native', () => ({
    UIOrderSummaryPanel: ({
        title,
        hint,
        footer,
    }: {
        title: string;
        hint: string;
        footer?: React.ReactNode;
    }) => {
        const { View, Text } = require('react-native');
        return (
            <View testID="mock-order-summary-panel">
                <Text>{title}</Text>
                <Text>{hint}</Text>
                {footer}
            </View>
        );
    },
    UISpinner: ({ message }: { message: string }) => {
        const { Text } = require('react-native');
        return <Text>{message}</Text>;
    },
}));

jest.mock('@rneui/themed', () => ({
    Dialog: ({
        isVisible,
        children,
    }: {
        isVisible: boolean;
        children: React.ReactNode;
    }) => {
        const { View } = require('react-native');
        return isVisible ? <View>{children}</View> : null;
    },
    Button: ({
        title,
        onPress,
        testID,
    }: {
        title: string;
        onPress: () => void;
        testID?: string;
    }) => {
        const { Pressable, Text } = require('react-native');
        return (
            <Pressable testID={testID} onPress={onPress}>
                <Text>{title}</Text>
            </Pressable>
        );
    },
}));

jest.mock('../../../../../../shared/utils/src/lib/translation', () => ({
    translateWithFallback: (_key: string, fallback: string) => fallback,
}));

describe('OrderRefundedDetailsDialog', () => {
    const order = {
        id: 'order-1',
        total: 18,
        subtotal: 18,
        discountTotal: 0,
        savingsTotal: 0,
        tax: 0,
        promoCodes: [],
        lines: [
            {
                identifier: 'line-1',
                productId: 'product-1',
                productName: 'Bread Fixture',
                quantity: 1,
                unitOfMeasure: 'EA',
                price: 18,
                basePrice: 18,
                lineTotalBeforeTax: 18,
                allocatedOrderDiscountTotal: 0,
                lineDiscountTotal: 0,
                appliedDiscounts: [],
                isEBTEligible: false,
            },
        ],
        appliedDiscountSummary: {
            warnings: [],
            lineSummaries: [],
            orderLevelAdjustments: [],
        },
    } as any;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => undefined);
    });

    it('loads and renders refund metadata for a refunded order', async () => {
        mockGetRefundRecordsForOrder.mockResolvedValue([
            {
                refundDate: '2026-04-23T11:00:00.000Z',
                refundAmount: 18,
                createdByEmployeeName: 'Supervisor Two',
                refundPayments: [{ type: 'CASH', amount: 18 }],
            },
        ]);

        const { getAllByText, getByTestId, getByText } = render(
            <OrderRefundedDetailsDialog
                visible
                order={order}
                onClose={jest.fn()}
            />,
        );
        expect(getByTestId('order-refunded-details-dialog')).toBeTruthy();
        await waitFor(() =>
            expect(mockGetRefundRecordsForOrder).toHaveBeenCalledWith(
                'order-1',
            ),
        );

        expect(getByText('Refunded order details')).toBeTruthy();
        expect(getByText('Refund summary')).toBeTruthy();
        expect(getByText('Supervisor Two')).toBeTruthy();
        expect(getAllByText('$18.00').length).toBeGreaterThan(0);
        expect(getByTestId('order-refunded-details-payment-0')).toBeTruthy();
    });

    it('closes from the close button', () => {
        mockGetRefundRecordsForOrder.mockResolvedValue([]);
        const onClose = jest.fn();
        const view = render(
            <OrderRefundedDetailsDialog visible order={order} onClose={onClose} />,
        );

        fireEvent.press(view.getByTestId('order-refunded-details-close-button'));
        expect(onClose).toHaveBeenCalled();
    });
});
