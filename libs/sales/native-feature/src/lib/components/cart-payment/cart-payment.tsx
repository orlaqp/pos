import {
    calculateCreditCardSurcharge,
    enrichCreditCardPaymentsWithSurcharge,
    getPaymentChargedAmount,
    type CartPayment as ICartPayment,
} from '@pos/sales/data-access';
import { PaymentType } from '@pos/shared/api';
import {
    UICard,
    UINumericInput,
    UIVerticalSpacer,
} from '@pos/shared/ui-native';
import { useSharedStyles } from '@pos/theme/native';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import { Button } from '@rneui/themed';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { translateWithFallback } from '@pos/shared/utils';
import {
    calculateSplitPaymentBalance,
    getAutoFillAmount,
    getRestoredValue,
    PaymentKey,
    shouldRestoreValue,
    toNumber,
} from './cart-payment.logic';

import {
    View,
    Text,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
} from 'react-native';

const round2Dec = (value: number) => +value.toFixed(2);
const formatPaymentAmount = (value: number) => `${round2Dec(value)}`;

const PaymentMethodColor: Record<PaymentKey, string> = {
    cc: '#4EA3FF',
    cash: '#4FC37B',
    check: '#F2B84B',
    ebt: '#9B7CFF',
};

const PaymentMethod = {
    cc: {
        labelKey: 'PAYMENT_Method_CreditCard',
        label: 'Card',
        type: PaymentType.CC,
    },
    cash: {
        labelKey: 'PAYMENT_Method_Cash',
        label: 'Cash',
        type: PaymentType.CASH,
    },
    check: {
        labelKey: 'PAYMENT_Method_Check',
        label: 'Check',
        type: PaymentType.CHECK,
    },
    ebt: {
        labelKey: 'PAYMENT_Method_EBT',
        label: 'EBT',
        type: PaymentType.EBT,
    },
} as const;

const PAYMENT_METHOD_ROWS: PaymentKey[][] = [
    ['cc', 'cash'],
    ['check', 'ebt'],
];
const KEYPAD_ROWS = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['00', '0', 'backspace'],
] as const;

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
    creditCardSurchargePercent?: number;
    onPaymentEntered: (payments: ICartPayment[]) => void;
    footerActions?: React.ReactNode;
    disableSubmit?: boolean;
    layout?: 'default' | 'compact';
}

