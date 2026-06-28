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
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
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

const PaymentMethod = {
    cc: {
        labelKey: 'PAYMENT_Method_CreditCard',
        label: 'Credit Card',
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
            (x) => x !== 'check' || canReceiveChecks,
        );
    }, [canReceiveChecks]);
    const paymentMethodRows = useMemo(() => {
        return PAYMENT_METHOD_ROWS.map((row) =>
            row.filter((method) => paymentMethods.includes(method)),
        ).filter((row) => row.length > 0);
    }, [paymentMethods]);
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

    const setMethodActive = (method: PaymentKey, active: boolean) => {
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
        const widthPercent =
            roundedTotal > 0 ? Math.min(100, (amount / roundedTotal) * 100) : 0;

        return [
            local.balanceBarSegment,
            method === 'ebt'
                ? local.balanceBarSegmentEbt
                : local.balanceBarSegmentDefault,
            { flexBasis: `${widthPercent}%` },
        ];
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
            const rawText = `${raw ?? ''}`.trim();
            if (rawText === '') return;

            if (programmaticUpdates.current.has(paymentKey)) {
                programmaticUpdates.current.delete(paymentKey);
                return;
            }

            previousValues.current[paymentKey] = toNumber(raw);

            const values = value as PaymentInfo;
            const currentlyActiveMethods = paymentMethods.filter((method) =>
                isMethodActive(method, values),
            );

            if (!currentlyActiveMethods.includes(paymentKey)) return;

            const balance = calculateSplitPaymentBalance({
                changedMethod: paymentKey,
                activeMethods: currentlyActiveMethods,
                values,
                total,
                ebtEligibleTotal,
            });

            cashierEnteredMethod.current = paymentKey;
            calculatedMethod.current = balance.calculatedMethod ?? null;
            cappedMethod.current = balance.cappedMethod ?? null;

            (Object.keys(balance.values) as PaymentKey[]).forEach((method) => {
                const nextValue = balance.values[method];
                if (nextValue === undefined) return;
                if (round2Dec(toNumber(value[method])) === round2Dec(nextValue)) {
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
        });

        return () => subscription.unsubscribe();
    }, [form, paymentMethods, total, ebtEligibleTotal, isMethodActive]);

    return (
        <View style={local.shell}>
            <FormProvider {...form}>
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
                <View
                    style={[
                        local.zoneSpacer,
                        isCompact && local.zoneSpacerCompact,
                    ]}
                >
                    <UIVerticalSpacer size="small" />
                </View>
                <ScrollView
                    style={local.methodsScroll}
                    contentContainerStyle={local.methodsScrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={local.methodsGrid}>
                        {paymentMethodRows.map((row, rowIndex) => (
                            <View
                                key={`payment-row-${rowIndex}`}
                                style={local.methodGridRow}
                            >
                                {row.map((m) => {
                                    const isSingleCard = row.length === 1;
                                    const isActive = isMethodActive(
                                        m,
                                        formValue,
                                    );

                                    return (
                                        <Pressable
                                            key={m}
                                            testID={`payment-card-${m}`}
                                            onPress={() =>
                                                setMethodActive(m, !isActive)
                                            }
                                            style={[
                                                isSingleCard
                                                    ? local.methodCardSingle
                                                    : local.methodCardHalf,
                                            ]}
                                        >
                                            {isActive ? (
                                                <View
                                                    style={
                                                        local.methodCardActiveAccent
                                                    }
                                                />
                                            ) : null}
                                            <UICard
                                                tone="default"
                                                padding={
                                                    isCompact ? 'xs' : 'sm'
                                                }
                                                radius="md"
                                                style={[
                                                    local.methodCard,
                                                    isCompact &&
                                                        local.methodCardCompact,
                                                    isActive
                                                        ? local.methodCardActive
                                                        : local.methodCardInactive,
                                                ]}
                                            >
                                                <View style={local.methodBody}>
                                                    <Text
                                                        style={[
                                                            local.methodCaption,
                                                            isActive
                                                                ? local.methodCaptionActive
                                                                : local.methodCaptionInactive,
                                                        ]}
                                                    >
                                                        {t(
                                                            PaymentMethod[m]
                                                                .labelKey,
                                                            PaymentMethod[m]
                                                                .label,
                                                        )}
                                                    </Text>
                                                    <View
                                                        style={
                                                            local.methodInputWrap
                                                        }
                                                    >
                                                        <UINumericInput
                                                            testID={`payment-input-${m}`}
                                                            keyboardType="decimal-pad"
                                                            name={m}
                                                            allowDecimals={true}
                                                            textAlign="right"
                                                            lIcon="currency-usd"
                                                            clearTextOnFocus={
                                                                false
                                                            }
                                                            selectTextOnFocus={
                                                                true
                                                            }
                                                            onFocus={() => {
                                                                const wasActive =
                                                                    isMethodActive(
                                                                        m,
                                                                    );
                                                                if (
                                                                    !wasActive
                                                                ) {
                                                                    setMethodActive(
                                                                        m,
                                                                        true,
                                                                    );
                                                                    return;
                                                                }

                                                                previousValues.current[
                                                                    m
                                                                ] = toNumber(
                                                                    form.getValues(
                                                                        m,
                                                                    ),
                                                                );
                                                                form.setValue(
                                                                    m,
                                                                    '' as PaymentInfo[typeof m],
                                                                );
                                                            }}
                                                            onBlur={() =>
                                                                setTimeout(
                                                                    () =>
                                                                        restoreIfEmpty(
                                                                            m,
                                                                        ),
                                                                    0,
                                                                )
                                                            }
                                                            onEndEditing={() =>
                                                                setTimeout(
                                                                    () =>
                                                                        restoreIfEmpty(
                                                                            m,
                                                                        ),
                                                                    0,
                                                                )
                                                            }
                                                            containerStyle={
                                                                isCompact
                                                                    ? local.methodInputContainerCompact
                                                                    : local.methodInputContainer
                                                            }
                                                            inputContainerStyle={
                                                                isCompact
                                                                    ? local.methodInputInnerCompact
                                                                    : local.methodInputInner
                                                            }
                                                            inputStyle={[
                                                                styles.inputStyle,
                                                                local.methodInputText,
                                                                isCompact &&
                                                                    local.methodInputTextCompact,
                                                                !isActive &&
                                                                    local.methodInputTextInactive,
                                                            ]}
                                                        />
                                                    </View>
                                                    {getMethodHelperText(m) ? (
                                                        <Text
                                                            style={[
                                                                local.methodHelperText,
                                                                cappedMethod.current ===
                                                                    m &&
                                                                    local.methodHelperTextWarning,
                                                            ]}
                                                        >
                                                            {getMethodHelperText(
                                                                m,
                                                            )}
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
                </ScrollView>
                {showSplitBalanceBar ? (
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
                            {activeMethods.map((method) => (
                                <View
                                    key={`payment-balance-${method}`}
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
                                        style={[
                                            local.balanceLegendDot,
                                            method === 'ebt'
                                                ? local.balanceLegendDotEbt
                                                : local.balanceLegendDotDefault,
                                        ]}
                                    />
                                    <Text style={local.balanceLegendText}>
                                        {t(
                                            PaymentMethod[method].labelKey,
                                            PaymentMethod[method].label,
                                        )}{' '}
                                        ${toNumber(watchedValues[method]).toFixed(2)}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </UICard>
                ) : null}
                <View style={local.footerRail}>
                    <UICard
                        tone="muted"
                        padding={isCompact ? 'xs' : 'sm'}
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
                                isCompact && local.summaryFooterRowCompact,
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
                                    isCompact &&
                                        local.summaryFooterValueCompact,
                                ]}
                            >
                                $ {roundedReceivedTotal.toFixed(2)}
                            </Text>
                        </View>
                        {activeCardSurchargeAmount > 0 ? (
                            <>
                                <View
                                    style={[
                                        local.summaryMetaRow,
                                        isCompact &&
                                            local.summaryMetaRowCompact,
                                    ]}
                                >
                                    <Text style={local.summaryMetaLabel}>
                                        {t(
                                            'PAYMENT_CreditCardSurcharge',
                                            'Credit Card Surcharge',
                                        )}
                                    </Text>
                                    <Text style={local.summaryMetaValue}>
                                        $ {activeCardSurchargeAmount.toFixed(2)}
                                    </Text>
                                </View>
                                <View
                                    style={[
                                        local.summaryMetaRow,
                                        isCompact &&
                                            local.summaryMetaRowCompact,
                                    ]}
                                >
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
                    <View
                        style={[
                            local.footerSectionSpacer,
                            isCompact && local.footerSectionSpacerCompact,
                        ]}
                    >
                        <UIVerticalSpacer size="small" />
                    </View>
                    <View style={local.ctaWrap}>
                        <Button
                            testID="payment-submit-button"
                            title={`${t('PAYMENT_ReceivePayment', 'Receive Payment')} ($${total.toFixed(2)})`}
                            buttonStyle={[
                                local.ctaButton,
                                isCompact && local.ctaButtonCompact,
                            ]}
                            disabled={!isExactPayment || disableSubmit}
                            icon={{
                                name: 'check',
                                type: 'material-community',
                                color: styles.primaryText.color,
                            }}
                            onPress={() => completeOrder(form.getValues())}
                        />
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
        summaryCard: {
            borderWidth: 1,
            borderColor: `${tokens.colors.border}AA`,
            backgroundColor: '#0D1118',
        },
        summaryCardCompact: {
            paddingTop: tokens.spacing.sm,
            paddingBottom: tokens.spacing.sm,
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
            fontSize: 28,
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
            minHeight: 74,
        },
        methodCardHalf: {
            flex: 1,
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
        methodBody: {
            flex: 1,
            justifyContent: 'space-between',
        },
        methodCaption: {
            textTransform: 'uppercase',
            letterSpacing: 0.9,
            fontWeight: '800',
            fontSize: 10,
            marginBottom: tokens.spacing.sm,
        },
        methodCaptionActive: {
            color: '#B6D4FF',
        },
        methodCaptionInactive: {
            color: '#8A98AA',
        },
        methodInputWrap: {
            width: '100%',
            justifyContent: 'center',
            paddingHorizontal: tokens.spacing.sm,
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
            minHeight: 34,
            borderRadius: 10,
            paddingLeft: 8,
            paddingRight: 8,
        },
        methodInputTextCompact: {
            fontSize: 14,
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
        },
        balanceBarSegment: {
            height: '100%',
            minWidth: 2,
        },
        balanceBarSegmentDefault: {
            backgroundColor: '#4EA3FF',
        },
        balanceBarSegmentEbt: {
            backgroundColor: '#6AC678',
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
        balanceLegendDotDefault: {
            backgroundColor: '#4EA3FF',
        },
        balanceLegendDotEbt: {
            backgroundColor: '#6AC678',
        },
        balanceLegendText: {
            color: tokens.colors.textMuted,
            fontSize: 11,
            fontWeight: '700',
        },
        footerRail: {
            borderTopWidth: 1,
            borderTopColor: `${tokens.colors.border}88`,
            paddingTop: tokens.spacing.md,
            backgroundColor: '#05080C',
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
            height: 4,
        },
        ctaWrap: {
            marginBottom: 0,
        },
        ctaButton: {
            borderRadius: tokens.radii.lg,
            minHeight: 56,
        },
        ctaButtonCompact: {
            minHeight: 48,
            borderRadius: 16,
        },
        footerActionsWrap: {
            gap: tokens.spacing.sm,
        },
    });

export default CartPayment;
