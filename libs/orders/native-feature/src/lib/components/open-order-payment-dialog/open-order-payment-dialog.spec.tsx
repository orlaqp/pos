/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

const mockDispatch = jest.fn();
const mockNavigate = jest.fn();
const mockPrintReceipt = jest.fn();
const mockBuildPrintTicketPreview = jest.fn(() => ({ preview: true }));
const mockGetStore = jest.fn();
const mockGetDefaultPrinter = jest.fn();

const mockOrder = {
    id: 'open-1',
    orderNo: '51-OWNER-260422-0001',
    subtotal: 20,
    baseSubtotal: 20,
    tax: 0,
    total: 20,
    discountTotal: 0,
    lineDiscountTotal: 0,
    orderDiscountTotal: 0,
    savingsTotal: 0,
    status: 'OPEN',
    employeeId: 'emp-1',
    employeeName: 'Cashier',
    orderDate: '2026-04-22T12:00:00.000Z',
    pricingSource: 'OFFLINE_LOCAL',
    reconciliationStatus: 'PENDING',
    promoCodes: [],
    lines: [
        {
            identifier: 'line-1',
            quantity: 2,
            productId: 'p-1',
            productName: 'Huevo',
            price: 4.99,
            basePrice: 4.99,
            unitOfMeasure: 'EA',
            isEBTEligible: true,
            categoryId: 'c-1',
        },
    ],
};

jest.mock('react-redux', () => ({
    useDispatch: () => mockDispatch,
    useSelector: (selector: (state: any) => unknown) =>
        selector({
            printer: { default: { id: 'printer-1' } },
            storeInfo: { current: { id: 'store-1', name: 'Store' } },
            employees: { loginEmployee: { roles: ['Receive Check Payment'] } },
        }),
}));

jest.mock('@pos/theme/native', () => ({
    useSharedStyles: () => ({
        overlay: {},
        primaryText: { color: '#fff' },
        secondaryText: { color: '#999' },
        textCenter: { textAlign: 'center' },
        miniDataRow: {},
        veryLightText: { color: '#666' },
        inputContainerStyle: {},
        inputStyle: {},
    }),
}));

jest.mock('@pos/theme/native/design-tokens', () => ({
    useDesignTokens: () => ({
        colors: {
            border: '#222',
            surface: '#111',
            surfaceMuted: '#1a1a1a',
            textPrimary: '#fff',
            textSecondary: '#999',
            textMuted: '#999',
            accent: '#4aa3eb',
            success: '#34c759',
        },
        spacing: {
            xs: 4,
            sm: 8,
            md: 12,
            lg: 16,
            xl: 20,
        },
        radii: {
            md: 8,
            lg: 12,
        },
    }),
}));

jest.mock('@rneui/themed', () => ({
    Dialog: ({
        children,
        isVisible,
    }: {
        children: React.ReactNode;
        isVisible: boolean;
    }) => {
        const { View } = require('react-native');
        return isVisible ? <View>{children}</View> : null;
    },
    Button: ({
        title,
        onPress,
        testID,
        children,
    }: {
        title?: string;
        onPress?: () => void;
        testID?: string;
        children?: React.ReactNode;
    }) => {
        const { Pressable, Text, View } = require('react-native');
        return (
            <Pressable onPress={onPress} testID={testID || title}>
                <View>{children}</View>
                {title ? <Text>{title}</Text> : null}
            </Pressable>
        );
    },
}));

jest.mock('@pos/orders/data-access', () => ({
    OrderEntityMapper: {
        asCartState: jest.fn((order) => ({
            id: order.id,
            orderNo: order.orderNo,
            items: order.lines.map((line: any) => ({
                identifier: line.identifier,
                quantity: line.quantity,
                product: {
                    id: line.productId,
                    name: line.productName,
                    price: line.basePrice ?? line.price,
                    unitOfMeasure: line.unitOfMeasure,
                    categoryId: line.categoryId,
                    isEBTEligible: line.isEBTEligible,
                },
            })),
            footer: {
                baseSubtotal: order.baseSubtotal ?? order.subtotal,
                subtotal: order.subtotal,
                lineDiscountTotal: order.lineDiscountTotal ?? 0,
                orderDiscountTotal: order.orderDiscountTotal ?? 0,
                tax: order.tax,
                discount: order.discountTotal ?? 0,
                savingsTotal: order.savingsTotal ?? 0,
                total: order.total,
                pricingSource: order.pricingSource,
                reconciliationStatus: order.reconciliationStatus,
            },
            promoCodes: [],
            manualDiscounts: [],
            priceOverrides: [],
            approvalEvents: [],
            definitions: [],
            appliedDiscountSummary: undefined,
        })),
    },
    OrderService: {
        buildPrintTicketPreview: (...args: unknown[]) =>
            mockBuildPrintTicketPreview(...args),
    },
    payOrder: Object.assign(
        jest.fn((payload) => payload),
        {
            fulfilled: {
                match: (result: any) => result?.type === 'order/pay/fulfilled',
            },
        },
    ),
}));

jest.mock('@pos/sales/data-access', () => ({
    cartActions: {
        set: (payload: unknown) => ({ type: 'cart/set', payload }),
    },
}));

