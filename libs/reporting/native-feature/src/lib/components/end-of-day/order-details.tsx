import { Order } from '@pos/shared/models';
import { useSharedStyles } from '@pos/theme/native';
import { Icon } from '@rneui/themed';
import React from 'react';
import i18next from 'i18next';

import { View, Text, StyleSheet } from 'react-native';
import { OrderLineDetails } from './order-line-details';
import { OrderPaymentDetailRow } from './end-of-day.service';

/* eslint-disable-next-line */
export interface OrderDetailsProps {
    order: Order;
    productId: string | null;
    refundedAmount?: number;
    refundedLineAmounts?: Record<string, number>;
    paymentDetails?: OrderPaymentDetailRow[];
}

interface ParsedOrderNoSegments {
    store: string;
    station: string;
    date: string;
    sequence: string;
}

const parseOrderNoSegments = (
    orderNo?: string | null
): ParsedOrderNoSegments | null => {
    if (!orderNo) return null;

    const parts = orderNo.split('-');
    if (parts.length !== 4) return null;

    const [store, station, yymmdd, sequence] = parts;
    if (!/^\d{6}$/.test(yymmdd)) return null;

    const yy = Number(yymmdd.slice(0, 2));
    const month = Number(yymmdd.slice(2, 4));
    const day = Number(yymmdd.slice(4, 6));

    if (month < 1 || month > 12 || day < 1 || day > 31) {
        return null;
    }

    return {
        store,
        station,
        date: `${String(month).padStart(2, '0')}/${String(day).padStart(
            2,
            '0'
        )}/${String(yy).padStart(2, '0')}`,
        sequence,
    };
};

