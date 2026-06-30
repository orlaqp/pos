/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

jest.mock('@pos/theme/native', () => ({
    useSharedStyles: () => ({
        overlay: {},
    }),
}));

jest.mock('@pos/theme/native/design-tokens', () => ({
    useDesignTokens: () => ({
        colors: {
            border: '#222',
            textPrimary: '#fff',
            textMuted: '#999',
        },
        spacing: {
            xs: 4,
            sm: 8,
            md: 12,
            lg: 16,
        },
        radii: {
            sm: 6,
            md: 8,
            lg: 12,
        },
    }),
}));

jest.mock('@rneui/themed', () => ({
    Button: ({
        title,
        onPress,
        testID,
        disabled,
    }: {
        title: string;
        onPress: () => void;
        testID?: string;
        disabled?: boolean;
    }) => {
        const { Pressable, Text } = require('react-native');
        return (
            <Pressable
                testID={testID}
                onPress={onPress}
                disabled={disabled}
                accessibilityState={{ disabled: !!disabled }}
            >
                <Text>{title}</Text>
            </Pressable>
        );
    },
    Dialog: ({
        children,
        isVisible,
    }: {
        children: React.ReactNode;
        isVisible: boolean;
    }) => (isVisible ? children : null),
}));

jest.mock('../cart/cart.logic', () => ({
    buildDiscountBreakdown: () => [],
    buildOrderSummary: () => ({
        lines: [],
        subtotal: 24.99,
        tax: 0,
        total: 24.99,
        ebtEligibleTotal: 0,
    }),
}));

jest.mock('../cart/cart.styles', () => ({
    createCartStyles: () => ({
        summaryFooter: {},
        summaryFooterActions: {},
        summaryFooterLabel: {},
        summaryFooterTotalBlock: {},
        summaryFooterValue: {},
    }),
}));

jest.mock('../cart/order-summary-panel', () => ({
    OrderSummaryPanel: ({
        contentTestID,
        footer,
        title,
    }: {
        contentTestID?: string;
        footer?: React.ReactNode;
        title?: string;
    }) => {
        const { Text, View } = require('react-native');
        return (
            <View testID={contentTestID}>
                <Text>{title}</Text>
                {footer}
            </View>
        );
    },
}));

jest.mock('./cart-payment', () => ({
    __esModule: true,
    default: ({ footerActions }: { footerActions?: React.ReactNode }) => {
        const { View } = require('react-native');
        return <View testID="mock-cart-payment">{footerActions}</View>;
    },
}));

const { default: CartPaymentDialog } = require('./cart-payment-dialog');

describe('CartPaymentDialog', () => {
    const baseProps = {
        visible: true,
        cart: { items: [{ product: { price: 24.99 }, quantity: 1 }] },
        canReceiveChecks: true,
        onClose: jest.fn(),
        onPaymentEntered: jest.fn(),
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('defaults to the expanded order summary and can collapse to a rail', () => {
        const { getByTestId, queryByTestId } = render(
            <CartPaymentDialog {...baseProps} />
        );

        expect(getByTestId('cart-payment-summary')).toBeTruthy();
        expect(getByTestId('cart-payment-summary-column')).toHaveStyle({
            flex: 2.6,
        });
        expect(getByTestId('cart-payment-column')).toHaveStyle({
            flex: 7.4,
        });

        fireEvent.press(getByTestId('cart-payment-summary-toggle'));

        expect(queryByTestId('cart-payment-summary')).toBeNull();
        expect(getByTestId('cart-payment-summary-rail-label')).toHaveTextContent(
            'ORDER SUMMARY'
        );
        expect(queryByTestId('cart-payment-summary-rail-total')).toBeNull();
        expect(queryByTestId('cart-payment-summary-rail-meta')).toBeNull();
        expect(getByTestId('cart-payment-summary-column')).toHaveStyle({
            width: 64,
        });
        expect(getByTestId('cart-payment-column')).toHaveStyle({
            flex: 1,
        });
    });

    it('uses a compact top close action instead of a footer close button', () => {
        const { getByTestId, queryByTestId } = render(
            <CartPaymentDialog {...baseProps} />
        );

        expect(getByTestId('cart-payment-dialog-close-icon-button')).toBeTruthy();
        expect(queryByTestId('cart-payment-dialog-close-button')).toBeNull();
    });
});
