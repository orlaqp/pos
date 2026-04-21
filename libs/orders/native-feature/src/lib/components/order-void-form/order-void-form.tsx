import React, { useEffect, useMemo, useState } from 'react';

import {
    View,
    Text,
    Alert,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    TextInput,
} from 'react-native';
import { useSharedStyles } from '@pos/theme/native';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import {
    OrderEntity,
    OrderLineEntity,
    OrderService,
    selectRefundedAmountForOrder,
    selectRefundedQuantitiesForOrder,
} from '@pos/orders/data-access';
import OrderVoidableItem from '../order-voidable-item/order-voidable-item';
import { Button, useTheme } from '@rneui/themed';
import { useSelector } from 'react-redux';
import { selectLoginEmployee } from '@pos/employees/data-access';
import { UICard } from '@pos/shared/ui-native';
import {
    buildRefundPaymentDraft,
    getRefundPaymentTotal,
    groupOrderLinesForVoid,
    parseRefundPayments,
    RefundPaymentDraft,
} from './order-void-form.logic';
import i18next from 'i18next';
import { RootState } from '@pos/store';

export interface OrderItemProps {
    order: OrderEntity;
    onRefundComplete: () => void;
}

export function OrderVoidForm({ order, onRefundComplete }: OrderItemProps) {
    const theme = useTheme();
    const styles = useSharedStyles();
    const tokens = useDesignTokens();
    const local = useStyles(tokens);
    const [refundAmount, setRefundAmount] = useState<number>(0);
    const [newTotal, setNewTotal] = useState<number>(0);
    const [linesToRefund, setLinesToRefund] = useState<OrderLineEntity[]>([]);
    const [busy, setBusy] = useState<boolean>(false);
    const [refundPaymentDraft, setRefundPaymentDraft] =
        useState<RefundPaymentDraft>(() =>
            buildRefundPaymentDraft(order.paymentInfo?.payments, 0)
        );
    const [refundedTrayExpanded, setRefundedTrayExpanded] =
        useState<boolean>(false);
    const t = (key: string, fallback: string) =>
        i18next.isInitialized && i18next.exists(key)
            ? String(i18next.t(key))
            : fallback;
    const employee = useSelector(selectLoginEmployee);
    const existingRefundAmount = useSelector((state: RootState) =>
        selectRefundedAmountForOrder(state, order.id)
    );
    const refundedQuantitiesObject = useSelector((state: RootState) =>
        selectRefundedQuantitiesForOrder(state, order.id)
    );
    const refundedQuantities = useMemo(
        () => new Map(Object.entries(refundedQuantitiesObject)),
        [refundedQuantitiesObject]
    );
    const groupedLines = useMemo(
        () => groupOrderLinesForVoid(order.lines, refundedQuantities),
        [order.lines, refundedQuantities]
    );
    const itemList = groupedLines.remainingItems;
    const refundedItemList = groupedLines.refundedItems;
    const paymentSummary = (order.paymentInfo?.payments || []).reduce(
        (acc: Record<string, number>, payment) => {
            const type = String(payment.type || 'Unknown');
            acc[type] = (acc[type] || 0) + Number(payment.amount || 0);
            return acc;
        },
        {}
    );
    const paymentTypes = Object.keys(paymentSummary);
    const refundPayments = useMemo(
        () => parseRefundPayments(refundPaymentDraft),
        [refundPaymentDraft]
    );
    const refundPaymentTotal = useMemo(
        () => getRefundPaymentTotal(refundPayments),
        [refundPayments]
    );
    const absoluteRefundAmount = Math.abs(refundAmount);
    const isRefundPaymentBalanced =
        Number(refundPaymentTotal.toFixed(2)) ===
        Number(absoluteRefundAmount.toFixed(2));
    const ebtFromPayments = paymentSummary.EBT || 0;
    const ebtFromLines = (order.lines || []).reduce(
        (acc, line) => acc + Number(line?.ebtPaidAmount || 0),
        0
    );

    const onItemToggle = (line: OrderLineEntity, selected: boolean) => {
        if (selected) {
            if (!linesToRefund.includes(line)) {
                setLinesToRefund((list) => [...list, line]);
            }
        } else {
            setLinesToRefund((list) => list.filter((item) => item !== line));
        }
    };

    const processRefund = async () => {
        if (!employee) {
            Alert.alert(
                t('ORDERVOID_Error', 'Error'),
                t(
                    'ORDERVOID_NoEmployee',
                    'Refund is not possible because no login employee was found'
                )
            );
            return;
        }

        setBusy(true);
        try {
            await OrderService.refund({
                by: employee as any,
                id: order.id,
                order: order as any,
                refundPayments,
                refundedLines: linesToRefund.map((l) => ({
                    identifier: l.identifier,
                    price: l.price,
                    quantity: l.quantity,
                }))
            });
            onRefundComplete();
        } catch (error) {
            Alert.alert(
                t('ORDERVOID_Error', 'Error'),
                error instanceof Error
                    ? error.message
                    : t(
                          'ORDERVOID_ProcessFailed',
                          'The refund could not be completed. Please try again.'
                      )
            );
        } finally {
            setBusy(false);
        }
    };

    const confirmRefund = () => {
        if (!isRefundPaymentBalanced) {
            Alert.alert(
                t('ORDERVOID_Error', 'Error'),
                t(
                    'ORDERVOID_RefundPaymentMismatch',
                    'Refund payment methods must add up to the refund amount before processing.'
                )
            );
            return;
        }

        Alert.alert(
            t('ORDERVOID_ConfirmTitle', 'Are you sure?'),
            t(
                'ORDERVOID_ConfirmMessage',
                'You will not be able to undo this operation'
            ),
            [
                { text: t('ORDERVOID_No', 'No') },
                { text: t('ORDERVOID_Yes', 'Yes'), onPress: processRefund },
            ]
        );
    };

    useEffect(() => {
        let cancelled = false;

        if (!linesToRefund.length) {
            setRefundAmount(0);
            setNewTotal(Math.max(0, order.total - existingRefundAmount));
            return () => {
                cancelled = true;
            };
        }

        OrderService.previewRefund({
            id: order.id,
            order: order as any,
            refundedLines: linesToRefund.map((line) => ({
                identifier: line.identifier,
                quantity: line.quantity,
            })),
        })
            .then((summary) => {
                if (cancelled) return;
                setRefundAmount(-1 * Number(summary.refundTotal || 0));
                setNewTotal(Number(summary.newTotal || 0));
            })
            .catch(() => {
                if (cancelled) return;
                setRefundAmount(0);
                setNewTotal(Math.max(0, order.total - existingRefundAmount));
            });

        return () => {
            cancelled = true;
        };
    }, [existingRefundAmount, order, linesToRefund]);

    useEffect(() => {
        setRefundPaymentDraft(
            buildRefundPaymentDraft(order.paymentInfo?.payments, absoluteRefundAmount)
        );
    }, [absoluteRefundAmount, order.paymentInfo?.payments]);

    const currentTotal = Math.max(
        0,
        Number(order.total || 0) - existingRefundAmount
    );

    return (
        <View style={[styles.pageBackground, local.container]}>
            <View style={local.headerRow}>
                <Text style={local.title}>{t('ORDERVOID_Title', 'Void Items')}</Text>
                <Text style={local.subtitle}>
                    {t(
                        'ORDERVOID_Subtitle',
                        'Select items to refund from this order'
                    )}
                </Text>
            </View>
            <View style={local.bodyRow} testID="order-void-two-column-layout">
                <View style={local.leftColumn}>
                    <UICard
                        tone="muted"
                        padding="sm"
                        radius="md"
                        style={local.listCard}
                    >
                        <Text style={local.sectionTitle}>
                            {t('ORDERVOID_AvailableItems', 'Available to refund')}
                        </Text>
                        <FlatList
                            horizontal={false}
                            data={itemList}
                            keyExtractor={(item, index) => `${item.identifier}-${index}`}
                            renderItem={(data) => (
                                <OrderVoidableItem
                                    line={data.item}
                                    onToggle={onItemToggle}
                                    selected={linesToRefund.includes(data.item)}
                                    testIDPrefix="order-void-available-line"
                                />
                            )}
                            style={local.availableList}
                            ListEmptyComponent={
                                <Text style={local.emptyStateText}>
                                    {t(
                                        'ORDERVOID_NoRemainingItems',
                                        'No refundable items remain on this order.'
                                    )}
                                </Text>
                            }
                        />
                    </UICard>

                    {refundedItemList.length > 0 && (
                        <UICard
                            tone="default"
                            padding="sm"
                            radius="md"
                            style={local.refundedTrayCard}
                        >
                            <TouchableOpacity
                                onPress={() =>
                                    setRefundedTrayExpanded((expanded) => !expanded)
                                }
                                style={local.trayHeader}
                                testID="order-void-refunded-tray-toggle"
                                activeOpacity={0.8}
                            >
                                <View>
                                    <Text style={local.sectionTitle}>
                                        {t(
                                            'ORDERVOID_AlreadyRefunded',
                                            'Already refunded'
                                        )}
                                    </Text>
                                    <Text style={local.trayMeta}>
                                        {t(
                                            'ORDERVOID_AlreadyRefundedCount',
                                            '{{count}} item(s) for reference'
                                        ).replace(
                                            '{{count}}',
                                            refundedItemList.length.toString()
                                        )}
                                    </Text>
                                </View>
                                <Text style={local.trayToggleText}>
                                    {refundedTrayExpanded
                                        ? t('ORDERVOID_Hide', 'Hide')
                                        : t('ORDERVOID_Show', 'Show')}
                                </Text>
                            </TouchableOpacity>
                            {refundedTrayExpanded && (
                                <View style={local.trayBody}>
                                    <FlatList
                                        horizontal={false}
                                        data={refundedItemList}
                                        keyExtractor={(item, index) =>
                                            `refunded-${item.identifier}-${index}`
                                        }
                                        renderItem={(data) => (
                                            <OrderVoidableItem
                                                line={data.item}
                                                onToggle={onItemToggle}
                                                readOnly
                                                compact
                                                testIDPrefix="order-void-refunded-line"
                                            />
                                        )}
                                        style={local.trayList}
                                    />
                                </View>
                            )}
                        </UICard>
                    )}
                </View>

                <View style={local.rightColumn}>
                    <UICard
                        tone="default"
                        padding="sm"
                        radius="md"
                        style={local.referenceCard}
                    >
                        <Text style={local.referenceTitle}>
                            {t('ORDERVOID_PaymentReference', 'Payment Reference')}
                        </Text>
                        {paymentTypes.length === 0 && (
                            <Text style={local.referenceText}>
                                {t(
                                    'ORDERVOID_NoPaymentDetails',
                                    'No payment details were found for this order.'
                                )}
                            </Text>
                        )}
                        {paymentTypes.length > 0 && (
                            <View style={local.paymentRow}>
                                {paymentTypes.map((type) => (
                                    <View key={type} style={local.paymentChip}>
                                        <Text style={local.paymentChipLabel}>
                                            {type}
                                        </Text>
                                        <Text style={local.paymentChipValue}>
                                            $ {paymentSummary[type].toFixed(2)}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}
                        {!!(ebtFromPayments || ebtFromLines) && (
                            <Text style={local.ebtHint}>
                                {t('ORDERVOID_EBTReference', 'EBT reference')}: $ {Math.max(ebtFromPayments, ebtFromLines).toFixed(2)}
                            </Text>
                        )}
                    </UICard>

                    <UICard
                        tone="default"
                        padding="sm"
                        radius="md"
                        style={[local.referenceCard, local.refundPaymentSection]}
                    >
                        <Text style={local.referenceTitle}>
                            {t('ORDERVOID_RefundPayment', 'Refund Payment')}
                        </Text>
                        <Text style={local.referenceText}>
                            {t(
                                'ORDERVOID_RefundPaymentHelp',
                                'Choose how the refund was returned. The total must match the refund amount.'
                            )}
                        </Text>
                        <View style={local.refundPaymentsGrid}>
                            {[
                                ['CC', t('PAYMENT_Method_CreditCard', 'Credit Card')],
                                ['CASH', t('PAYMENT_Method_Cash', 'Cash')],
                                ['CHECK', t('PAYMENT_Method_Check', 'Check')],
                                ['EBT', t('PAYMENT_Method_EBT', 'EBT')],
                            ].map(([type, label]) => (
                                <View key={type} style={local.refundPaymentCard}>
                                    <Text style={local.paymentChipLabel}>{label}</Text>
                                    <TextInput
                                        value={refundPaymentDraft[type as keyof RefundPaymentDraft]}
                                        onChangeText={(value) =>
                                            setRefundPaymentDraft((current) => ({
                                                ...current,
                                                [type]: value.replace(/[^0-9.]/g, ''),
                                            }))
                                        }
                                        keyboardType="decimal-pad"
                                        placeholder="0.00"
                                        placeholderTextColor={tokens.colors.textMuted}
                                        style={local.refundPaymentInput}
                                        testID={`order-void-refund-payment-${String(type).toLowerCase()}`}
                                    />
                                </View>
                            ))}
                        </View>
                        <Text
                            style={[
                                local.ebtHint,
                                !isRefundPaymentBalanced && local.refundPaymentError,
                            ]}
                        >
                            {t('ORDERVOID_RefundPaymentTotal', 'Refund payment total')}: $ {refundPaymentTotal.toFixed(2)}
                            {' · '}
                            {t('ORDERVOID_RefundAmount', 'Refund Amount')}: $ {absoluteRefundAmount.toFixed(2)}
                        </Text>
                    </UICard>

                    <UICard
                        tone="default"
                        padding="sm"
                        radius="md"
                        style={local.summaryCard}
                    >
                        <View style={local.summaryStack}>
                            <View style={local.summaryMetric}>
                                <Text
                                    style={[
                                        styles.secondaryText,
                                        local.label,
                                        local.summaryMetricLabel,
                                    ]}
                                >
                                    {t('ORDERVOID_CurrentTotal', 'Current Total')}:
                                </Text>
                                <Text
                                    style={[
                                        styles.primaryText,
                                        styles.textRight,
                                        local.value,
                                        local.summaryMetricValue,
                                    ]}
                                >
                                    $ {currentTotal.toFixed(2)}
                                </Text>
                            </View>
                            <View style={local.summaryMetric}>
                                <Text
                                    style={[
                                        styles.secondaryText,
                                        local.label,
                                        local.summaryMetricLabel,
                                    ]}
                                >
                                    {t('ORDERVOID_RefundAmount', 'Refund Amount')}:
                                </Text>
                                <Text
                                    style={[
                                        styles.textRight,
                                        local.value,
                                        local.summaryMetricValue,
                                        { color: theme.theme.colors.error },
                                    ]}
                                >
                                    $ {(refundAmount * -1).toFixed(2)}
                                </Text>
                            </View>
                            <View style={local.summaryMetricLast}>
                                <Text
                                    style={[
                                        styles.secondaryText,
                                        local.label,
                                        local.summaryMetricLabel,
                                    ]}
                                >
                                    {t('ORDERVOID_NewAmount', 'New Amount')}:
                                </Text>
                                <Text
                                    style={[
                                        styles.textRight,
                                        local.value,
                                        local.summaryMetricValue,
                                        { color: theme.theme.colors.success },
                                    ]}
                                >
                                    $ {newTotal.toFixed(2)}
                                </Text>
                            </View>
                        </View>
                        <View style={local.actionsWrap}>
                            <Button
                                testID="order-void-process-button"
                                title={t('ORDERVOID_Process', 'Process')}
                                icon={{
                                    name: 'check',
                                    type: 'material-community',
                                    color:
                                        refundAmount === 0 || !isRefundPaymentBalanced
                                            ? theme.theme.colors.grey2
                                            : styles.primaryText.color,
                                }}
                                disabled={refundAmount === 0 || !isRefundPaymentBalanced}
                                loading={busy}
                                onPress={confirmRefund}
                                buttonStyle={local.processBtn}
                            />
                        </View>
                    </UICard>
                </View>
            </View>
        </View>
    );
}

const useStyles = (tokens: ReturnType<typeof useDesignTokens>) =>
    StyleSheet.create({
        container: {
            height: 700,
            flexDirection: 'column',
            margin: 8,
        },
        headerRow: {
            marginBottom: tokens.spacing.sm,
        },
        title: {
            color: tokens.colors.textPrimary,
            fontSize: 24,
            fontWeight: '800',
        },
        subtitle: {
            color: tokens.colors.textMuted,
            fontSize: 13,
            marginTop: 2,
        },
        bodyRow: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'stretch',
        },
        leftColumn: {
            flex: 1.55,
            marginRight: tokens.spacing.sm,
        },
        rightColumn: {
            flex: 1,
            minWidth: 320,
        },
        listCard: {
            flex: 1,
            marginBottom: tokens.spacing.sm,
        },
        availableList: {
            flex: 1,
            flexDirection: 'column',
        },
        refundedTrayCard: {
            flexShrink: 0,
        },
        referenceCard: {
            marginBottom: tokens.spacing.sm,
        },
        sectionTitle: {
            color: tokens.colors.textPrimary,
            fontSize: 12,
            fontWeight: '800',
            letterSpacing: 0.5,
            textTransform: 'uppercase',
            marginBottom: tokens.spacing.xs,
        },
        emptyStateText: {
            color: tokens.colors.textMuted,
            fontSize: 13,
            paddingVertical: tokens.spacing.sm,
        },
        referenceTitle: {
            color: tokens.colors.textPrimary,
            fontSize: 12,
            fontWeight: '800',
            letterSpacing: 0.5,
            textTransform: 'uppercase',
            marginBottom: tokens.spacing.xs,
        },
        referenceText: {
            color: tokens.colors.textMuted,
            fontSize: 13,
        },
        paymentRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
        },
        paymentChip: {
            borderRadius: tokens.radii.sm,
            borderWidth: 1,
            borderColor: tokens.colors.border,
            backgroundColor: tokens.colors.surfaceMuted,
            paddingVertical: 4,
            paddingHorizontal: 8,
            marginRight: tokens.spacing.xs,
            marginBottom: tokens.spacing.xs,
        },
        paymentChipLabel: {
            color: tokens.colors.textMuted,
            fontSize: 11,
            fontWeight: '700',
            textTransform: 'uppercase',
        },
        paymentChipValue: {
            color: tokens.colors.textPrimary,
            fontSize: 14,
            fontWeight: '800',
        },
        refundPaymentsGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginTop: tokens.spacing.sm,
        },
        refundPaymentSection: {
            flexShrink: 0,
        },
        refundPaymentCard: {
            width: '48%',
            borderRadius: tokens.radii.md,
            borderWidth: 1,
            borderColor: tokens.colors.border,
            backgroundColor: tokens.colors.surfaceMuted,
            paddingVertical: tokens.spacing.xs,
            paddingHorizontal: tokens.spacing.sm,
            marginRight: '2%',
            marginBottom: tokens.spacing.xs,
        },
        refundPaymentInput: {
            marginTop: 6,
            borderRadius: tokens.radii.sm,
            borderWidth: 1,
            borderColor: tokens.colors.border,
            backgroundColor: tokens.colors.surface,
            color: tokens.colors.textPrimary,
            paddingHorizontal: tokens.spacing.sm,
            paddingVertical: 8,
            fontSize: 16,
            fontWeight: '700',
        },
        trayHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        trayMeta: {
            color: tokens.colors.textMuted,
            fontSize: 12,
            marginTop: 2,
        },
        trayToggleText: {
            color: tokens.colors.primary,
            fontSize: 13,
            fontWeight: '700',
        },
        trayBody: {
            marginTop: tokens.spacing.sm,
            maxHeight: 164,
        },
        trayList: {
            flexGrow: 0,
        },
        ebtHint: {
            marginTop: 2,
            color: tokens.colors.warning,
            fontSize: 12,
            fontWeight: '700',
        },
        refundPaymentError: {
            color: tokens.colors.error,
            marginTop: tokens.spacing.xs,
        },
        summaryCard: {
            flex: 1,
            justifyContent: 'space-between',
        },
        summaryStack: {
            borderRadius: tokens.radii.md,
            borderWidth: 1,
            borderColor: tokens.colors.border,
            backgroundColor: tokens.colors.surfaceMuted,
            padding: tokens.spacing.sm,
        },
        summaryMetric: {
            paddingVertical: tokens.spacing.sm,
            borderBottomWidth: 1,
            borderBottomColor: tokens.colors.border,
        },
        summaryMetricLast: {
            paddingTop: tokens.spacing.sm,
        },
        label: {
            fontSize: 13,
        },
        summaryMetricLabel: {
            marginBottom: 4,
            textTransform: 'uppercase',
            letterSpacing: 0.4,
        },
        value: {
            fontSize: 24,
            fontWeight: '800',
        },
        summaryMetricValue: {
            fontSize: 28,
        },
        actionsWrap: {
            marginTop: tokens.spacing.sm,
            alignItems: 'stretch',
        },
        processBtn: {
            borderRadius: tokens.radii.lg,
            minWidth: 160,
            minHeight: 52,
        },
    });

export default OrderVoidForm;