export function OrderDetails({
    order,
    productId,
    refundedAmount = 0,
    refundedLineAmounts = {},
    paymentDetails = [],
}: OrderDetailsProps) {
    const styles = useSharedStyles();
    const t = (key: string, fallback: string) =>
        i18next.isInitialized && i18next.exists(key)
            ? String(i18next.t(key))
            : fallback;
    const discountAmount = Number(order.discountTotal || 0);
    const lineDiscountAmount = (order.lines || []).reduce(
        (sum, line) => sum + Number(line?.lineDiscountTotal || 0),
        0
    );
    const orderLevelDiscountAmount = Math.max(0, discountAmount - lineDiscountAmount);
    const netSales = Math.max(0, Number(order.total || 0) - Number(refundedAmount || 0));
    const createdByName = order.createdBy?.name || order.employeeName || 'Unknown';
    const parsedOrderNo = parseOrderNoSegments(order.orderNo);
    const resolvedPaymentDetails = paymentDetails.length
        ? paymentDetails
        : (order.paymentInfo?.payments || [])
              .map((payment) => ({
                  type: String(payment?.type || '').toUpperCase() as OrderPaymentDetailRow['type'],
                  amount: Number(payment?.amount || 0),
                  kind: 'payment' as const,
              }))
              .filter((payment) => payment.amount > 0);

    return (
        <View style={[styles.box, styles.column]}>
            <View style={styles.row}>
                <View style={[styles.column, { flex: 2.35, marginRight: 28 }]}>
                    {parsedOrderNo ? (
                        <View style={local.chipsRow}>
                            <View style={local.chip}>
                                <Text style={[styles.secondaryText, local.chipValue]}>
                                    {parsedOrderNo.store}
                                </Text>
                            </View>
                            <View style={local.chip}>
                                <Text style={[styles.secondaryText, local.chipValue]}>
                                    {parsedOrderNo.station}
                                </Text>
                            </View>
                            <View style={local.chip}>
                                <Text style={[styles.secondaryText, local.chipValue]}>
                                    {parsedOrderNo.date}
                                </Text>
                            </View>
                            <View style={local.chip}>
                                <Text style={[styles.secondaryText, local.chipValue]}>
                                    {parsedOrderNo.sequence}
                                </Text>
                            </View>
                        </View>
                    ) : (
                        <Text style={styles.secondaryText}>{order.orderNo}</Text>
                    )}
                </View>
                <View style={[styles.column, { flex: 1.15, marginRight: 28 }]}>
                    <Text style={styles.secondaryText}>
                        {t('EOD_CreatedBy', 'Created By')}
                    </Text>
                    <Text style={styles.primaryText}>{createdByName}</Text>
                </View>
                <View style={[styles.column, styles.centered, { flex: .12, marginRight: 20 }]}>
                    <Icon name='arrow-right' type='material-community' size={16} />
                </View>
                <View style={[styles.column, { flex: 1.15, marginRight: 28 }]}>
                    <Text style={styles.secondaryText}>
                        {t('EOD_ClosedBy', 'Closed By')}
                    </Text>
                    <Text style={styles.primaryText}>{order.paymentInfo?.employeeName}</Text>
                </View>
                <View style={{ flex: .2 }}></View>
                <View style={[styles.column, { marginRight: 45 }]}>
                    <Text style={[styles.secondaryText, styles.textRight ]}>
                        {t('EOD_NetSales', 'Collected Sales')}
                    </Text>
                    <Text style={[styles.primaryText, styles.textWarning, styles.textBold ]}>$ {netSales.toFixed(2)}</Text>
                </View>
            </View>
            <View style={[styles.row, { marginTop: 10, marginRight: 26 }]}>
                <View style={{ flex: 1.5, marginRight: 45 }}>
                    <Text style={styles.secondaryText}>
                        {t('EOD_Discounts', 'Discounts')}
                    </Text>
                    <Text style={styles.primaryText}>$ {discountAmount.toFixed(2)}</Text>
                </View>
                <View style={{ flex: 1.5, marginRight: 45 }}>
                    <Text style={styles.secondaryText}>
                        {t('EOD_Refunds', 'Refunds')}
                    </Text>
                    <Text style={styles.primaryText}>$ {refundedAmount.toFixed(2)}</Text>
                </View>
                <View style={{ flex: 3 }} />
            </View>
            <View style={[styles.row, { marginRight: 26, marginTop: 10 }]}>
                <View style={{ flex: 2 }}>
                    <Text style={styles.secondaryText}>
                        {t('EOD_Payments', 'Payments')}
                    </Text>
                    {resolvedPaymentDetails.map((payment, index) => (
                        <Text
                            key={`${payment.kind}-${payment.type}-${index}`}
                            style={styles.primaryText}
                        >
                            {payment.kind === 'refund'
                                ? `${t('EOD_RefundPayment', 'Refund')} ${payment.type}: -$${payment.amount.toFixed(2)}`
                                : `${payment.type}: $${payment.amount.toFixed(2)}`}
                        </Text>
                    ))}
                </View>
                <View style={[styles.box, { flex: 6 }]}>
                    <View style={[styles.row]}>
                        <Text style={[styles.secondaryText, styles.textRight, { flex: 1, marginRight: 30 }]}>
                            {t('EOD_Quantity', 'Quantity')}
                        </Text>
                        <Text style={[styles.secondaryText, { flex: 3 }]}>
                            {t('EOD_Name', 'Name')}
                        </Text>
                        <Text style={[styles.secondaryText, styles.textRight, { flex: 1 }]}>
                            {t('EOD_Price', 'Price')}
                        </Text>
                        <Text style={[styles.secondaryText, styles.textRight, { flex: 1 }]}>
                            {t('EOD_Total', 'Total')}
                        </Text>
                    </View>
                    {order.lines.map((l) =>
                        !l ? null : (
                            <OrderLineDetails
                                key={l.identifier}
                                line={l}
                                productId={productId}
                                refundedAmount={
                                    refundedLineAmounts[String(l.identifier || '')] || 0
                                }
                            />
                        )
                    )}
                    {orderLevelDiscountAmount > 0 && (
                        <View style={styles.row}>
                            <Text
                                style={[
                                    styles.secondaryText,
                                    { flex: 5, textAlign: 'right' },
                                ]}
                            >
                                {t('EOD_OrderDiscount', 'Order Discount')}
                            </Text>
                            <Text
                                style={[
                                    styles.secondaryText,
                                    styles.textRight,
                                    { flex: 1, color: '#8BC34A' },
                                ]}
                            >
                                - $ {orderLevelDiscountAmount.toFixed(2)}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
}

const local = StyleSheet.create({
    chipsRow: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        alignItems: 'center',
        gap: 6,
        marginTop: 0,
    },
    chip: {
        minWidth: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 9,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#2f374288',
        backgroundColor: '#2f37422a',
    },
    chipValue: {
        fontWeight: '700',
        fontSize: 12,
    },
});

export default OrderDetails;
