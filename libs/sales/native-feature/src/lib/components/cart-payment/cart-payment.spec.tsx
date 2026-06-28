/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { Alert } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';

jest.mock('@pos/theme/native', () => ({
    useSharedStyles: () => ({
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
            textMuted: '#999',
        },
        spacing: {
            xs: 4,
            sm: 8,
            md: 12,
        },
        radii: {
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
    }) =>
        (() => {
            const { Pressable, Text } = require('react-native');
            return (
                <Pressable
                    onPress={onPress}
                    testID={testID || 'submit-payment'}
                    disabled={disabled}
                    accessibilityState={{ disabled: !!disabled }}
                >
                    <Text>{title}</Text>
                </Pressable>
            );
        })(),
}));

jest.mock('@pos/shared/ui-native', () => {
    const { View, TextInput } = require('react-native');
    const { Controller, useFormContext } = require('react-hook-form');

    const UINumericInput = ({
        name,
        testID,
        onFocus,
        onBlur,
        onEndEditing,
        onChangeText,
        disabled,
        selectTextOnFocus,
    }: {
        name: string;
        testID?: string;
        onFocus?: () => void;
        onBlur?: () => void;
        onEndEditing?: () => void;
        onChangeText?: (text: string) => void;
        disabled?: boolean;
        selectTextOnFocus?: boolean;
    }) => {
        const { control } = useFormContext();
        return (
            <Controller
                control={control}
                name={name}
                render={({ field: { value, onChange } }) => (
                    <TextInput
                        testID={testID || `input-${name}`}
                        editable={!disabled}
                        value={`${value ?? ''}`}
                        onChangeText={(text) => {
                            onChange(text);
                            onChangeText?.(text);
                        }}
                        onFocus={onFocus}
                        onBlur={onBlur}
                        onEndEditing={onEndEditing}
                        selectTextOnFocus={selectTextOnFocus}
                    />
                )}
            />
        );
    };

    return {
        UICard: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
        UINumericInput,
        UIVerticalSpacer: () => <View />,
    };
});

const { default: CartPayment } = require('./cart-payment');

