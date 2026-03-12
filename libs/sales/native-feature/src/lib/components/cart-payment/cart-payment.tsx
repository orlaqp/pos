import type { CartPayment as ICartPayment } from '@pos/sales/data-access';
import { PaymentType } from '@pos/shared/api';
import {
    UINumericInput,
    UISwitch,
    UIVerticalSpacer,
} from '@pos/shared/ui-native';
import { useSharedStyles } from '@pos/theme/native';
import { Button } from '@rneui/themed';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import {
    getAutoFillAmount,
    getRestoredValue,
    PaymentKey,
    shouldRestoreValue,
    toNumber,
} from './cart-payment.logic';

import { View, Text, Alert } from 'react-native';

const round2Dec = (value: number) => +value.toFixed(2);

const PaymentMethod = {
    cc: { label: 'Credit Card', type: PaymentType.CC },
    cash: { label: 'Cash', type: PaymentType.CASH },
    check: { label: 'Check', type: PaymentType.CHECK },
    ebt: { label: 'EBT', type: PaymentType.EBT },
} as const;

interface PaymentInfo {
    withcash: boolean;
    cash: number;
    withcheck: boolean;
    check: number;
    withcc: boolean;
    cc: number;
    withebt: boolean;
    ebt: number;
}

/* eslint-disable-next-line */
export interface CartPaymentProps {
    total: number;
    ebtEligibleTotal: number;
    canReceiveChecks: boolean;
    onPaymentEntered: (payments: ICartPayment[]) => void;
}

export function CartPayment({ total, ebtEligibleTotal, canReceiveChecks, onPaymentEntered }: CartPaymentProps) {
    const styles = useSharedStyles();
    const [formValue, setFormValue] = useState<PaymentInfo>();
    const previousValues = useRef<Partial<Record<PaymentKey, number>>>({});
    const form = useForm<PaymentInfo>({
        mode: 'onChange',
        defaultValues: {
            withcash: false,
            cash: 0,
            withcheck: false,
            check: 0,
            withcc: false,
            cc: 0,
            withebt: false,
            ebt: 0,
        },
    });

    const paymentMethods = useMemo(() => {
        return (Object.keys(PaymentMethod) as PaymentKey[]).filter(
            (x) => x !== 'check' || canReceiveChecks
        );
    }, [canReceiveChecks]);

    const restoreIfEmpty = (method: PaymentKey) => {
        const currentValue = form.getValues(method);
        if (!shouldRestoreValue(currentValue)) return;
        form.setValue(method, getRestoredValue(previousValues.current[method]));
    };

    const completeOrder = (info: PaymentInfo) => {
        const result: ICartPayment[] = [];
        let received = 0;
        let ebtReceived = 0;

        paymentMethods.forEach((method) => {
            const amount = +(info[method] || 0);
            if (amount <= 0) return;

            result.push({ type: PaymentMethod[method].type, amount });
            received += amount;

            if (method === 'ebt') {
                ebtReceived += amount;
            }
        });

        if (round2Dec(received) < round2Dec(total)) {
            Alert.alert('Received payment cannot be less than the total');
            return;
        }

        if (round2Dec(ebtReceived) > round2Dec(ebtEligibleTotal)) {
            Alert.alert(
                'EBT validation failed',
                `EBT amount ($${ebtReceived.toFixed(2)}) cannot exceed EBT-eligible amount ($${ebtEligibleTotal.toFixed(2)}).`
            );
            return;
        }

        onPaymentEntered(result);
    }

    useEffect(() => {
        const subscription = form.watch((value, { name }) => {
            if (!name?.startsWith('with')) return;

            const paymentType = name.replace('with', '') as PaymentKey;
            const values = value as PaymentInfo;
            setFormValue(values);

            const selected = !!values[name as keyof PaymentInfo];
            const currentAmount = +(values[paymentType] || 0);

            if (!selected) {
                form.setValue(paymentType, 0);
                return;
            }

            if (currentAmount > 0) return;

            form.setValue(
                paymentType,
                getAutoFillAmount(
                    paymentType,
                    values,
                    paymentMethods,
                    total,
                    ebtEligibleTotal
                )
            );
        });

        return () => subscription.unsubscribe();
    }, [ebtEligibleTotal, form, paymentMethods, total]);

    useEffect(() => {
        const subscription = form.watch((value, { name }) => {
            if (!name) return;

            const paymentKey = name as PaymentKey;
            if (!paymentMethods.includes(paymentKey)) return;

            const raw = value[paymentKey];
            const rawText = `${raw ?? ''}`.trim();
            if (rawText === '') return;

            previousValues.current[paymentKey] = toNumber(raw);
        });

        return () => subscription.unsubscribe();
    }, [form, paymentMethods]);

    return (
        <View>
            <FormProvider {...form}>
                <View>
                    <Text
                        style={[
                            styles.primaryText,
                            styles.textCenter,
                            { fontSize: 32, marginBottom: 20 },
                        ]}
                    >
                        $ {total.toFixed(2)}
                    </Text>
                    <Text
                        style={[
                            styles.secondaryText,
                            styles.textCenter,
                            { marginBottom: 12 },
                        ]}
                    >
                        EBT Eligible: $ {ebtEligibleTotal.toFixed(2)}
                    </Text>
                </View>
                {paymentMethods.map((m) => (
                    <View key={m} style={[styles.miniDataRow]}>
                        <View style={{ flex: 1, paddingLeft: 15 }}>
                            <UISwitch
                                name={`with${m}`}
                                testID={`payment-switch-${m}`}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text
                                style={[
                                    formValue && formValue[`with${m}` as keyof PaymentInfo]
                                        ? styles.primaryText
                                        : styles.veryLightText,
                                    { fontWeight: 'bold' },
                                ]}
                            >
                                {PaymentMethod[m].label}
                            </Text>
                        </View>
                        <View style={{ flex: 2 }}>
                            <UINumericInput
                                testID={`payment-input-${m}`}
                                keyboardType="decimal-pad"
                                name={m}
                                allowDecimals={true}
                                textAlign="right"
                                lIcon="currency-usd"
                                clearTextOnFocus={false}
                                selectTextOnFocus={true}
                                onFocus={() => {
                                    previousValues.current[m] = toNumber(form.getValues(m));
                                    form.setValue(m, '');
                                }}
                                onBlur={() => setTimeout(() => restoreIfEmpty(m), 0)}
                                onEndEditing={() => setTimeout(() => restoreIfEmpty(m), 0)}
                                disabled={!formValue || !formValue[`with${m}` as keyof PaymentInfo]}
                            />
                        </View>
                    </View>
                ))}
                <UIVerticalSpacer size="medium" />
                <View>
                    <Button
                        testID="payment-submit-button"
                        title={`Pay Now ($${total.toFixed(2)})`}
                        icon={{
                            name: 'check',
                            type: 'material-community',
                            color: styles.primaryText.color,
                        }}
                        onPress={() => completeOrder(form.getValues())}
                    />
                </View>
            </FormProvider>
        </View>
    );
}

export default CartPayment;
