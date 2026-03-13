import type { CartPayment as ICartPayment } from '@pos/sales/data-access';
import { PaymentType } from '@pos/shared/api';
import {
    UICard,
    UINumericInput,
    UISwitch,
    UIVerticalSpacer,
} from '@pos/shared/ui-native';
import { useSharedStyles } from '@pos/theme/native';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
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

import { View, Text, Alert, StyleSheet } from 'react-native';

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
    const tokens = useDesignTokens();
    const local = useStyles(tokens);
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
    const watchedValues = form.watch();
    const receivedTotal = paymentMethods.reduce(
        (acc, method) => acc + toNumber((watchedValues as Record<string, unknown>)[method]),
        0
    );
    const remainingTotal = Math.max(0, round2Dec(total - receivedTotal));
    const isFullyPaid = round2Dec(receivedTotal) >= round2Dec(total);

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
                <UICard tone="muted" padding="md" radius="lg">
                    <Text style={[styles.secondaryText, local.totalLabel]}>Amount Due</Text>
                    <Text style={[styles.primaryText, styles.textCenter, local.totalAmount]}>
                        $ {total.toFixed(2)}
                    </Text>
                    <View style={local.summaryRow}>
                        <View style={[local.summaryPill, local.summaryPillSpaced]}>
                            <Text style={local.summaryPillLabel}>EBT Eligible</Text>
                            <Text style={local.summaryPillValue}>$ {ebtEligibleTotal.toFixed(2)}</Text>
                        </View>
                        <View style={local.summaryPill}>
                            <Text style={local.summaryPillLabel}>Remaining</Text>
                            <Text style={local.summaryPillValue}>$ {remainingTotal.toFixed(2)}</Text>
                        </View>
                    </View>
                </UICard>
                <UIVerticalSpacer size="small" />
                {paymentMethods.map((m) => (
                    <UICard key={m} tone="default" padding="sm" radius="md" style={local.methodCard}>
                        <View style={local.methodRow}>
                            <UISwitch
                                name={`with${m}`}
                                testID={`payment-switch-${m}`}
                            />
                            <View style={local.methodLabelWrap}>
                            <Text
                                style={[
                                    formValue && formValue[`with${m}` as keyof PaymentInfo]
                                        ? styles.primaryText
                                        : styles.veryLightText,
                                        local.methodLabel,
                                ]}
                            >
                                {PaymentMethod[m].label}
                            </Text>
                            </View>
                            <View style={local.methodInputWrap}>
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
                    </UICard>
                ))}
                <UIVerticalSpacer size="medium" />
                <UICard tone="muted" padding="sm" radius="md" style={local.footerCard}>
                    <View
                        style={[
                            local.summaryFooterRow,
                            isFullyPaid && local.summaryFooterRowComplete,
                        ]}
                    >
                        <Text style={local.summaryFooterLabel}>Received</Text>
                        <Text
                            style={[
                                local.summaryFooterValue,
                                isFullyPaid && local.summaryFooterValueComplete,
                            ]}
                        >
                            $ {round2Dec(receivedTotal).toFixed(2)}
                        </Text>
                    </View>
                    {isFullyPaid && (
                        <Text style={local.completeHint}>Ready to finalize payment</Text>
                    )}
                    {!isFullyPaid && (
                        <Text style={local.pendingHint}>Enter remaining amount to continue</Text>
                    )}
                </UICard>
                <UIVerticalSpacer size="small" />
                <View style={local.ctaWrap}>
                    <Button
                        testID="payment-submit-button"
                        title={`Receive Payment ($${total.toFixed(2)})`}
                        buttonStyle={local.ctaButton}
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

const useStyles = (tokens: ReturnType<typeof useDesignTokens>) =>
    StyleSheet.create({
        totalLabel: {
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            fontSize: 12,
            fontWeight: '700',
        },
        totalAmount: {
            fontSize: 36,
            marginTop: tokens.spacing.xs,
            marginBottom: tokens.spacing.sm,
        },
        summaryRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        summaryPill: {
            flex: 1,
            borderRadius: tokens.radii.md,
            borderWidth: 1,
            borderColor: tokens.colors.border,
            backgroundColor: tokens.colors.surface,
            paddingVertical: tokens.spacing.xs,
            paddingHorizontal: tokens.spacing.sm,
        },
        summaryPillSpaced: {
            marginRight: tokens.spacing.sm,
        },
        summaryPillLabel: {
            color: tokens.colors.textMuted,
            fontSize: 11,
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: 0.4,
        },
        summaryPillValue: {
            color: tokens.colors.textPrimary,
            marginTop: 2,
            fontSize: 16,
            fontWeight: '800',
        },
        methodCard: {
            marginBottom: tokens.spacing.xs,
        },
        methodRow: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        methodLabelWrap: {
            flex: 1.2,
            paddingLeft: tokens.spacing.xs,
        },
        methodLabel: {
            fontWeight: '800',
            fontSize: 18,
        },
        methodInputWrap: {
            flex: 1.8,
        },
        footerCard: {
            marginTop: tokens.spacing.xs,
        },
        summaryFooterRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: tokens.radii.sm,
            borderWidth: 1,
            borderColor: 'transparent',
            paddingHorizontal: tokens.spacing.xs,
            paddingVertical: tokens.spacing.xs,
        },
        summaryFooterRowComplete: {
            backgroundColor: `${tokens.colors.success}1f`,
            borderColor: `${tokens.colors.success}66`,
        },
        summaryFooterLabel: {
            color: tokens.colors.textMuted,
            textTransform: 'uppercase',
            letterSpacing: 0.4,
            fontWeight: '700',
            fontSize: 12,
        },
        summaryFooterValue: {
            color: tokens.colors.textPrimary,
            fontSize: 24,
            fontWeight: '800',
        },
        summaryFooterValueComplete: {
            color: tokens.colors.success,
        },
        completeHint: {
            marginTop: 6,
            color: tokens.colors.success,
            fontSize: 12,
            fontWeight: '700',
            textAlign: 'right',
        },
        pendingHint: {
            marginTop: 6,
            color: tokens.colors.textMuted,
            fontSize: 12,
            textAlign: 'right',
        },
        ctaWrap: {
            marginBottom: tokens.spacing.xs,
        },
        ctaButton: {
            borderRadius: tokens.radii.lg,
        },
    });

export default CartPayment;