describe('CartPayment integration', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    it('auto-fills EBT max and remaining cash, then submits payment split', () => {
        const onPaymentEntered = jest.fn();
        const { getByTestId } = render(
            <CartPayment
                total={89.9}
                ebtEligibleTotal={24.9}
                canReceiveChecks={false}
                onPaymentEntered={onPaymentEntered}
            />
        );

        fireEvent.press(getByTestId('payment-card-ebt'));
        expect(getByTestId('payment-input-ebt')).toHaveProp('value', '24.9');

        fireEvent.press(getByTestId('payment-card-cash'));
        expect(getByTestId('payment-input-cash')).toHaveProp('value', '65');

        fireEvent.press(getByTestId('payment-submit-button'));

        expect(onPaymentEntered).toHaveBeenCalledWith([
            { type: 'CASH', amount: 65 },
            { type: 'EBT', amount: 24.9 },
        ]);
    });

    it('restores prior amount when field is focused/cleared and blurred empty', () => {
        const onPaymentEntered = jest.fn();
        const { getByTestId } = render(
            <CartPayment
                total={89.9}
                ebtEligibleTotal={24.9}
                canReceiveChecks={false}
                onPaymentEntered={onPaymentEntered}
            />
        );

        fireEvent.press(getByTestId('payment-card-ebt'));
        const ebtInput = getByTestId('payment-input-ebt');
        expect(ebtInput).toHaveProp('value', '24.9');

        fireEvent(ebtInput, 'focus');
        expect(ebtInput).toHaveProp('value', '');

        fireEvent(ebtInput, 'blur');
        fireEvent(ebtInput, 'endEditing');
        act(() => {
            jest.runAllTimers();
        });

        expect(getByTestId('payment-input-ebt')).toHaveProp('value', '24.9');
        expect(getByTestId('payment-submit-button')).toHaveProp('accessibilityState', {
            disabled: true,
        });
    });

    it('keeps receive payment disabled until the entered amount matches exactly', () => {
        const onPaymentEntered = jest.fn();
        const { getByTestId } = render(
            <CartPayment
                total={20}
                ebtEligibleTotal={0}
                canReceiveChecks={false}
                onPaymentEntered={onPaymentEntered}
            />
        );

        fireEvent.press(getByTestId('payment-card-cash'));

        expect(getByTestId('payment-submit-button')).toHaveProp('accessibilityState', {
            disabled: false,
        });

        fireEvent.changeText(getByTestId('payment-input-cash'), '15');
        expect(getByTestId('payment-submit-button')).toHaveProp('accessibilityState', {
            disabled: true,
        });

        fireEvent.changeText(getByTestId('payment-input-cash'), '20');
        expect(getByTestId('payment-submit-button')).toHaveProp('accessibilityState', {
            disabled: false,
        });
    });

    it('keeps receive payment disabled when entered payments exceed the amount due', () => {
        const onPaymentEntered = jest.fn();
        const { getByTestId } = render(
            <CartPayment
                total={20}
                ebtEligibleTotal={0}
                canReceiveChecks={false}
                onPaymentEntered={onPaymentEntered}
            />
        );

        fireEvent.press(getByTestId('payment-card-cash'));
        fireEvent.changeText(getByTestId('payment-input-cash'), '25');

        expect(getByTestId('payment-submit-button')).toHaveProp('accessibilityState', {
            disabled: true,
        });
    });

    it('caps EBT before submit instead of showing a late validation alert', () => {
        const onPaymentEntered = jest.fn();
        const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
        const { getByTestId } = render(
            <CartPayment
                total={100}
                ebtEligibleTotal={24.9}
                canReceiveChecks={false}
                onPaymentEntered={onPaymentEntered}
            />
        );

        fireEvent.press(getByTestId('payment-card-ebt'));
        fireEvent.changeText(getByTestId('payment-input-ebt'), '50');
        fireEvent.press(getByTestId('payment-card-cash'));
        fireEvent.press(getByTestId('payment-submit-button'));

        expect(alertSpy).not.toHaveBeenCalled();
        expect(onPaymentEntered).toHaveBeenCalledWith([
            { type: 'CASH', amount: 75.1 },
            { type: 'EBT', amount: 24.9 },
        ]);
    });

    it('renders check method when user can receive checks', () => {
        const onPaymentEntered = jest.fn();
        const { getByTestId } = render(
            <CartPayment
                total={10}
                ebtEligibleTotal={0}
                canReceiveChecks={true}
                onPaymentEntered={onPaymentEntered}
            />
        );

        expect(getByTestId('payment-card-check')).toBeTruthy();
        expect(getByTestId('payment-input-check')).toBeTruthy();
    });

    it('deactivates an active payment card and resets its amount to zero', () => {
        const onPaymentEntered = jest.fn();
        const { getByTestId } = render(
            <CartPayment
                total={20}
                ebtEligibleTotal={0}
                canReceiveChecks={false}
                onPaymentEntered={onPaymentEntered}
            />
        );

        fireEvent.press(getByTestId('payment-card-cash'));
        expect(getByTestId('payment-input-cash')).toHaveProp('value', '20');

        fireEvent.press(getByTestId('payment-card-cash'));
        expect(getByTestId('payment-input-cash')).toHaveProp('value', '0');
        expect(getByTestId('payment-submit-button')).toHaveProp('accessibilityState', {
            disabled: true,
        });
    });

    it('activates and autofills a payment method when the amount input is focused', () => {
        const onPaymentEntered = jest.fn();
        const { getByTestId } = render(
            <CartPayment
                total={20}
                ebtEligibleTotal={0}
                canReceiveChecks={false}
                onPaymentEntered={onPaymentEntered}
            />
        );

        fireEvent(getByTestId('payment-input-cash'), 'focus');

        expect(getByTestId('payment-input-cash')).toHaveProp('value', '20');
        expect(getByTestId('payment-submit-button')).toHaveProp('accessibilityState', {
            disabled: false,
        });
    });

    it('shows credit card surcharge summary and emits enriched card payment', () => {
        const onPaymentEntered = jest.fn();
        const { getByTestId, getByText } = render(
            <CartPayment
                total={100}
                ebtEligibleTotal={0}
                canReceiveChecks={false}
                creditCardSurchargePercent={3}
                onPaymentEntered={onPaymentEntered}
            />
        );

        fireEvent.press(getByTestId('payment-card-cc'));

        const surchargeLabel = getByText('Credit Card Surcharge');
        const surchargeAmount = getByText('$ 3.00');
        const chargeLabel = getByText('Charge to card');
        const chargeAmount = getByText('$ 103.00');

        expect(surchargeLabel).toHaveStyle({ flex: 1, minWidth: 0 });
        expect(surchargeAmount).toHaveStyle({
            flexShrink: 0,
            textAlign: 'right',
        });
        expect(chargeLabel).toHaveStyle({ flex: 1, minWidth: 0 });
        expect(chargeAmount).toHaveStyle({
            flexShrink: 0,
            textAlign: 'right',
        });

        fireEvent.press(getByTestId('payment-submit-button'));

        expect(onPaymentEntered).toHaveBeenCalledWith([
            {
                type: 'CC',
                amount: 100,
                baseAmount: 100,
                surchargeRate: 3,
                surchargeAmount: 3,
            },
        ]);
    });

    it('emits split tender with surcharge metadata only on card payment', () => {
        const onPaymentEntered = jest.fn();
        const { getByTestId } = render(
            <CartPayment
                total={100}
                ebtEligibleTotal={0}
                canReceiveChecks={false}
                creditCardSurchargePercent={3}
                onPaymentEntered={onPaymentEntered}
            />
        );

        fireEvent.press(getByTestId('payment-card-cash'));
        fireEvent.changeText(getByTestId('payment-input-cash'), '40');
        fireEvent.press(getByTestId('payment-card-cc'));
        fireEvent.changeText(getByTestId('payment-input-cc'), '60');
        fireEvent.press(getByTestId('payment-submit-button'));

        expect(onPaymentEntered).toHaveBeenCalledWith([
            { type: 'CC', amount: 60, baseAmount: 60, surchargeRate: 3, surchargeAmount: 1.8 },
            { type: 'CASH', amount: 40 },
        ]);
    });

    it('does not show surcharge details for non-card payments', () => {
        const onPaymentEntered = jest.fn();
        const { getByTestId, queryByText } = render(
            <CartPayment
                total={50}
                ebtEligibleTotal={0}
                canReceiveChecks={false}
                creditCardSurchargePercent={3}
                onPaymentEntered={onPaymentEntered}
            />
        );

        fireEvent.press(getByTestId('payment-card-cash'));

        expect(queryByText('Credit Card Surcharge')).toBeNull();
        expect(queryByText('Charge to card')).toBeNull();
    });

    it('rebalances the paired payment method while typing in a two-method split', () => {
        const onPaymentEntered = jest.fn();
        const { getByTestId, getByText, queryByTestId } = render(
            <CartPayment
                total={100}
                ebtEligibleTotal={0}
                canReceiveChecks={false}
                onPaymentEntered={onPaymentEntered}
            />
        );

        fireEvent.press(getByTestId('payment-card-cash'));
        fireEvent.press(getByTestId('payment-card-cc'));
        fireEvent.changeText(getByTestId('payment-input-cash'), '20');

        expect(getByTestId('payment-input-cash')).toHaveProp('value', '20');
        expect(getByTestId('payment-input-cc')).toHaveProp('value', '80');
        expect(getByText('Cashier-entered amount')).toBeTruthy();
        expect(getByText('Auto-calculated remaining')).toBeTruthy();
        expect(getByTestId('payment-split-balance-bar')).toBeTruthy();
        expect(getByTestId('payment-split-balance-bar')).toHaveStyle({
            gap: 3,
        });
        expect(getByTestId('payment-balance-segment-cash')).not.toHaveStyle({
            backgroundColor: '#4EA3FF',
        });
        expect(getByTestId('payment-balance-dot-cash')).not.toHaveStyle({
            backgroundColor: '#4EA3FF',
        });

        fireEvent.changeText(getByTestId('payment-input-cash'), '100');

        expect(queryByTestId('payment-balance-segment-cc')).toBeNull();
        expect(getByTestId('payment-balance-segment-cash')).toHaveStyle({
            backgroundColor: '#4FC37B',
            flexGrow: 100,
        });
    });

    it('flips the calculated method when the cashier edits the calculated side', () => {
        const onPaymentEntered = jest.fn();
        const { getByTestId } = render(
            <CartPayment
                total={100}
                ebtEligibleTotal={0}
                canReceiveChecks={false}
                onPaymentEntered={onPaymentEntered}
            />
        );

        fireEvent.press(getByTestId('payment-card-cash'));
        fireEvent.press(getByTestId('payment-card-cc'));
        fireEvent.changeText(getByTestId('payment-input-cash'), '20');
        fireEvent.changeText(getByTestId('payment-input-cc'), '75');

        expect(getByTestId('payment-input-cc')).toHaveProp('value', '75');
        expect(getByTestId('payment-input-cash')).toHaveProp('value', '25');
    });

    it('caps EBT while typing and recalculates the paired payment method', () => {
        const onPaymentEntered = jest.fn();
        const { getByTestId, getByText } = render(
            <CartPayment
                total={100}
                ebtEligibleTotal={35}
                canReceiveChecks={false}
                onPaymentEntered={onPaymentEntered}
            />
        );

        fireEvent.press(getByTestId('payment-card-ebt'));
        fireEvent.press(getByTestId('payment-card-cash'));
        fireEvent.changeText(getByTestId('payment-input-ebt'), '50');

        expect(getByTestId('payment-input-ebt')).toHaveProp('value', '35');
        expect(getByTestId('payment-input-cash')).toHaveProp('value', '65');
        expect(getByText('EBT capped at eligible amount')).toBeTruthy();
        expect(getByTestId('payment-submit-button')).toHaveProp('accessibilityState', {
            disabled: false,
        });
    });

    it('keeps three-method splits manual while still tracking remaining balance', () => {
        const onPaymentEntered = jest.fn();
        const { getByTestId, queryByTestId } = render(
            <CartPayment
                total={100}
                ebtEligibleTotal={35}
                canReceiveChecks={true}
                onPaymentEntered={onPaymentEntered}
            />
        );

        fireEvent.press(getByTestId('payment-card-cash'));
        fireEvent.press(getByTestId('payment-card-cc'));
        fireEvent.press(getByTestId('payment-card-check'));
        fireEvent.changeText(getByTestId('payment-input-cash'), '20');

        expect(getByTestId('payment-input-cash')).toHaveProp('value', '20');
        expect(getByTestId('payment-input-cc')).toHaveProp('value', '0');
        expect(getByTestId('payment-input-check')).toHaveProp('value', '0');
        expect(queryByTestId('payment-split-balance-bar')).toBeNull();
    });

    it('uses compact fixed-height method tiles in compact payment layouts', () => {
        const onPaymentEntered = jest.fn();
        const { getByTestId, queryByTestId } = render(
            <CartPayment
                total={100}
                ebtEligibleTotal={35}
                canReceiveChecks={true}
                onPaymentEntered={onPaymentEntered}
                layout="compact"
            />
        );

        expect(queryByTestId('payment-methods-scroll')).toBeNull();
        expect(getByTestId('payment-methods-grid')).toHaveStyle({
            flexShrink: 0,
        });
        expect(getByTestId('payment-card-cc')).toHaveStyle({
            minHeight: 66,
        });
        expect(getByTestId('payment-amount-preview-cc')).toHaveTextContent('$0.00');
        expect(queryByTestId('payment-input-cc')).toBeNull();
        expect(getByTestId('payment-card-cash')).toBeTruthy();
        expect(getByTestId('payment-card-check')).toBeTruthy();
        expect(getByTestId('payment-card-ebt')).toBeTruthy();

        fireEvent.press(getByTestId('payment-card-cash'));

        expect(queryByTestId('payment-amount-preview-cash')).toBeNull();
        expect(queryByTestId('payment-method-active-row-cash')).not.toBeNull();
        expect(getByTestId('payment-input-cash')).toHaveProp('value', '100');
        expect(getByTestId('payment-method-label-cash')).toHaveStyle({
            paddingLeft: 10,
        });
        expect(getByTestId('payment-input-wrap-cash')).toHaveStyle({
            width: '50%',
        });
    });

    it('rebalances compact payment tiles while typing in a two-method split', () => {
        const onPaymentEntered = jest.fn();
        const { getByTestId, queryByText } = render(
            <CartPayment
                total={100}
                ebtEligibleTotal={0}
                canReceiveChecks={true}
                onPaymentEntered={onPaymentEntered}
                layout="compact"
            />
        );

        fireEvent.press(getByTestId('payment-card-cc'));
        fireEvent.press(getByTestId('payment-card-check'));
        fireEvent.changeText(getByTestId('payment-input-cc'), '23.99');

        expect(getByTestId('payment-input-cc')).toHaveProp('value', '23.99');
        expect(getByTestId('payment-input-check')).toHaveProp('value', '76.01');
        expect(queryByText('Cashier-entered amount')).toBeNull();
        expect(queryByText('Auto-calculated remaining')).toBeNull();
    });

    it('flips the calculated compact payment tile when the cashier edits it', () => {
        const onPaymentEntered = jest.fn();
        const { getByTestId } = render(
            <CartPayment
                total={24.99}
                ebtEligibleTotal={0}
                canReceiveChecks={true}
                onPaymentEntered={onPaymentEntered}
                layout="compact"
            />
        );

        fireEvent.press(getByTestId('payment-card-cc'));
        fireEvent.press(getByTestId('payment-card-check'));
        fireEvent.changeText(getByTestId('payment-input-cc'), '23.99');
        fireEvent.changeText(getByTestId('payment-input-check'), '10');

        expect(getByTestId('payment-input-check')).toHaveProp('value', '10');
        expect(getByTestId('payment-input-cc')).toHaveProp('value', '14.99');
    });

    it('selects the full payment amount when a payment field receives focus', () => {
        const onPaymentEntered = jest.fn();
        const { getByTestId } = render(
            <CartPayment
                total={100}
                ebtEligibleTotal={0}
                canReceiveChecks={false}
                onPaymentEntered={onPaymentEntered}
            />
        );

        expect(getByTestId('payment-input-cash')).toHaveProp('selectTextOnFocus', true);
    });
});