jest.mock('@pos/sales/native-feature', () => ({
    buildDiscountBreakdown: jest.fn(() => []),
    buildOrderSummary: jest.fn((cart) => ({
        lines: cart.items.map((item: any) => ({
            id: item.identifier,
            name: item.product.name,
            quantity: item.quantity,
            unitLabel: item.product.unitOfMeasure.toLowerCase(),
            unitPrice: item.product.price,
            originalTotal: item.product.price * item.quantity,
            finalTotal: item.product.price * item.quantity,
            savings: 0,
            discounts: [],
        })),
        promoCodes: [],
        warnings: [],
        subtotal: cart.footer.subtotal,
        discountTotal: cart.footer.discount,
        tax: cart.footer.tax,
        total: cart.footer.total,
        savingsTotal: cart.footer.savingsTotal,
        ebtEligibleTotal: cart.footer.total,
    })),
    createCartStyles: jest.fn(() => ({
        summaryFooter: {},
        summaryFooterTotalBlock: {},
        summaryFooterLabel: {},
        summaryFooterValue: {},
        summaryFooterActions: {},
        summarySecondaryButton: {},
        summarySecondaryButtonTitle: {},
    })),
    OrderSummaryPanel: ({
        title,
        footer,
    }: {
        title: string;
        footer?: React.ReactNode;
    }) => {
        const { View, Text } = require('react-native');
        return (
            <View testID="mock-order-summary-panel">
                <Text>{title}</Text>
                {footer}
            </View>
        );
    },
    CartPayment: ({
        onPaymentEntered,
        footerActions,
    }: {
        onPaymentEntered: (
            payments: Array<{ type: string; amount: number }>,
        ) => void;
        footerActions?: React.ReactNode;
    }) => {
        const { View, Pressable, Text } = require('react-native');
        return (
            <View>
                <Pressable
                    testID="mock-cart-payment-submit"
                    onPress={() =>
                        onPaymentEntered([{ type: 'CASH', amount: 20 }])
                    }
                >
                    <Text>Submit Payment</Text>
                </Pressable>
                {footerActions}
            </View>
        );
    },
}));

jest.mock(
    '../../../../../../sales/native-feature/src/lib/components/cart-payment/cart-payment-dialog',
    () => ({
        CartPaymentDialog: ({
            visible,
            summaryActions,
            paymentFooterActions,
        }: {
            visible: boolean;
            summaryActions?: React.ReactNode;
            paymentFooterActions?: React.ReactNode;
        }) => {
            const { View } = require('react-native');
            return visible ? (
                <View testID="mock-cart-payment-dialog">
                    {summaryActions}
                    {paymentFooterActions}
                </View>
            ) : null;
        },
    }),
);

jest.mock('@pos/printings/data-access', () => ({
    getDefaultPrinter: (state: any) => state.printer.default,
    printReceipt: (...args: unknown[]) => mockPrintReceipt(...args),
    PrinterEntityMapper: { fromModel: jest.fn((printer) => printer) },
    PrinterService: { getDefaultPrinter: () => mockGetDefaultPrinter() },
}));

jest.mock('@pos/store-info/data-access', () => ({
    selectStore: (state: any) => state.storeInfo.current,
    StoreInfoEntityMapper: { fromModel: jest.fn((store) => store) },
    StoreInfoService: { getStore: () => mockGetStore() },
}));

jest.mock('@pos/employees/data-access', () => ({
    selectLoginEmployee: (state: any) => state.employees.loginEmployee,
}));

jest.mock('@pos/auth/data-access', () => ({
    Role: { Checks: 'Receive Check Payment' },
}));

const { OpenOrderPaymentDialog } = require('./open-order-payment-dialog');

describe('OpenOrderPaymentDialog', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockDispatch.mockImplementation((action: any) =>
            Promise.resolve({ type: 'order/pay/fulfilled', payload: action }),
        );
        mockGetStore.mockResolvedValue([{ id: 'store-fallback' }]);
        mockGetDefaultPrinter.mockResolvedValue({ id: 'printer-fallback' });
    });

    it('opens the Sales payment flow when requested', () => {
        const onClose = jest.fn();

        const view = render(
            <OpenOrderPaymentDialog
                visible={true}
                order={mockOrder}
                navigation={{ navigate: mockNavigate }}
                onClose={onClose}
            />,
        );

        fireEvent.press(
            view.getByTestId('open-order-payment-open-in-sales-button'),
        );

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'cart/set',
            payload: mockOrder,
        });
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith('Sales', { mode: 'payment' });
    });

    it('prints a customer reference from the payment dialog', async () => {
        const view = render(
            <OpenOrderPaymentDialog
                visible={true}
                order={mockOrder}
                navigation={{ navigate: mockNavigate }}
                onClose={jest.fn()}
            />,
        );

        fireEvent.press(view.getByTestId('open-order-payment-print-button'));

        await waitFor(() =>
            expect(mockBuildPrintTicketPreview).toHaveBeenCalledWith(
                expect.objectContaining({ id: 'open-1' }),
                'CUSTOMER',
            ),
        );
        expect(mockPrintReceipt).toHaveBeenCalled();
    });
});
