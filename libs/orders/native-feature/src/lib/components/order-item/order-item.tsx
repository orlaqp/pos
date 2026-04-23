import React, { useState } from 'react';

import { View, Text, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { useSharedStyles } from '@pos/theme/native';
import { Button, useTheme } from '@rneui/themed';
import {
    ordersActions,
    OrderEntity,
    OrderService,
    selectRefundedAmountForOrder,
    selectRefundedQuantitiesForOrder,
} from '@pos/orders/data-access';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
    getDefaultPrinter,
    printReceipt,
    PrinterEntityMapper,
    PrinterService,
} from '@pos/printings/data-access';
import {
    selectStore,
    StoreInfoEntityMapper,
    StoreInfoService,
} from '@pos/store-info/data-access';
import { Role } from '@pos/auth/data-access';
import { selectLoginEmployee } from '@pos/employees/data-access';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import { translateWithFallback } from '../../../../../../shared/utils/src/lib/translation';
import { RootState } from '@pos/store';

export interface OrderItemProps {
    item: OrderEntity;
    navigation?: NativeStackNavigationProp<any>;
    onVoid: (order: OrderEntity) => void;
    onPay?: (order: OrderEntity) => void;
    onOpenDetails?: (order: OrderEntity) => void;
}

export interface ParsedOrderNoSegments {
    store: string;
    station: string;
    date: string;
    sequence: string;
}

export const parseOrderNoSegments = (
    orderNo?: string | null,
): ParsedOrderNoSegments | null => {
    if (!orderNo) return null;
    const parts = orderNo.split('-');
    if (parts.length !== 4) return null;

    const [store, station, yymmdd, sequence] = parts;
    if (!/^\d{6}$/.test(yymmdd)) return null;

    const yy = Number(yymmdd.slice(0, 2));
    const month = Number(yymmdd.slice(2, 4));
    const day = Number(yymmdd.slice(4, 6));
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;

    const fullYear = 2000 + yy;
    const date = `${fullYear}-${String(month).padStart(2, '0')}-${String(
        day,
    ).padStart(2, '0')}`;

    return {
        store,
        station,
        date,
        sequence,
    };
};

export const getStatusAccentColor = (
    status: OrderEntity['status'],
    colors: { accent: string; success: string; warning: string },
) => {
    if (status === 'PAID') return colors.success;
    if (status === 'PARTIALLY_REFUNDED') return colors.warning;
    if (status === 'REFUNDED') return colors.warning;
    return colors.accent;
};

export const getOrderStatusLabel = (status: OrderEntity['status']) => {
    if (status === 'PARTIALLY_REFUNDED') {
        return 'P. REFUNDED';
    }

    return status;
};