export function CartPayment({
    total,
    ebtEligibleTotal,
    canReceiveChecks,
    creditCardSurchargePercent = 0,
    onPaymentEntered,
    footerActions,
    disableSubmit = false,
    layout = 'default',
}: CartPaymentProps) {
    const styles = useSharedStyles();
    const tokens = useDesignTokens();
    const local = useStyles(tokens);
    const t = translateWithFallback;
    const isCompact = layout === 'compact';
    const previousValues = useRef<Partial<Record<PaymentKey, number>>>({});
    const programmaticUpdates = useRef(new Set<PaymentKey>());
    const cashierEnteredMethod = useRef<PaymentKey | null>(null);
    const calculatedMethod = useRef<PaymentKey | null>(null);
    const cappedMethod = useRef<PaymentKey | null>(null);
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
            (method) =>
                (method !== 'check' || canReceiveChecks) &&
                (method !== 'ebt' || round2Dec(ebtEligibleTotal) > 0),
        );
    }, [canReceiveChecks, ebtEligibleTotal]);
    const paymentMethodRows = useMemo(() => {
        if (isCompact) {
            return PAYMENT_METHOD_ROWS;
        }

        return PAYMENT_METHOD_ROWS.map((row) =>
            row.filter((method) => paymentMethods.includes(method)),
        ).filter((row) => row.length > 0);
    }, [isCompact, paymentMethods]);
    const [selectedPaymentMethod, setSelectedPaymentMethod] =
        useState<PaymentKey>('cc');
    const keypadEntryStarted = useRef(false);
    const watchedValues = form.watch() as PaymentInfo;
    const formValue = watchedValues;
    const receivedTotal = paymentMethods.reduce(
        (acc, method) =>
            acc +
            toNumber(
                (watchedValues as unknown as Record<string, unknown>)[method],
            ),
        0,
    );
    const roundedReceivedTotal = round2Dec(receivedTotal);
    const roundedTotal = round2Dec(total);
    const balanceDelta = round2Dec(roundedTotal - roundedReceivedTotal);
    const remainingTotal = Math.max(0, balanceDelta);
    const isExactPayment = roundedReceivedTotal === roundedTotal;
    const isOverPayment = roundedReceivedTotal > roundedTotal;

    const restoreIfEmpty = (method: PaymentKey) => {
        const currentValue = form.getValues(method);
        if (!shouldRestoreValue(currentValue)) return;
        form.setValue(method, getRestoredValue(previousValues.current[method]));
    };

    const getMethodEnabledKey = useCallback(
        (method: PaymentKey) => `with${method}` as keyof PaymentInfo,
        [],
    );

    const isMethodActive = useCallback(
        (
            method: PaymentKey,
            value: PaymentInfo = form.getValues() as PaymentInfo,
        ) => !!value[getMethodEnabledKey(method)],
        [form, getMethodEnabledKey],
    );

    const activeMethods = paymentMethods.filter((method) =>
        isMethodActive(method, formValue),
    );
    const showSplitBalanceBar = activeMethods.length === 2;
    const activeBalanceMethods = activeMethods.filter(
        (method) => toNumber(watchedValues[method]) > 0,
    );

    const activeCardBaseAmount = toNumber(watchedValues.cc);
    const activeCardSurchargeAmount =
        isMethodActive('cc', watchedValues) &&
        creditCardSurchargePercent > 0
            ? calculateCreditCardSurcharge(
                  activeCardBaseAmount,
                  creditCardSurchargePercent,
              )
            : 0;
    const activeCardChargeAmount = getPaymentChargedAmount({
        type: PaymentType.CC,
        amount: activeCardBaseAmount,
        baseAmount: activeCardBaseAmount,
        surchargeAmount: activeCardSurchargeAmount,
    });
    const customerPaymentTotal = round2Dec(total + activeCardSurchargeAmount);
    const submitButtonLabel =
        activeCardSurchargeAmount > 0
            ? t('PAYMENT_CompletePayment', 'Complete Payment')
            : t('PAYMENT_ReceivePayment', 'Receive Payment');
    const selectedMethod = paymentMethods.includes(selectedPaymentMethod)
        ? selectedPaymentMethod
        : paymentMethods[0];
    const selectedMethodLabel = selectedMethod
        ? t(PaymentMethod[selectedMethod].labelKey, PaymentMethod[selectedMethod].label)
        : '';
    const selectedMethodAmount = selectedMethod
        ? toNumber(watchedValues[selectedMethod])
        : 0;

    useEffect(() => {
        if (!paymentMethods.includes(selectedPaymentMethod) && paymentMethods[0]) {
            setSelectedPaymentMethod(paymentMethods[0]);
        }
    }, [paymentMethods, selectedPaymentMethod]);

    const setMethodActive = useCallback(
        (method: PaymentKey, active: boolean) => {
            const currentValues = form.getValues() as PaymentInfo;
            const enabledKey = getMethodEnabledKey(method);

            form.setValue(enabledKey, active as PaymentInfo[typeof enabledKey], {
                shouldDirty: true,
                shouldTouch: true,
            });

            if (!active) {
                form.setValue(method, 0 as PaymentInfo[typeof method], {
                    shouldDirty: true,
                    shouldTouch: true,
                });
                if (cashierEnteredMethod.current === method) {
                    cashierEnteredMethod.current = null;
                }
                if (calculatedMethod.current === method) {
                    calculatedMethod.current = null;
                }
                if (cappedMethod.current === method) {
                    cappedMethod.current = null;
                }
                return;
            }

            const currentAmount = +(currentValues[method] || 0);
            if (currentAmount > 0) {
                return;
            }

            form.setValue(
                method,
                getAutoFillAmount(
                    method,
                    {
                        ...currentValues,
                        [enabledKey]: true,
                    },
                    paymentMethods,
                    total,
                    ebtEligibleTotal,
                ) as PaymentInfo[typeof method],
                {
                    shouldDirty: true,
                    shouldTouch: true,
                },
            );
        },
        [ebtEligibleTotal, form, getMethodEnabledKey, paymentMethods, total],
    );

    const handleCompactMethodPress = (method: PaymentKey, active: boolean) => {
        if (!paymentMethods.includes(method)) {
            return;
        }
        setSelectedPaymentMethod(method);
        keypadEntryStarted.current = false;
        if (active && selectedMethod === method) {
            setMethodActive(method, false);
            return;
        }
        if (!active) {
            setMethodActive(method, true);
        }
    };

    const getMethodHelperText = (method: PaymentKey) => {
        if (!isMethodActive(method, watchedValues)) return null;
        if (cappedMethod.current === method) {
            return t(
                'PAYMENT_EBTCappedAtEligible',
                'EBT capped at eligible amount',
            );
        }
        if (
            method === 'ebt' &&
            cashierEnteredMethod.current === method &&
            !!calculatedMethod.current &&
            round2Dec(toNumber(watchedValues.ebt)) ===
                round2Dec(ebtEligibleTotal)
        ) {
            return t(
                'PAYMENT_EBTCappedAtEligible',
                'EBT capped at eligible amount',
            );
        }
        if (calculatedMethod.current === method) {
            return t(
                'PAYMENT_AutoCalculatedRemaining',
                'Auto-calculated remaining',
            );
        }
        if (cashierEnteredMethod.current === method && showSplitBalanceBar) {
            return t(
                'PAYMENT_CashierEnteredAmount',
                'Cashier-entered amount',
            );
        }
        return null;
    };

    const getBalanceBarSegmentStyle = (method: PaymentKey) => {
        const amount = toNumber(watchedValues[method]);

        return [
            local.balanceBarSegment,
            {
                backgroundColor: PaymentMethodColor[method],
                flexBasis: 0,
                flexGrow: round2Dec(amount),
            },
        ];
    };

    const rebalancePaymentMethod = useCallback(
        (
            paymentKey: PaymentKey,
            raw: unknown,
            values: PaymentInfo = form.getValues() as PaymentInfo,
        ) => {
            const rawText = `${raw ?? ''}`.trim();
            if (rawText === '') return;

            if (programmaticUpdates.current.has(paymentKey)) {
                programmaticUpdates.current.delete(paymentKey);
                return;
            }

            previousValues.current[paymentKey] = toNumber(raw);

            const currentlyActiveMethods = paymentMethods.filter((method) =>
                isMethodActive(method, values),
            );

            if (!currentlyActiveMethods.includes(paymentKey)) return;

            const balance = calculateSplitPaymentBalance({
                changedMethod: paymentKey,
                activeMethods: currentlyActiveMethods,
                values: {
                    ...values,
                    [paymentKey]: raw,
                },
                total,
                ebtEligibleTotal,
            });

            cashierEnteredMethod.current = paymentKey;
            calculatedMethod.current = balance.calculatedMethod ?? null;
            cappedMethod.current = balance.cappedMethod ?? null;

            (Object.keys(balance.values) as PaymentKey[]).forEach((method) => {
                const nextValue = balance.values[method];
                if (nextValue === undefined) return;
                if (
                    round2Dec(toNumber(values[method])) === round2Dec(nextValue)
                ) {
                    return;
                }

                programmaticUpdates.current.add(method);
                form.setValue(
                    method,
                    formatPaymentAmount(nextValue) as PaymentInfo[typeof method],
                    {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                    },
                );
            });
        },
        [ebtEligibleTotal, form, isMethodActive, paymentMethods, total],
    );

    const applyPaymentAmount = useCallback(
        (method: PaymentKey, amount: number) => {
            const nextValue = formatPaymentAmount(amount);
            previousValues.current[method] = amount;
            form.setValue(method, nextValue as PaymentInfo[typeof method], {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
            });
            rebalancePaymentMethod(method, nextValue, {
                ...(form.getValues() as PaymentInfo),
                [method]: nextValue,
            });
        },
        [form, rebalancePaymentMethod],
    );

    const applySelectedPaymentAmount = useCallback(
        (amount: number) => {
            if (!selectedMethod) return;
            if (!isMethodActive(selectedMethod)) {
                setMethodActive(selectedMethod, true);
            }
            applyPaymentAmount(selectedMethod, Math.max(0, round2Dec(amount)));
        },
        [applyPaymentAmount, isMethodActive, selectedMethod, setMethodActive],
    );

    const handleKeypadDigit = (digit: string) => {
        if (!selectedMethod) return;

        const currentCents = keypadEntryStarted.current
            ? `${Math.round(selectedMethodAmount * 100)}`
            : '';
        const nextCentsText = `${currentCents}${digit}`
            .replace(/^0+(?=\d)/, '')
            .slice(0, 8);
        const nextCents = Number.parseInt(nextCentsText || '0', 10);

        keypadEntryStarted.current = true;
        applySelectedPaymentAmount(nextCents / 100);
    };

    const handleKeypadBackspace = () => {
        if (!selectedMethod) return;

        const currentCents = `${Math.round(selectedMethodAmount * 100)}`;
        const nextCents = Number.parseInt(currentCents.slice(0, -1) || '0', 10);

        keypadEntryStarted.current = true;
        applySelectedPaymentAmount(nextCents / 100);
    };

    const handleKeypadClear = () => {
        if (!selectedMethod) return;

        keypadEntryStarted.current = false;
        setMethodActive(selectedMethod, false);
    };

    const handleKeypadExact = () => {
        if (!selectedMethod) return;

        keypadEntryStarted.current = false;
        applySelectedPaymentAmount(
            getAutoFillAmount(
                selectedMethod,
                form.getValues() as PaymentInfo,
                paymentMethods,
                total,
                ebtEligibleTotal,
            ),
        );
    };

    const handleKeypadQuickAmount = (amount: number) => {
        keypadEntryStarted.current = false;
        applySelectedPaymentAmount(amount);
    };


    const renderPaymentAmountInput = (
        method: PaymentKey,
        compact: boolean,
        active: boolean,
    ) => (
        <View
            testID={`payment-input-wrap-${method}`}
            style={[
                local.methodInputWrap,
                compact && local.methodInputWrapCompact,
            ]}
        >
            <UINumericInput
                testID={`payment-input-${method}`}
                keyboardType="decimal-pad"
                name={method}
                allowDecimals={true}
                textAlign="right"
                lIcon="currency-usd"
                clearTextOnFocus={false}
                selectTextOnFocus={true}
                onFocus={() => {
                    const wasActive = isMethodActive(method);
                    if (!wasActive) {
                        setMethodActive(method, true);
                        return;
                    }

                    previousValues.current[method] = toNumber(
                        form.getValues(method),
                    );
                    form.setValue(method, '' as PaymentInfo[typeof method]);
                }}
                onBlur={() =>
                    setTimeout(() => restoreIfEmpty(method), 0)
                }
                onEndEditing={() =>
                    setTimeout(() => restoreIfEmpty(method), 0)
                }
                onChangeText={(text) => {
                    rebalancePaymentMethod(method, text);
                }}
                containerStyle={
                    compact
                        ? local.methodInputContainerCompact
                        : local.methodInputContainer
                }
                inputContainerStyle={
                    compact ? local.methodInputInnerCompact : local.methodInputInner
                }
                inputStyle={[
                    styles.inputStyle,
                    local.methodInputText,
                    compact && local.methodInputTextCompact,
                    !active && local.methodInputTextInactive,
                ]}
            />
        </View>
    );

    const renderPaymentMethodGrid = () => (
        <View
            testID="payment-methods-grid"
            style={[local.methodsGrid, isCompact && local.methodsGridCompact]}
        >
            {paymentMethodRows.map((row, rowIndex) => (
                <View key={`payment-row-${rowIndex}`} style={local.methodGridRow}>
                    {row.map((m) => {
                        const isSingleCard = row.length === 1;
                        const isAvailable = paymentMethods.includes(m);
                        const isActive = isMethodActive(m, formValue);

                        return (
                            <Pressable
                                key={m}
                                testID={`payment-card-${m}`}
                                disabled={!isAvailable}
                                accessibilityState={{ disabled: !isAvailable }}
                                onPress={() =>
                                    isCompact
                                        ? handleCompactMethodPress(m, isActive)
                                        : setMethodActive(m, !isActive)
                                }
                                style={[
                                    isSingleCard
                                        ? local.methodCardSingle
                                        : local.methodCardHalf,
                                    isCompact && local.methodCardPressableCompact,
                                    !isAvailable && local.methodCardPressableDisabled,
                                ]}
                            >
                                {isActive && isAvailable ? (
                                    <View style={local.methodCardActiveAccent} />
                                ) : null}
                                <UICard
                                    tone="default"
                                    padding={isCompact ? 'xs' : 'sm'}
                                    radius="md"
                                    style={[
                                        local.methodCard,
                                        isCompact && local.methodCardCompact,
                                        isActive
                                            ? local.methodCardActive
                                            : local.methodCardInactive,
                                        !isAvailable && local.methodCardDisabled,
                                    ]}
                                >
                                    <View
                                        style={[
                                            local.methodBody,
                                            isCompact && local.methodBodyCompact,
                                        ]}
                                    >
                                        <View
                                            testID={
                                                isCompact && isActive
                                                    ? `payment-method-active-row-${m}`
                                                    : undefined
                                            }
                                            style={[
                                                local.methodPreviewRow,
                                                isCompact &&
                                                    isActive &&
                                                    local.methodActiveCompactRow,
                                            ]}
                                        >
                                            <Text
                                                testID={`payment-method-label-${m}`}
                                                style={[
                                                    local.methodCaption,
                                                    isCompact &&
                                                        local.methodCaptionCompact,
                                                    isActive
                                                        ? local.methodCaptionActive
                                                        : local.methodCaptionInactive,
                                                    !isAvailable &&
                                                        local.methodCaptionDisabled,
                                                ]}
                                            >
                                                {t(
                                                    PaymentMethod[m].labelKey,
                                                    PaymentMethod[m].label,
                                                )}
                                            </Text>
                                            {isCompact && !isActive ? (
                                                <Text
                                                    testID={`payment-amount-preview-${m}`}
                                                    style={[
                                                        local.methodAmountPreview,
                                                        !isAvailable &&
                                                            local.methodAmountPreviewDisabled,
                                                    ]}
                                                >
                                                    $
                                                    {toNumber(
                                                        watchedValues[m],
                                                    ).toFixed(2)}
                                                </Text>
                                            ) : null}
                                            {isCompact && isActive ? (
                                                <Text
                                                    testID={`payment-amount-preview-${m}`}
                                                    style={[
                                                        local.methodAmountPreview,
                                                        local.methodAmountPreviewActive,
                                                        !isAvailable &&
                                                            local.methodAmountPreviewDisabled,
                                                    ]}
                                                >
                                                    $
                                                    {toNumber(
                                                        watchedValues[m],
                                                    ).toFixed(2)}
                                                </Text>
                                            ) : null}
                                        </View>
                                        {!isCompact
                                            ? renderPaymentAmountInput(
                                                  m,
                                                  false,
                                                  isActive,
                                              )
                                            : null}
                                        {!isCompact && getMethodHelperText(m) ? (
                                            <Text
                                                style={[
                                                    local.methodHelperText,
                                                    cappedMethod.current === m &&
                                                        local.methodHelperTextWarning,
                                                ]}
                                            >
                                                {getMethodHelperText(m)}
                                            </Text>
                                        ) : null}
                                    </View>
                                </UICard>
                            </Pressable>
                        );
                    })}
                </View>
            ))}
        </View>
    );

    const renderKeypadButton = (
        label: string,
        testID: string,
        onPress: () => void,
        emphasized = false,
    ) => (
        <Pressable
            key={testID}
            testID={testID}
            accessibilityRole="button"
            onPress={onPress}
            style={[
                local.keypadButton,
                emphasized && local.keypadButtonEmphasized,
            ]}
        >
            <Text
                style={[
                    local.keypadButtonText,
                    emphasized && local.keypadButtonTextEmphasized,
                ]}
            >
                {label}
            </Text>
        </Pressable>
    );

    const renderCompactKeypadPanel = () => {
        if (!selectedMethod) return null;

        return (
            <View testID="payment-keypad-panel" style={local.keypadPanel}>
                <View style={local.keypadEditorCard}>
                    <View style={local.keypadEditorHeader}>
                        <Text style={local.keypadEditorLabel}>
                            {selectedMethodLabel}{' '}
                            {t('PAYMENT_Amount', 'Amount')}
                        </Text>
                        <Pressable
                            testID="payment-keypad-clear"
                            accessibilityRole="button"
                            onPress={handleKeypadClear}
                            style={local.keypadClearButton}
                        >
                            <Text style={local.keypadClearText}>
                                {t('PAYMENT_Clear', 'Clear')}
                            </Text>
                        </Pressable>
                    </View>
                    <Text
                        testID="payment-keypad-display"
                        style={local.keypadDisplay}
                    >
                        ${selectedMethodAmount.toFixed(2)}
                    </Text>
                </View>
                <View style={local.quickAmountRow}>
                    {renderKeypadButton(
                        t('PAYMENT_Exact', 'Exact'),
                        'payment-keypad-exact',
                        handleKeypadExact,
                        true,
                    )}
                    {[20, 50, 100].map((amount) =>
                        renderKeypadButton(
                            `$${amount}`,
                            `payment-keypad-${amount}`,
                            () => handleKeypadQuickAmount(amount),
                        ),
                    )}
                </View>
                <View style={local.keypadGrid}>
                    {KEYPAD_ROWS.map((row, rowIndex) => (
                        <View
                            key={`payment-keypad-row-${rowIndex}`}
                            style={local.keypadRow}
                        >
                            {row.map((key) =>
                                renderKeypadButton(
                                    key === 'backspace' ? 'Del' : key,
                                    `payment-keypad-${key}`,
                                    key === 'backspace'
                                        ? handleKeypadBackspace
                                        : () => handleKeypadDigit(key),
                                ),
                            )}
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    const renderCompactTenderApplied = () => (
        <UICard
            tone="muted"
            padding="sm"
            radius="md"
            style={local.tenderAppliedCard}
        >
            <View style={local.tenderAppliedHeader}>
                <Text style={local.summaryFooterLabel}>
                    {t('PAYMENT_TenderApplied', 'Tender Applied')}
                </Text>
                <Text style={local.tenderAppliedCount}>
                    {activeMethods.length}{' '}
                    {activeMethods.length === 1
                        ? t('PAYMENT_MethodCountSingular', 'method')
                        : t('PAYMENT_MethodCountPlural', 'methods')}
                </Text>
            </View>
            {activeMethods.length > 0 ? (
                activeMethods.map((method) => (
                    <View key={`payment-tender-${method}`} style={local.tenderRow}>
                        <View style={local.tenderTextBlock}>
                            <Text style={local.tenderLabel}>
                                {t(
                                    PaymentMethod[method].labelKey,
                                    PaymentMethod[method].label,
                                )}
                            </Text>
                            {method === 'cc' && activeCardSurchargeAmount > 0 ? (
                                <Text style={local.tenderMeta}>
                                    + ${activeCardSurchargeAmount.toFixed(2)}{' '}
                                    {t(
                                        'PAYMENT_SurchargeTenderMeta',
                                        'surcharge',
                                    )}{' '}
                                    - {t('PAYMENT_ChargesTenderMeta', 'charges')}{' '}
                                    ${activeCardChargeAmount.toFixed(2)}
                                </Text>
                            ) : null}
                        </View>
                        <Text style={local.tenderAmount}>
                            ${toNumber(watchedValues[method]).toFixed(2)}
                        </Text>
                        <Pressable
                            testID={`payment-tender-remove-${method}`}
                            accessibilityRole="button"
                            accessibilityLabel={t(
                                'PAYMENT_RemoveTender',
                                `Remove ${PaymentMethod[method].label}`,
                            )}
                            onPress={() => setMethodActive(method, false)}
                            style={local.tenderRemoveButton}
                        >
                            <Text style={local.tenderRemoveText}>×</Text>
                        </Pressable>
                    </View>
                ))
            ) : (
                <Text style={local.tenderEmptyText}>
                    {t(
                        'PAYMENT_SelectTenderMethod',
                        'Select a payment method to start.',
                    )}
                </Text>
            )}
        </UICard>
    );

    const renderCompactMetric = (
        label: string,
        value: string,
        status?: 'success' | 'warning',
    ) => (
        <View
            key={label}
            style={[
                local.footerMetricCard,
                status === 'success' && local.footerMetricCardSuccess,
            ]}
        >
            <Text style={local.footerMetricLabel}>{label}</Text>
            <Text
                style={[
                    local.footerMetricValue,
                    status === 'success' && local.footerMetricValueSuccess,
                    status === 'warning' && local.footerMetricValueWarning,
                ]}
            >
                {value}
            </Text>
        </View>
    );

    const renderCompactFooterMetrics = () => (
        <View testID="payment-footer-metrics" style={local.footerMetricsRow}>
            {renderCompactMetric(
                t('PAYMENT_OrderTotal', 'Order Total'),
                `$${roundedTotal.toFixed(2)}`,
            )}
            {renderCompactMetric(
                t('PAYMENT_CardFee', 'Card Fee'),
                `$${activeCardSurchargeAmount.toFixed(2)}`,
            )}
            {renderCompactMetric(
                t('PAYMENT_AmountPaid', 'Amount Paid'),
                `$${round2Dec(roundedReceivedTotal + activeCardSurchargeAmount).toFixed(2)}`,
                isExactPayment ? 'success' : undefined,
            )}
            {renderCompactMetric(
                t('PAYMENT_Remaining', 'Remaining'),
                `$${remainingTotal.toFixed(2)}`,
                remainingTotal > 0 ? 'warning' : undefined,
            )}
        </View>
    );

    const renderSubmitButton = () => (
        <Button
            testID="payment-submit-button"
            title={`${submitButtonLabel} ($${customerPaymentTotal.toFixed(2)})`}
            buttonStyle={[local.ctaButton, isCompact && local.ctaButtonCompact]}
            disabled={!isExactPayment || disableSubmit}
            icon={{
                name: 'check',
                type: 'material-community',
                color: styles.primaryText.color,
            }}
            onPress={() => completeOrder(form.getValues())}
        />
    );

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

        if (round2Dec(received) !== round2Dec(total)) {
            Alert.alert(
                t(
                    'PAYMENT_ReceivedMustMatchTotal',
                    'Received payment must match the total exactly',
                ),
            );
            return;
        }

        if (round2Dec(ebtReceived) > round2Dec(ebtEligibleTotal)) {
            Alert.alert(
                t('PAYMENT_EBTValidationTitle', 'EBT validation failed'),
                `${t(
                    'PAYMENT_EBTValidationMessage',
                    'EBT amount cannot exceed EBT-eligible amount.',
                )}\n$${ebtReceived.toFixed(2)} > $${ebtEligibleTotal.toFixed(2)}`,
            );
            return;
        }

        onPaymentEntered(
            enrichCreditCardPaymentsWithSurcharge(
                result,
                creditCardSurchargePercent,
            ),
        );
    };

    useEffect(() => {
        const subscription = form.watch((value, { name }) => {
            if (!name) return;

            const paymentKey = name as PaymentKey;
            if (!paymentMethods.includes(paymentKey)) return;

            const raw = value[paymentKey];
            rebalancePaymentMethod(paymentKey, raw, value as PaymentInfo);
        });

        return () => subscription.unsubscribe();
    }, [form, paymentMethods, rebalancePaymentMethod]);

    return (
        <View style={local.shell}>
            <FormProvider {...form}>
                <View style={local.formLayout}>
                    <View
                        testID="payment-content-region"
                        style={[
                            local.paymentContentRegion,
                            isCompact && local.paymentContentRegionCompact,
                        ]}
                    >
                        <UICard
                            tone="muted"
                            padding={isCompact ? 'sm' : 'md'}
                            radius="lg"
                            style={[
                                local.summaryCard,
                                isCompact && local.summaryCardCompact,
                            ]}
                        >
                            {!isCompact ? (
                                <Text style={local.summaryEyebrow}>
                                    {t('PAYMENT_CheckoutEyebrow', 'Checkout')}
                                </Text>
                            ) : null}
                            <Text
                                style={[
                                    styles.secondaryText,
                                    local.totalLabel,
                                    isCompact && local.totalLabelCompact,
                                ]}
                            >
                                {t('PAYMENT_AmountDue', 'Amount Due')}
                            </Text>
                            <Text
                                style={[
                                    styles.primaryText,
                                    styles.textCenter,
                                    local.totalAmount,
                                    isCompact && local.totalAmountCompact,
                                ]}
                            >
                                $ {total.toFixed(2)}
                            </Text>
                            {!isCompact ? (
                                <Text style={local.summaryHint}>
                                    {t(
                                        'PAYMENT_CheckoutHint',
                                        'Activate the methods you need below and keep the received amount matched exactly.',
                                    )}
                                </Text>
                            ) : null}
                            <View
                                style={[
                                    local.summaryRow,
                                    isCompact && local.summaryRowCompact,
                                ]}
                            >
                                <View
                                    style={[
                                        local.summaryPill,
                                        local.summaryPillSpaced,
                                        isCompact && local.summaryPillCompact,
                                    ]}
                                >
                                    <Text style={local.summaryPillLabel}>
                                        {t('PAYMENT_EBTEligible', 'EBT Eligible')}
                                    </Text>
                                    <Text
                                        style={[
                                            local.summaryPillValue,
                                            isCompact && local.summaryPillValueCompact,
                                        ]}
                                    >
                                        $ {ebtEligibleTotal.toFixed(2)}
                                    </Text>
                                </View>
                                <View
                                    style={[
                                        local.summaryPill,
                                        isCompact && local.summaryPillCompact,
                                    ]}
                                >
                                    <Text style={local.summaryPillLabel}>
                                        {t('PAYMENT_Remaining', 'Remaining')}
                                    </Text>
                                    <Text
                                        style={[
                                            local.summaryPillValue,
                                            isCompact && local.summaryPillValueCompact,
                                        ]}
                                    >
                                        $ {remainingTotal.toFixed(2)}
                                    </Text>
                                </View>
                            </View>
                        </UICard>
                        {!isCompact ? (
                            <View style={local.zoneSpacer}>
                                <UIVerticalSpacer size="small" />
                            </View>
                        ) : null}
                        {isCompact ? (
                            <View
                                testID="payment-compact-workspace"
                                style={local.compactWorkspace}
                            >
                                <View style={local.compactMethodsPane}>
                                    {renderPaymentMethodGrid()}
                                    {renderCompactTenderApplied()}
                                </View>
                                {renderCompactKeypadPanel()}
                            </View>
                        ) : (
                            <ScrollView
                                testID="payment-methods-scroll"
                                style={local.methodsScroll}
                                contentContainerStyle={local.methodsScrollContent}
                                showsVerticalScrollIndicator={false}
                            >
                                {renderPaymentMethodGrid()}
                            </ScrollView>
                        )}
                        {showSplitBalanceBar && !isCompact ? (
                            <UICard
                                tone="muted"
                                padding={isCompact ? 'xs' : 'sm'}
                                radius="md"
                                style={local.balanceCard}
                            >
                                <View
                                    testID="payment-split-balance-bar"
                                    style={local.balanceBarTrack}
                                >
                                    {activeBalanceMethods.map((method) => (
                                        <View
                                            key={`payment-balance-${method}`}
                                            testID={`payment-balance-segment-${method}`}
                                            style={getBalanceBarSegmentStyle(method)}
                                        />
                                    ))}
                                </View>
                                <View style={local.balanceLegend}>
                                    {activeMethods.map((method) => (
                                        <View
                                            key={`payment-balance-legend-${method}`}
                                            style={local.balanceLegendItem}
                                        >
                                            <View
                                                testID={`payment-balance-dot-${method}`}
                                                style={[
                                                    local.balanceLegendDot,
                                                    {
                                                        backgroundColor:
                                                            PaymentMethodColor[method],
                                                    },
                                                ]}
                                            />
                                            <Text style={local.balanceLegendText}>
                                                {t(
                                                    PaymentMethod[method].labelKey,
                                                    PaymentMethod[method].label,
                                                )}{' '}
                                                $
                                                {toNumber(watchedValues[method]).toFixed(2)}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </UICard>
                        ) : null}
                    </View>
                    <View
                        testID="payment-received-rail"
                        style={[
                            local.footerRail,
                            isCompact && local.footerRailCompact,
                        ]}
                    >
                        {isCompact ? (
                            renderCompactFooterMetrics()
                        ) : (
                            <UICard
                                tone="muted"
                                padding="sm"
                                radius="md"
                                style={[
                                    local.footerCard,
                                    isCompact && local.footerCardCompact,
                                ]}
                            >
                                <View
                                    style={[
                                        local.summaryFooterRow,
                                        isExactPayment &&
                                            local.summaryFooterRowComplete,
                                    ]}
                                >
                                    <Text style={local.summaryFooterLabel}>
                                        {t('PAYMENT_Received', 'Received')}
                                    </Text>
                                    <Text
                                        style={[
                                            local.summaryFooterValue,
                                            isExactPayment &&
                                                local.summaryFooterValueComplete,
                                        ]}
                                    >
                                        $ {roundedReceivedTotal.toFixed(2)}
                                    </Text>
                                </View>
                                {activeCardSurchargeAmount > 0 ? (
                                    <>
                                        <View style={local.summaryMetaRow}>
                                            <Text style={local.summaryMetaLabel}>
                                                {t(
                                                    'PAYMENT_CreditCardSurcharge',
                                                    'Credit Card Surcharge',
                                                )}
                                            </Text>
                                            <Text style={local.summaryMetaValue}>
                                                ${' '}
                                                {activeCardSurchargeAmount.toFixed(2)}
                                            </Text>
                                        </View>
                                        <View style={local.summaryMetaRow}>
                                            <Text style={local.summaryMetaLabel}>
                                                {t(
                                                    'PAYMENT_ChargeToCard',
                                                    'Charge to card',
                                                )}
                                            </Text>
                                            <Text style={local.summaryMetaValue}>
                                                $ {activeCardChargeAmount.toFixed(2)}
                                            </Text>
                                        </View>
                                    </>
                                ) : null}
                                {isExactPayment && (
                                    <Text style={local.completeHint}>
                                        {t(
                                            'PAYMENT_ReadyToFinalize',
                                            'Ready to finalize payment',
                                        )}
                                    </Text>
                                )}
                                {!isExactPayment && !isOverPayment && (
                                    <Text style={local.pendingHint}>
                                        {t(
                                            'PAYMENT_EnterRemaining',
                                            'Enter remaining amount to continue',
                                        )}
                                    </Text>
                                )}
                                {isOverPayment && (
                                    <Text style={local.pendingHint}>
                                        {t(
                                            'PAYMENT_AdjustToMatchTotal',
                                            'Adjust payments to match the amount due',
                                        )}
                                    </Text>
                                )}
                            </UICard>
                        )}
                        <View
                            style={[
                                local.footerSectionSpacer,
                                isCompact && local.footerSectionSpacerCompact,
                            ]}
                        >
                            <UIVerticalSpacer size="small" />
                        </View>
                        <View
                            style={[
                                local.ctaWrap,
                                isCompact && local.ctaWrapCompact,
                            ]}
                        >
                            {renderSubmitButton()}
                        </View>
                        {footerActions ? (
                            <>
                                <View
                                    style={[
                                        local.footerSectionSpacer,
                                        isCompact &&
                                            local.footerSectionSpacerCompact,
                                    ]}
                                >
                                    <UIVerticalSpacer size="small" />
                                </View>
                                <View style={local.footerActionsWrap}>
                                    {footerActions}
                                </View>
                            </>
                        ) : null}
                    </View>
                </View>
            </FormProvider>
        </View>
    );
}

const useStyles = (tokens: ReturnType<typeof useDesignTokens>) =>
    StyleSheet.create({
        shell: {
            flex: 1,
            minHeight: 0,
        },
        formLayout: {
            flex: 1,
            minHeight: 0,
        },
        paymentContentRegion: {
            flex: 1,
            minHeight: 0,
        },
        paymentContentRegionCompact: {
            flexGrow: 1,
            flexShrink: 1,
            flexBasis: 0,
            gap: tokens.spacing.md,
        },
        summaryCard: {
            borderWidth: 1,
            borderColor: `${tokens.colors.border}AA`,
            backgroundColor: '#0D1118',
        },
        summaryCardCompact: {
            paddingTop: 10,
            paddingBottom: 10,
        },
        totalLabelCompact: {
            fontSize: 11,
        },
        summaryEyebrow: {
            textAlign: 'center',
            color: tokens.colors.accent,
            textTransform: 'uppercase',
            letterSpacing: 1.4,
            fontSize: 11,
            fontWeight: '800',
            marginBottom: tokens.spacing.xs,
        },
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
            marginBottom: tokens.spacing.xs,
        },
        totalAmountCompact: {
            fontSize: 34,
            marginTop: 2,
            marginBottom: 6,
        },
        summaryHint: {
            color: tokens.colors.textSecondary,
            fontSize: 13,
            lineHeight: 18,
            textAlign: 'center',
            marginBottom: tokens.spacing.sm,
        },
        summaryRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        summaryRowCompact: {
            marginTop: 0,
        },
        zoneSpacer: {
            marginBottom: 0,
        },
        zoneSpacerCompact: {
            height: 4,
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
        summaryPillCompact: {
            paddingVertical: 6,
            paddingHorizontal: 10,
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
        summaryPillValueCompact: {
            fontSize: 14,
            marginTop: 0,
        },
        methodsScroll: {
            flex: 1,
            minHeight: 0,
        },
        methodsScrollContent: {
            paddingBottom: tokens.spacing.sm,
        },
        methodsGrid: {
            gap: tokens.spacing.sm,
        },
        methodsGridCompact: {
            flexShrink: 0,
            gap: tokens.spacing.sm,
        },
        compactWorkspace: {
            flexDirection: 'row',
            gap: tokens.spacing.md,
            flex: 1,
            minHeight: 0,
        },
        compactMethodsPane: {
            flex: 1.7,
            minWidth: 0,
            gap: tokens.spacing.md,
        },
        methodGridRow: {
            flexDirection: 'row',
            gap: tokens.spacing.sm,
        },
        methodCardActiveAccent: {
            position: 'absolute',
            left: 0,
            top: 10,
            bottom: 10,
            width: 4,
            borderRadius: 999,
            backgroundColor: tokens.colors.accent,
            zIndex: 2,
        },
        methodCard: {
            minHeight: 126,
            overflow: 'hidden',
        },
        methodCardCompact: {
            minHeight: 98,
        },
        methodCardHalf: {
            flex: 1,
        },
        methodCardPressableCompact: {
            minHeight: 98,
        },
        methodCardPressableDisabled: {
            opacity: 0.62,
        },
        methodCardSingle: {
            width: '100%',
        },
        methodCardActive: {
            borderColor: '#4EA3FF',
            backgroundColor: '#152537',
            shadowColor: '#4EA3FF',
            shadowOpacity: 0.18,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
        },
        methodCardInactive: {
            borderColor: '#2A3442',
            backgroundColor: '#121922',
        },
        methodCardDisabled: {
            borderColor: '#202837',
            backgroundColor: '#0D131B',
        },
        methodBody: {
            flex: 1,
            justifyContent: 'space-between',
        },
        methodBodyCompact: {
            gap: tokens.spacing.xs,
            justifyContent: 'center',
        },
        methodPreviewRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: tokens.spacing.sm,
        },
        methodActiveCompactRow: {
            width: '100%',
            minHeight: 54,
            alignItems: 'center',
        },
        methodCaption: {
            textTransform: 'uppercase',
            letterSpacing: 0.9,
            fontWeight: '800',
            fontSize: 10,
            marginBottom: tokens.spacing.sm,
        },
        methodCaptionCompact: {
            fontSize: 11,
            marginBottom: 0,
            paddingLeft: 14,
        },
        methodCaptionActive: {
            color: '#B6D4FF',
        },
        methodCaptionInactive: {
            color: '#8A98AA',
        },
        methodCaptionDisabled: {
            color: '#5F6B7A',
        },
        methodAmountPreview: {
            color: tokens.colors.textMuted,
            fontSize: 20,
            fontWeight: '800',
        },
        methodAmountPreviewDisabled: {
            color: '#647184',
        },
        methodAmountPreviewActive: {
            color: tokens.colors.textPrimary,
            fontSize: 26,
        },
        methodInputWrap: {
            width: '100%',
            justifyContent: 'center',
            paddingHorizontal: tokens.spacing.xs,
        },
        methodInputWrapCompact: {
            alignSelf: 'center',
            width: '50%',
        },
        methodInputContainer: {
            paddingHorizontal: 0,
            marginTop: 0,
            marginBottom: 0,
        },
        methodInputContainerCompact: {
            paddingHorizontal: 0,
            marginTop: 0,
            marginBottom: 0,
            height: 46,
        },
        methodInputInner: {
            marginTop: 0,
            minHeight: 52,
            borderRadius: 16,
            paddingLeft: 12,
            paddingRight: 12,
        },
        methodInputInnerCompact: {
            marginTop: 0,
            minHeight: 42,
            height: 42,
            borderRadius: 10,
            paddingLeft: 8,
            paddingRight: 8,
        },
        methodInputTextCompact: {
            fontSize: 13,
        },
        methodInputText: {
            width: '100%',
            fontSize: 18,
            fontWeight: '700',
        },
        methodInputTextInactive: {
            color: tokens.colors.textMuted,
        },
        methodHelperText: {
            color: '#9DCCFF',
            fontSize: 11,
            fontWeight: '700',
            marginTop: 4,
            textAlign: 'right',
        },
        methodHelperTextCompact: {
            fontSize: 10,
            marginTop: 0,
        },
        methodHelperTextWarning: {
            color: tokens.colors.warning,
        },
        balanceCard: {
            borderWidth: 1,
            borderColor: '#26303D',
            backgroundColor: '#0D141F',
            marginTop: tokens.spacing.sm,
            marginBottom: tokens.spacing.sm,
        },
        balanceBarTrack: {
            height: 12,
            borderRadius: 999,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: '#2A3442',
            backgroundColor: '#111922',
            flexDirection: 'row',
            gap: 3,
            padding: 2,
        },
        balanceBarSegment: {
            height: '100%',
            borderRadius: 999,
            minWidth: 2,
        },
        balanceLegend: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            gap: tokens.spacing.xs,
            marginTop: 8,
        },
        balanceLegendItem: {
            flexDirection: 'row',
            alignItems: 'center',
            minWidth: 0,
        },
        balanceLegendDot: {
            width: 8,
            height: 8,
            borderRadius: 999,
            marginRight: 6,
        },
        balanceLegendText: {
            color: tokens.colors.textMuted,
            fontSize: 11,
            fontWeight: '700',
        },
        keypadPanel: {
            flex: 1,
            maxWidth: 360,
            minWidth: 300,
            flexShrink: 0,
            gap: 8,
        },
        keypadEditorCard: {
            borderWidth: 1,
            borderColor: '#243145',
            backgroundColor: '#0B1119',
            borderRadius: 16,
            padding: 12,
        },
        keypadEditorHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: tokens.spacing.sm,
        },
        keypadEditorLabel: {
            flex: 1,
            minWidth: 0,
            color: tokens.colors.accent,
            fontSize: 11,
            fontWeight: '800',
            letterSpacing: 0.8,
            textTransform: 'uppercase',
        },
        keypadClearButton: {
            borderWidth: 1,
            borderColor: '#26364B',
            borderRadius: 12,
            paddingHorizontal: tokens.spacing.md,
            paddingVertical: tokens.spacing.sm,
        },
        keypadClearText: {
            color: tokens.colors.textMuted,
            fontSize: 12,
            fontWeight: '800',
        },
        keypadDisplay: {
            marginTop: 2,
            color: tokens.colors.textPrimary,
            fontSize: 30,
            fontWeight: '800',
        },
        quickAmountRow: {
            flexDirection: 'row',
            gap: 8,
        },
        keypadGrid: {
            gap: 8,
        },
        keypadRow: {
            flexDirection: 'row',
            gap: 8,
        },
        keypadButton: {
            flex: 1,
            minHeight: 58,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#253143',
            backgroundColor: '#121A25',
            alignItems: 'center',
            justifyContent: 'center',
        },
        keypadButtonEmphasized: {
            borderColor: tokens.colors.accent,
            backgroundColor: '#14243A',
        },
        keypadButtonText: {
            color: tokens.colors.textPrimary,
            fontSize: 18,
            fontWeight: '800',
        },
        keypadButtonTextEmphasized: {
            color: '#B6D4FF',
            fontSize: 14,
        },
        tenderAppliedCard: {
            flex: 1,
            minHeight: 180,
            borderWidth: 1,
            borderColor: '#243145',
            backgroundColor: '#0B1119',
        },
        tenderAppliedHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: tokens.spacing.sm,
        },
        tenderAppliedCount: {
            color: tokens.colors.textMuted,
            fontSize: 11,
            fontWeight: '800',
            backgroundColor: '#141D29',
            borderRadius: 999,
            paddingHorizontal: tokens.spacing.sm,
            paddingVertical: 4,
        },
        tenderRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: tokens.spacing.sm,
            borderTopWidth: 1,
            borderTopColor: '#1D2632',
            paddingTop: tokens.spacing.sm,
            paddingBottom: tokens.spacing.xs,
        },
        tenderTextBlock: {
            flex: 1,
            minWidth: 0,
        },
        tenderLabel: {
            color: tokens.colors.textPrimary,
            fontSize: 14,
            fontWeight: '800',
        },
        tenderMeta: {
            color: tokens.colors.textMuted,
            fontSize: 11,
            marginTop: 2,
        },
        tenderAmount: {
            color: tokens.colors.textPrimary,
            fontSize: 16,
            fontWeight: '800',
            flexShrink: 0,
        },
        tenderRemoveButton: {
            width: 32,
            height: 32,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: '#334257',
            backgroundColor: '#111A25',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
        },
        tenderRemoveText: {
            color: tokens.colors.textMuted,
            fontSize: 20,
            lineHeight: 22,
            fontWeight: '800',
        },
        tenderEmptyText: {
            color: tokens.colors.textMuted,
            fontSize: 12,
            lineHeight: 18,
        },
        footerRail: {
            flexShrink: 0,
            borderTopWidth: 1,
            borderTopColor: `${tokens.colors.border}88`,
            paddingTop: tokens.spacing.sm,
            backgroundColor: '#05080C',
        },
        footerRailCompact: {
            marginTop: tokens.spacing.md,
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            paddingTop: 0,
        },
        footerMetricsRow: {
            flexDirection: 'row',
            gap: tokens.spacing.sm,
        },
        footerMetricCard: {
            flex: 1,
            minHeight: 64,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#26303D',
            backgroundColor: '#0F151D',
            paddingHorizontal: tokens.spacing.sm,
            paddingVertical: 8,
            justifyContent: 'center',
        },
        footerMetricCardSuccess: {
            borderColor: '#1B7A43',
            backgroundColor: '#061B14',
        },
        footerMetricLabel: {
            color: tokens.colors.textMuted,
            fontSize: 10,
            fontWeight: '800',
            letterSpacing: 0.7,
            textTransform: 'uppercase',
        },
        footerMetricValue: {
            color: tokens.colors.textPrimary,
            fontSize: 18,
            fontWeight: '800',
            marginTop: 2,
        },
        footerMetricValueSuccess: {
            color: tokens.colors.success,
        },
        footerMetricValueWarning: {
            color: tokens.colors.warning,
        },
        footerCard: {
            marginTop: 0,
            borderWidth: 1,
            borderColor: '#26303D',
            backgroundColor: '#0F151D',
        },
        footerCardCompact: {
            paddingTop: 8,
            paddingBottom: 8,
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
        summaryFooterRowCompact: {
            paddingVertical: 6,
        },
        summaryMetaRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: tokens.spacing.sm,
            paddingHorizontal: tokens.spacing.xs,
            paddingTop: 4,
        },
        summaryMetaRowCompact: {
            paddingTop: 2,
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
        summaryMetaLabel: {
            flex: 1,
            minWidth: 0,
            flexShrink: 1,
            color: tokens.colors.textMuted,
            fontSize: 12,
            fontWeight: '600',
            lineHeight: 16,
        },
        summaryFooterValue: {
            color: tokens.colors.textPrimary,
            fontSize: 24,
            fontWeight: '800',
        },
        summaryMetaValue: {
            color: tokens.colors.textPrimary,
            fontSize: 14,
            fontWeight: '700',
            flexShrink: 0,
            textAlign: 'right',
        },
        summaryFooterValueCompact: {
            fontSize: 20,
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
        footerSectionSpacer: {
            marginBottom: 0,
        },
        footerSectionSpacerCompact: {
            height: 10,
        },
        ctaWrap: {
            marginBottom: 0,
        },
        ctaWrapCompact: {
            marginTop: 2,
        },
        ctaButton: {
            borderRadius: tokens.radii.lg,
            minHeight: 56,
        },
        ctaButtonCompact: {
            minHeight: 60,
            borderRadius: 14,
        },
        footerActionsWrap: {
            gap: tokens.spacing.sm,
        },
    });

export default CartPayment;
