/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { Alert, Pressable, Text } from 'react-native';
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
    const { View, TextInput, Switch } = require('react-native');
    const { Controller, useFormContext } = require('react-hook-form');

    const UISwitch = ({ name, testID }: { name: string; testID?: string }) => {
        const { control } = useFormContext();
        return (
            <Controller
                control={control}
                name={name}
                render={({ field: { onChange, value } }) => (
                    <Switch
                        testID={testID || `switch-${name}`}
                        value={!!value}
                        onValueChange={onChange}
                    />
                )}
            />
        );
    };

    const UINumericInput = ({
        name,
        testID,
        onFocus,
        onBlur,
        onEndEditing,
        disabled,
    }: {
        name: string;
        testID?: string;
        onFocus?: () => void;
        onBlur?: () => void;
        onEndEditing?: () => void;
        disabled?: boolean;
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
                        onChangeText={onChange}
                        onFocus={onFocus}
                        onBlur={onBlur}
                        onEndEditing={onEndEditing}
                    />
                )}
            />
        );
    };

    return {
        UICard: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
        UISwitch,
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

        fireEvent(getByTestId('payment-switch-ebt'), 'valueChange', true);
        expect(getByTestId('payment-input-ebt')).toHaveProp('value', '24.9');

        fireEvent(getByTestId('payment-switch-cash'), 'valueChange', true);
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

        fireEvent(getByTestId('payment-switch-ebt'), 'valueChange', true);
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

        fireEvent(getByTestId('payment-switch-cash'), 'valueChange', true);

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

        fireEvent(getByTestId('payment-switch-cash'), 'valueChange', true);
        fireEvent.changeText(getByTestId('payment-input-cash'), '25');

        expect(getByTestId('payment-submit-button')).toHaveProp('accessibilityState', {
            disabled: true,
        });
    });

    it('validates EBT cannot exceed eligible total', () => {
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

        fireEvent(getByTestId('payment-switch-ebt'), 'valueChange', true);
        fireEvent.changeText(getByTestId('payment-input-ebt'), '50');
        fireEvent(getByTestId('payment-switch-cash'), 'valueChange', true);
        fireEvent.changeText(getByTestId('payment-input-cash'), '50');
        fireEvent.press(getByTestId('payment-submit-button'));

        expect(alertSpy).toHaveBeenCalledWith(
            'EBT validation failed',
            expect.stringContaining('$50.00')
        );
        expect(onPaymentEntered).not.toHaveBeenCalled();
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

        expect(getByTestId('payment-switch-check')).toBeTruthy();
        expect(getByTestId('payment-input-check')).toBeTruthy();
    });
});