export function OrderItem({
    item,
    navigation,
    onVoid,
    onPay,
    onOpenDetails,
}: OrderItemProps) {
    const theme = useTheme();
    const tokens = useDesignTokens();
    const styles = useSharedStyles();
    const local = useStyles(tokens);
    const dispatch = useDispatch();
    const defaultPrinter = useSelector(getDefaultPrinter);
    const employee = useSelector(selectLoginEmployee);
    const store = useSelector(selectStore);
    const refundedAmount = useSelector((state: RootState) =>
        selectRefundedAmountForOrder(state, item.id),
    );
    const refundedQuantities = useSelector((state: RootState) =>
        selectRefundedQuantitiesForOrder(state, item.id),
    );
    const [busy, setBusy] = useState<boolean>(false);
    const t = translateWithFallback;

    const deleteItem = async () => {
        if (!item.id) return;

        setBusy(true);
        await OrderService.delete(item.id);
        setBusy(false);
        dispatch(ordersActions.remove(item.id));
    };

    const printItem = async () => {
        const receiptCopyType =
            item.status === 'PAID' ? 'MERCHANT' : 'CUSTOMER';
        const fallbackStore =
            store ||
            (await StoreInfoService.getStore()
                .then((stores) => {
                    const preferred = stores?.[0];
                    return preferred
                        ? StoreInfoEntityMapper.fromModel(preferred)
                        : undefined;
                })
                .catch(() => undefined));
        const fallbackPrinter =
            defaultPrinter ||
            (await PrinterService.getDefaultPrinter()
                .then((printer) =>
                    printer
                        ? PrinterEntityMapper.fromModel(printer)
                        : undefined,
                )
                .catch(() => undefined));

        if (!fallbackStore || !fallbackPrinter) {
            Alert.alert(
                t(
                    'ORDERITEM_PrintRequirements',
                    'Store info and printer setup needs ro be ready before closing an order',
                ),
            );
            return;
        }

        const ticket = await OrderService.buildPrintTicketForOrder(item, {
            copyType: receiptCopyType,
            refundedQuantities:
                item.id &&
                (item.status === 'PARTIALLY_REFUNDED' ||
                    item.status === 'REFUNDED') &&
                Object.keys(refundedQuantities).length > 0
                    ? refundedQuantities
                    : undefined,
        });

        printReceipt(fallbackStore, fallbackPrinter, ticket);
    };

    const confirmDeletion = () => {
        Alert.alert(
            t('ORDERITEM_ConfirmTitle', 'Are you sure?'),
            t(
                'ORDERITEM_DeleteMessage',
                'You will not be able to undo this operation',
            ),
            [
                { text: t('ORDERITEM_No', 'No') },
                {
                    text: t('ORDERITEM_Yes', 'Yes'),
                    onPress: () => deleteItem(),
                },
            ],
        );
    };

    const orderDate = new Date(item.orderDate!);
    const orderDateString = `${orderDate.toLocaleDateString()} ${orderDate.toLocaleTimeString(
        [],
        { hour: '2-digit', minute: '2-digit', second: '2-digit' },
    )}`;
    const parsedOrderNo = parseOrderNoSegments(item.orderNo);
    const statusColor = getStatusAccentColor(item.status, {
        accent: tokens.colors.accent,
        success: tokens.colors.success,
        warning: tokens.colors.warning,
    });
    const statusOwner =
        item.status === 'PAID'
            ? item?.paymentInfo?.employeeName
            : item.status === 'REFUNDED' || item.status === 'PARTIALLY_REFUNDED'
              ? item?.refundInfo?.employeeName
              : undefined;
    const hasRefundDisplay =
        refundedAmount > 0 &&
        (item.status === 'PARTIALLY_REFUNDED' || item.status === 'REFUNDED');
    const activeTotal =
        hasRefundDisplay && item.currentTotal != null
            ? Math.max(0, Number(item.currentTotal || 0))
            : Math.max(0, Number(item.total || 0) - refundedAmount);

    return (
        <View
            testID={`order-item-${item.id}`}
            style={[styles.dataRow, local.row]}
        >
            {busy && <ActivityIndicator size="small" />}
            <View
                style={[local.statusRail, { backgroundColor: statusColor }]}
            />
            <View style={local.infoBlock}>
                <View style={local.orderNoColumn}>
                    <Text style={local.orderEyebrow}>
                        {t('ORDERITEM_OrderEyebrow', 'Order reference')}
                    </Text>
                    <View style={local.chipsRow}>
                        {parsedOrderNo ? (
                            <>
                                <View style={local.chip}>
                                    <Text style={local.chipLabel}>
                                        {t('ORDERITEM_Store', 'Store')}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.primaryText,
                                            local.chipValue,
                                        ]}
                                    >
                                        {parsedOrderNo.store}
                                    </Text>
                                </View>
                                <View style={local.chip}>
                                    <Text style={local.chipLabel}>
                                        {t('ORDERITEM_Station', 'Station')}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.primaryText,
                                            local.chipValue,
                                        ]}
                                    >
                                        {parsedOrderNo.station}
                                    </Text>
                                </View>
                                <View style={local.chip}>
                                    <Text style={local.chipLabel}>
                                        {t('ORDERITEM_Date', 'Date')}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.primaryText,
                                            local.chipValue,
                                        ]}
                                    >
                                        {parsedOrderNo.date}
                                    </Text>
                                </View>
                                <View style={local.chip}>
                                    <Text style={local.chipLabel}>#</Text>
                                    <Text
                                        style={[
                                            styles.primaryText,
                                            local.chipValue,
                                        ]}
                                    >
                                        {parsedOrderNo.sequence}
                                    </Text>
                                </View>
                            </>
                        ) : (
                            <Text style={[styles.name, { marginBottom: 0 }]}>
                                {item.orderNo}
                            </Text>
                        )}
                    </View>
                </View>
                <View style={local.metaColumn}>
                    <Text style={local.metaEyebrow}>
                        {t('ORDERITEM_Cashier', 'Cashier')}
                    </Text>
                    <Text style={styles.primaryText}>{item.employeeName}</Text>
                    <Text
                        numberOfLines={1}
                        style={[styles.secondaryText, local.metaTop]}
                    >
                        {orderDateString}
                    </Text>
                    {!!statusOwner && (
                        <Text
                            numberOfLines={1}
                            style={[styles.secondaryText, local.metaTop]}
                        >
                            {t('ORDERITEM_By', 'By')}: {statusOwner}
                        </Text>
                    )}
                </View>
            </View>
            <View style={local.amountBlock}>
                <View style={[local.statusBadge, { borderColor: statusColor }]}>
                    <Text
                        style={[styles.secondaryText, { color: statusColor }]}
                    >
                        {getOrderStatusLabel(item.status)}
                    </Text>
                </View>
                {hasRefundDisplay && (
                    <Text
                        style={[styles.secondaryText, local.originalAmountText]}
                        testID="order-item-original-total"
                    >
                        {`$ ${item.total.toFixed(2)}`}
                    </Text>
                )}
                <Text
                    style={[styles.name, local.amountText]}
                    testID="order-item-active-total"
                >
                    {`$ ${(hasRefundDisplay ? activeTotal : item.total).toFixed(2)}`}
                </Text>
            </View>
            <View style={local.actionsBlock}>
                {item.status === 'REFUNDED' && (
                    <Button
                        testID="order-item-open-details-button"
                        type="solid"
                        title={t('COMMON_Open', 'Open')}
                        color={theme.theme.colors.primary}
                        buttonStyle={{
                            borderRadius: tokens.radii.md,
                            paddingHorizontal: tokens.spacing.sm,
                        }}
                        titleStyle={{
                            color: theme.theme.colors.grey0,
                        }}
                        onPress={() => onOpenDetails?.(item)}
                    />
                )}
                {item.status === 'OPEN' && (
                    <Button
                        testID="order-item-pay-button"
                        type="solid"
                        title={t('ORDERITEM_Payment', 'Payment')}
                        color={theme.theme.colors.primary}
                        icon={{
                            name: 'credit-card-outline',
                            type: 'material-community',
                            color: theme.theme.colors.grey0,
                        }}
                        buttonStyle={{
                            borderRadius: tokens.radii.md,
                            paddingHorizontal: tokens.spacing.sm,
                        }}
                        titleStyle={{
                            paddingRight: 10,
                            color: theme.theme.colors.grey0,
                        }}
                        onPress={() => onPay?.(item)}
                    />
                )}
                {(item.status === 'PAID' ||
                    item.status === 'PARTIALLY_REFUNDED') && (
                    <>
                        {employee?.roles.includes(Role.VoidOrder) && (
                            <Button
                                type="clear"
                                title={t('ORDERITEM_Void', 'Void')}
                                icon={{
                                    name: 'close-circle-outline',
                                    type: 'material-community',
                                    color: theme.theme.colors.primary,
                                }}
                                buttonStyle={{
                                    paddingHorizontal: tokens.spacing.sm,
                                }}
                                titleStyle={{ paddingRight: 10 }}
                                onPress={() => onVoid(item)}
                            />
                        )}
                        <Button
                            testID="order-item-print-button"
                            type="clear"
                            title={t('ORDERITEM_Print', 'Print')}
                            icon={{
                                name: 'printer-outline',
                                type: 'material-community',
                                color: theme.theme.colors.primary,
                            }}
                            buttonStyle={{
                                paddingHorizontal: tokens.spacing.sm,
                            }}
                            titleStyle={{ paddingRight: 10 }}
                            onPress={printItem}
                        />
                    </>
                )}
                {employee?.roles.includes(Role.RemoveSale) && (
                    <Button
                        type="clear"
                        icon={{
                            name: 'trash-can',
                            type: 'material-community',
                            color: theme.theme.colors.error,
                        }}
                        onPress={confirmDeletion}
                    />
                )}
            </View>
        </View>
    );
}

