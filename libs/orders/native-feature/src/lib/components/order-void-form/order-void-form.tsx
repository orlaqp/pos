import React, { useEffect, useState } from 'react';

import { View, Text, Alert, FlatList, StyleSheet } from 'react-native';
import { useSharedStyles } from '@pos/theme/native';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import {
    OrderEntity,
    OrderLineEntity,
    OrderService,
} from '@pos/orders/data-access';
import OrderVoidableItem from '../order-voidable-item/order-voidable-item';
import { Button, useTheme } from '@rneui/themed';
import { useSelector } from 'react-redux';
import { selectLoginEmployee } from '@pos/employees/data-access';
import { UICard } from '@pos/shared/ui-native';
import {
    calculateRefundSummary,
    spreadOrderLinesForVoid,
} from './order-void-form.logic';
import i18next from 'i18next';

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
    const [itemList, setItemList] = useState<OrderLineEntity[]>([]);
    const [newTotal, setNewTotal] = useState<number>(0);
    const [existingRefundAmount, setExistingRefundAmount] = useState<number>(0);
    const [linesToRefund, setLinesToRefund] = useState<OrderLineEntity[]>([]);
    const [busy, setBusy] = useState<boolean>(false);
    const t = (key: string, fallback: string) =>
        i18next.isInitialized && i18next.exists(key)
            ? String(i18next.t(key))
            : fallback;
    const employee = useSelector(selectLoginEmployee);
    const paymentSummary = (order.paymentInfo?.payments || []).reduce(
        (acc: Record<string, number>, payment) => {
            const type = String(payment.type || 'Unknown');
            acc[type] = (acc[type] || 0) + Number(payment.amount || 0);
            return acc;
        },
        {}
    );
    const paymentTypes = Object.keys(paymentSummary);
    const ebtFromPayments = paymentSummary.EBT || 0;
    const ebtFromLines = (order.lines || []).reduce(
        (acc, line) => acc + Number(line?.ebtPaidAmount || 0),
        0
    );

    const onItemToggle = (line: OrderLineEntity, selected: boolean) => {
        if (selected) {
            setLinesToRefund((list) => [...list, line]);
        } else {
            const newItems = [...linesToRefund];
            newItems.splice(newItems.indexOf(line), 1);
            setLinesToRefund((list) => [...newItems]);
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
        const summary = calculateRefundSummary(
            Math.max(0, order.total - existingRefundAmount),
            linesToRefund
        );
        setRefundAmount(-1 * summary.refundTotal);
        setNewTotal(summary.newTotal);
    }, [existingRefundAmount, order, linesToRefund]);

    useEffect(() => {
        let cancelled = false;

        OrderService.getRefundedQuantitiesForOrder(order.id)
            .then((quantities) => {
                if (cancelled) return;
                setItemList(spreadOrderLinesForVoid(order.lines, quantities));
            })
            .catch(() => {
                if (cancelled) return;
                setItemList(spreadOrderLinesForVoid(order.lines));
            });

        OrderService.getRefundRecordsForOrder(order.id)
            .then((refunds) => {
                if (cancelled) return;
                setExistingRefundAmount(
                    refunds.reduce(
                        (sum, refund) => sum + Number(refund.refundAmount || 0),
                        0
                    )
                );
            })
            .catch(() => {
                if (cancelled) return;
                setExistingRefundAmount(0);
            });

        return () => {
            cancelled = true;
        };
    }, [order]);

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
            <UICard tone="default" padding="sm" radius="md" style={local.referenceCard}>
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
                                <Text style={local.paymentChipLabel}>{type}</Text>
                                <Text style={local.paymentChipValue}>$ {paymentSummary[type].toFixed(2)}</Text>
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
            <UICard tone="muted" padding="sm" radius="md" style={local.listCard}>
                <FlatList
                    horizontal={false}
                    data={itemList}
                    keyExtractor={(item, index) => `${item.identifier}-${index}`}
                    renderItem={(data) => (
                        <OrderVoidableItem
                            key={data.index}
                            line={data.item}
                            onToggle={onItemToggle}
                        />
                    )}
                    style={{
                        flex: 1,
                        flexDirection: 'column',
                    }}
                />
            </UICard>

            <UICard tone="default" padding="sm" radius="md" style={local.summaryCard}>
                <View style={local.summaryRow}>
                <View
                        style={local.summaryCol}
                >
                    <Text style={[styles.secondaryText, local.label]}>
                        {t('ORDERVOID_OriginalAmount', 'Original Amount')}:
                    </Text>
                    <Text
                        style={[
                            styles.primaryText,
                            styles.textRight,
                            local.value,
                        ]}
                    >
                        $ {order.total.toFixed(2)}
                    </Text>
                </View>
                <View
                        style={local.summaryCol}
                >
                    <Text style={[styles.secondaryText, local.label]}>
                        {t('ORDERVOID_RefundAmount', 'Refund Amount')}:
                    </Text>
                    <Text
                        style={[
                            styles.textRight,
                            local.value,
                            { color: theme.theme.colors.error },
                        ]}
                    >
                        $ {(refundAmount * -1).toFixed(2)}
                    </Text>
                </View>
                <View
                        style={local.summaryCol}
                >
                    <Text style={[styles.secondaryText, local.label]}>
                        {t('ORDERVOID_NewAmount', 'New Amount')}:
                    </Text>
                    <Text
                        style={[
                            styles.textRight,
                            local.value,
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
                                refundAmount === 0
                                    ? theme.theme.colors.grey2
                                    : styles.primaryText.color,
                        }}
                        disabled={refundAmount === 0}
                        loading={busy}
                        onPress={confirmRefund}
                        buttonStyle={local.processBtn}
                    />
                </View>
            </UICard>
        </View>
    );
}

const useStyles = (tokens: ReturnType<typeof useDesignTokens>) =>
    StyleSheet.create({
        container: {
            height: 560,
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
        listCard: {
            flex: 1,
            marginBottom: tokens.spacing.sm,
        },
        referenceCard: {
            marginBottom: tokens.spacing.sm,
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
        ebtHint: {
            marginTop: 2,
            color: tokens.colors.warning,
            fontSize: 12,
            fontWeight: '700',
        },
        summaryCard: {
            flexShrink: 0,
        },
        summaryRow: {
            flexDirection: 'row',
            alignItems: 'flex-start',
        },
        summaryCol: {
            flex: 1,
            alignItems: 'flex-end',
            paddingHorizontal: tokens.spacing.xs,
        },
        label: {
            fontSize: 13,
        },
        value: {
            fontSize: 24,
            fontWeight: '800',
        },
        actionsWrap: {
            marginTop: tokens.spacing.sm,
            alignItems: 'flex-end',
        },
        processBtn: {
            borderRadius: tokens.radii.lg,
            minWidth: 160,
        },
    });

export default OrderVoidForm;
