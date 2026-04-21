import React, { useEffect, useMemo, useRef, useState } from 'react';

import {
    View,
    Text,
    Alert,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    TextInput,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
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
    canAddRefundPaymentRow,
    createEmptyRefundPaymentDraft,
    createRefundPaymentRow,
    getAvailableRefundPaymentTypes,
    getRefundPaymentTotal,
    groupOrderLinesForVoid,
    parseRefundPayments,
    RefundPaymentRowDraft,
    syncSingleRefundPaymentRow,
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
        useState<RefundPaymentRowDraft[]>(() =>
            createEmptyRefundPaymentDraft()
        );
    const [openPaymentRowId, setOpenPaymentRowId] = useState<string | null>(null);
    const [refundedTrayExpanded, setRefundedTrayExpanded] =
        useState<boolean>(false);
    const paymentRowCounter = useRef(1);
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
    const canAddPaymentMethod = canAddRefundPaymentRow(refundPaymentDraft);
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
        setRefundPaymentDraft((current) =>
            syncSingleRefundPaymentRow(current, absoluteRefundAmount)
        );
    }, [absoluteRefundAmount, refundPaymentDraft.length]);

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

    const currentTotal = Math.max(
        0,
        Number(order.total || 0) - existingRefundAmount
    );

    const paymentTypeOptions = useMemo(
        () => ({
            CC: t('PAYMENT_Method_CreditCard', 'Credit Card'),
            CASH: t('PAYMENT_Method_Cash', 'Cash'),
            CHECK: t('PAYMENT_Method_Check', 'Check'),
            EBT: t('PAYMENT_Method_EBT', 'EBT'),
        }),
        [t]
    );

    const addRefundPaymentRow = () => {
        if (!canAddPaymentMethod) {
            return;
        }

        paymentRowCounter.current += 1;
        setRefundPaymentDraft((current) => [
            ...current,
            createRefundPaymentRow(
                `refund-payment-row-${paymentRowCounter.current}`
            ),
        ]);
    };

    const updateRefundPaymentRow = (
        rowId: string,
        updater: (row: RefundPaymentRowDraft) => RefundPaymentRowDraft
    ) => {
        setRefundPaymentDraft((current) =>
            current.map((row) => (row.id === rowId ? updater(row) : row))
        );
    };

    const removeRefundPaymentRow = (rowId: string) => {
        setRefundPaymentDraft((current) => {
            if (current.length === 1) {
                return current;
            }

            return current.filter((row) => row.id !== rowId);
        });
        setOpenPaymentRowId((current) => (current === rowId ? null : current));
    };

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
                        <View style={local.refundPaymentHeaderRow}>
                            <Text style={local.referenceText}>
                                {t(
                                    'ORDERVOID_RefundPaymentHelp',
                                    'Choose how the refund was returned. The total must match the refund amount.'
                                )}
                            </Text>
                            <Button
                                testID="order-void-add-payment-row-button"
                                title={t('ORDERVOID_AddPaymentMethod', 'Add')}
                                type="outline"
                                disabled={!canAddPaymentMethod}
                                onPress={addRefundPaymentRow}
                                buttonStyle={local.addPaymentBtn}
                                titleStyle={local.addPaymentBtnTitle}
                                containerStyle={local.addPaymentBtnContainer}
                            />
                        </View>
                        <View style={local.refundPaymentsList}>
                            {refundPaymentDraft.map((row, index) => {
                                const availableTypes = getAvailableRefundPaymentTypes(
                                    refundPaymentDraft,
                                    row.id
                                );
                                const dropdownItems = availableTypes.map((type) => ({
                                    label: paymentTypeOptions[type],
                                    value: type,
                                }));

                                return (
                                    <View
                                        key={row.id}
                                        style={[
                                            local.refundPaymentRow,
                                            openPaymentRowId === row.id &&
                                                local.refundPaymentRowOpen,
                                            { zIndex: 1000 - index },
                                        ]}
                                    >
                                        <TextInput
                                            value={row.amountText}
                                            onChangeText={(value) =>
                                                updateRefundPaymentRow(row.id, (current) => ({
                                                    ...current,
                                                    amountText: value.replace(/[^0-9.]/g, ''),
                                                }))
                                            }
                                            keyboardType="decimal-pad"
                                            placeholder="0.00"
                                            placeholderTextColor={tokens.colors.textMuted}
                                            style={local.refundPaymentRowAmountInput}
                                            testID={`order-void-refund-payment-amount-${index}`}
                                        />
                                        <View style={local.refundPaymentDropdownWrap}>
                                            <DropDownPicker
                                                open={openPaymentRowId === row.id}
                                                value={row.type}
                                                items={dropdownItems}
                                                setOpen={(open) =>
                                                    setOpenPaymentRowId(open ? row.id : null)
                                                }
                                                setValue={(callback) => {
                                                    const nextValue =
                                                        typeof callback === 'function'
                                                            ? callback(row.type)
                                                            : callback;
                                                    updateRefundPaymentRow(
                                                        row.id,
                                                        (current) => ({
                                                            ...current,
                                                            type: nextValue || null,
                                                        })
                                                    );
                                                }}
                                                setItems={() => undefined}
                                                placeholder={t(
                                                    'ORDERVOID_SelectPaymentMethod',
                                                    'Select method'
                                                )}
                                                listMode="SCROLLVIEW"
                                                theme="DARK"
                                                containerStyle={
                                                    local.refundPaymentDropdownHost
                                                }
                                                style={local.refundPaymentDropdown}
                                                dropDownContainerStyle={
                                                    local.refundPaymentDropdownContainer
                                                }
                                                listItemContainerStyle={
                                                    local.refundPaymentDropdownItemContainer
                                                }
                                                selectedItemContainerStyle={
                                                    local.refundPaymentDropdownSelectedItemContainer
                                                }
                                                textStyle={local.refundPaymentDropdownText}
                                                placeholderStyle={
                                                    local.refundPaymentDropdownPlaceholder
                                                }
                                                listItemLabelStyle={
                                                    local.refundPaymentDropdownText
                                                }
                                                arrowIconStyle={
                                                    local.refundPaymentDropdownArrow
                                                }
                                                testID={`order-void-refund-payment-type-${index}`}
                                            />
                                        </View>
                                        {refundPaymentDraft.length > 1 ? (
                                            <TouchableOpacity
                                                onPress={() => removeRefundPaymentRow(row.id)}
                                                style={local.removePaymentRowButton}
                                                testID={`order-void-remove-payment-row-${index}`}
                                            >
                                                <Text style={local.removePaymentRowText}>
                                                    {t('ORDERVOID_Remove', 'Remove')}
                                                </Text>
                                            </TouchableOpacity>
                                        ) : null}
                                    </View>
                                );
                            })}
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
                                testID="order-void-cancel-button"
                                title={t('ORDERVOID_Cancel', 'Cancel')}
                                type="outline"
                                disabled={busy}
                                onPress={onRefundComplete}
                                buttonStyle={local.cancelBtn}
                                titleStyle={local.cancelBtnTitle}
                                containerStyle={local.cancelBtnContainer}
                            />
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
                                disabled={
                                    busy ||
                                    refundAmount === 0 ||
                                    !isRefundPaymentBalanced
                                }
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
        refundPaymentSection: {
            flexShrink: 0,
        },
        refundPaymentHeaderRow: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
        },
        addPaymentBtnContainer: {
            marginLeft: tokens.spacing.sm,
        },
        addPaymentBtn: {
            minHeight: 36,
            borderRadius: tokens.radii.md,
            borderColor: tokens.colors.border,
            backgroundColor: 'transparent',
            paddingHorizontal: tokens.spacing.sm,
        },
        addPaymentBtnTitle: {
            color: tokens.colors.textPrimary,
            fontWeight: '700',
        },
        refundPaymentsList: {
            marginTop: tokens.spacing.sm,
        },
        refundPaymentRow: {
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: tokens.radii.md,
            borderWidth: 1,
            borderColor: tokens.colors.border,
            backgroundColor: tokens.colors.surfaceMuted,
            paddingHorizontal: tokens.spacing.sm,
            paddingVertical: tokens.spacing.xs,
            marginBottom: tokens.spacing.sm,
        },
        refundPaymentRowOpen: {
            zIndex: 1000,
        },
        refundPaymentRowAmountInput: {
            width: 96,
            borderRadius: tokens.radii.sm,
            borderWidth: 1,
            borderColor: tokens.colors.border,
            backgroundColor: tokens.colors.surface,
            color: tokens.colors.textPrimary,
            paddingHorizontal: tokens.spacing.sm,
            paddingVertical: 8,
            fontSize: 16,
            fontWeight: '700',
            marginRight: tokens.spacing.sm,
        },
        refundPaymentDropdownWrap: {
            flex: 1,
        },
        refundPaymentDropdownHost: {
            width: '100%',
        },
        refundPaymentDropdown: {
            minHeight: 42,
            borderRadius: tokens.radii.sm,
            borderColor: tokens.colors.border,
            backgroundColor: '#1d232c',
        },
        refundPaymentDropdownContainer: {
            borderColor: tokens.colors.border,
            backgroundColor: '#1d232c',
            borderRadius: tokens.radii.sm,
            marginTop: 2,
            opacity: 1,
            elevation: 12,
            shadowColor: '#000000',
            shadowOpacity: 0.35,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 8 },
        },
        refundPaymentDropdownItemContainer: {
            backgroundColor: '#1d232c',
        },
        refundPaymentDropdownSelectedItemContainer: {
            backgroundColor: '#2b3440',
        },
        refundPaymentDropdownText: {
            color: tokens.colors.textPrimary,
            fontSize: 14,
            fontWeight: '600',
        },
        refundPaymentDropdownPlaceholder: {
            color: tokens.colors.textMuted,
            fontSize: 14,
        },
        refundPaymentDropdownArrow: {
            tintColor: tokens.colors.textMuted,
        },
        removePaymentRowButton: {
            marginLeft: tokens.spacing.sm,
            minHeight: 40,
            minWidth: 88,
            borderRadius: tokens.radii.sm,
            borderWidth: 1,
            borderColor: `${tokens.colors.danger}99`,
            backgroundColor: `${tokens.colors.danger}2a`,
            paddingVertical: tokens.spacing.xs,
            paddingHorizontal: tokens.spacing.sm,
            alignItems: 'center',
            justifyContent: 'center',
        },
        removePaymentRowText: {
            color: tokens.colors.danger,
            fontSize: 13,
            fontWeight: '800',
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
            color: tokens.colors.danger,
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
            flexDirection: 'row',
            alignItems: 'stretch',
        },
        cancelBtnContainer: {
            flex: 0.7,
            marginRight: tokens.spacing.sm,
        },
        cancelBtn: {
            borderRadius: tokens.radii.lg,
            minHeight: 52,
            borderColor: tokens.colors.border,
            backgroundColor: 'transparent',
        },
        cancelBtnTitle: {
            color: tokens.colors.textPrimary,
            fontWeight: '700',
        },
        processBtn: {
            borderRadius: tokens.radii.lg,
            minHeight: 52,
            flex: 1.3,
        },
    });

export default OrderVoidForm;