const useStyles = (tokens: ReturnType<typeof useDesignTokens>) =>
    StyleSheet.create({
        row: {
            alignItems: 'center',
            paddingLeft: tokens.spacing.md,
            paddingVertical: tokens.spacing.md,
            borderRadius: tokens.radii.lg,
            borderWidth: 1,
            borderColor: `${tokens.colors.border}AA`,
            backgroundColor: tokens.colors.surfaceMuted,
            marginHorizontal: tokens.spacing.md,
            marginVertical: tokens.spacing.xs,
        },
        statusRail: {
            width: 5,
            alignSelf: 'stretch',
            borderRadius: tokens.radii.sm,
            marginRight: tokens.spacing.md,
        },
        infoBlock: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'stretch',
        },
        orderNoColumn: {
            flex: 3.5,
            justifyContent: 'center',
            paddingRight: tokens.spacing.md,
        },
        orderEyebrow: {
            color: tokens.colors.textMuted,
            fontSize: 11,
            fontWeight: '800',
            textTransform: 'uppercase',
            letterSpacing: 1.1,
            marginBottom: tokens.spacing.xs,
        },
        metaColumn: {
            flex: 1.5,
            justifyContent: 'center',
            paddingLeft: tokens.spacing.md,
            borderLeftWidth: 1,
            borderLeftColor: tokens.colors.border,
        },
        metaEyebrow: {
            color: tokens.colors.textMuted,
            fontSize: 11,
            fontWeight: '800',
            textTransform: 'uppercase',
            letterSpacing: 1.1,
            marginBottom: 4,
        },
        chipsRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
        },
        chip: {
            borderWidth: 1,
            borderColor: tokens.colors.border,
            borderRadius: tokens.radii.md,
            paddingVertical: 6,
            paddingHorizontal: 8,
            marginRight: tokens.spacing.xs,
            marginBottom: tokens.spacing.xs,
            backgroundColor: tokens.colors.surface,
        },
        chipLabel: {
            color: tokens.colors.textMuted,
            fontSize: 10,
            textTransform: 'uppercase',
            fontWeight: '800',
            letterSpacing: 0.8,
        },
        chipValue: {
            fontSize: 14,
            fontWeight: '800',
            marginTop: 2,
        },
        metaTop: {
            marginTop: tokens.spacing.xs,
        },
        amountBlock: {
            minWidth: 138,
            flexShrink: 0,
            alignItems: 'flex-end',
            justifyContent: 'center',
            marginLeft: tokens.spacing.md,
        },
        statusBadge: {
            borderWidth: 1,
            borderRadius: tokens.radii.md,
            paddingVertical: tokens.spacing.xs,
            paddingHorizontal: tokens.spacing.sm,
            marginBottom: tokens.spacing.xs,
            backgroundColor: tokens.colors.surface,
        },
        amountText: {
            textAlign: 'right',
            marginBottom: 0,
            fontSize: 28,
            fontWeight: '800',
        },
        originalAmountText: {
            textAlign: 'right',
            textDecorationLine: 'line-through',
            opacity: 0.7,
            marginBottom: 2,
        },
        actionsBlock: {
            minWidth: 250,
            flexShrink: 0,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-end',
            marginLeft: tokens.spacing.md,
            gap: tokens.spacing.xs,
        },
    });

export default OrderItem;
