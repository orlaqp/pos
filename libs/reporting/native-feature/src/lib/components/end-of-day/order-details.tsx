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
        <View style={[styles.box, styles.column, local.detailCard]}>
            <View style={[styles.row, local.headerRow]}>
                <View style={[styles.column, local.orderNoColumn]}>
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
                <View style={[styles.column, local.metaColumn]}>
                    <Text style={[styles.secondaryText, local.metaLabel]}>
                        {t('EOD_CreatedBy', 'Created By')}
                    </Text>
                    <Text style={[styles.primaryText, local.metaValue]}>{createdByName}</Text>
                </View>
                <View style={[styles.column, styles.centered, local.arrowColumn]}>
                    <Icon name='arrow-right' type='material-community' size={16} />
                </View>
                <View style={[styles.column, local.metaColumn]}>
                    <Text style={[styles.secondaryText, local.metaLabel]}>
                        {t('EOD_ClosedBy', 'Closed By')}
                    </Text>
                    <Text style={[styles.primaryText, local.metaValue]}>
                        {order.paymentInfo?.employeeName}
                    </Text>
                </View>
                <View style={local.headerSpacer} />
                <View style={[styles.column, local.collectedSalesColumn]}>
                    <Text style={[styles.secondaryText, styles.textRight, local.metaLabel]}>
                        {t('EOD_NetSales', 'Collected Sales')}
                    </Text>
                    <Text
                        style={[
                            styles.primaryText,
                            styles.textBold,
                            styles.textRight,
                            local.collectedSalesValue,
                        ]}
                    >
                        $ {netSales.toFixed(2)}
                    </Text>
                </View>
            </View>

            <View style={[styles.row, local.summaryRow]}>
                <View style={local.summaryRail}>
                    <View style={local.summaryMetricsRow}>
                        <View style={[local.summaryMetricCard, local.discountMetricCard]}>
                            <Text
                                numberOfLines={1}
                                style={[styles.secondaryText, local.summaryMetricLabel]}
                            >
                        {t('EOD_Discounts', 'Discounts')}
                    </Text>
                            <Text style={[styles.primaryText, local.summaryMetricValue]}>
                                $ {discountAmount.toFixed(2)}
                            </Text>
                        </View>
                        <View style={[local.summaryMetricCard, local.refundMetricCard]}>
                            <Text
                                numberOfLines={1}
                                style={[styles.secondaryText, local.summaryMetricLabel]}
                            >
                        {t('EOD_Refunds', 'Refunds')}
                    </Text>
                            <Text style={[styles.primaryText, local.summaryMetricValue]}>
                                $ {refundedAmount.toFixed(2)}
                            </Text>
                        </View>
                    </View>
                    <View style={local.paymentsPanel}>
                        <Text style={[styles.secondaryText, local.summaryMetricLabel]}>
                        {t('EOD_Payments', 'Payments')}
                    </Text>
                        <View style={local.paymentRows}>
                    {resolvedPaymentDetails.map((payment, index) => (
                        <Text
                            key={`${payment.kind}-${payment.type}-${index}`}
                                    style={[styles.primaryText, local.paymentRow]}
                        >
                            {payment.kind === 'refund'
                                ? `${t('EOD_RefundPayment', 'Refund')} ${payment.type}: -$${payment.amount.toFixed(2)}`
                                : `${payment.type}: $${payment.amount.toFixed(2)}`}
                        </Text>
                    ))}
                        </View>
                    </View>
                </View>
                <View style={[styles.box, local.itemBox]}>
                    <View style={[styles.row, local.itemHeaderRow]}>
                        <Text style={[styles.secondaryText, styles.textRight, local.qtyHeader]}>
                            {t('EOD_Quantity', 'Quantity')}
                        </Text>
                        <Text style={[styles.secondaryText, local.nameHeader]}>
                            {t('EOD_Name', 'Name')}
                        </Text>
                        <Text style={[styles.secondaryText, styles.textRight, local.moneyHeader]}>
                            {t('EOD_Price', 'Price')}
                        </Text>
                        <Text style={[styles.secondaryText, styles.textRight, local.moneyHeader]}>
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
                        <View style={[styles.row, local.adjustmentRow]}>
                            <Text
                                style={[
                                    styles.secondaryText,
                                    local.adjustmentLabel,
                                ]}
                            >
                                {t('EOD_OrderDiscount', 'Order Discount')}
                            </Text>
                            <Text
                                style={[
                                    styles.secondaryText,
                                    styles.textRight,
                                    local.adjustmentValue,
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
    detailCard: {
        borderRadius: 24,
        borderColor: '#C7D0DB22',
        backgroundColor: '#080B10',
        paddingHorizontal: 18,
        paddingVertical: 16,
        marginBottom: 14,
    },
    headerRow: {
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    orderNoColumn: {
        flex: 2.05,
        marginRight: 24,
        justifyContent: 'flex-start',
        paddingTop: 1,
    },
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
        paddingHorizontal: 9,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#30445d',
        backgroundColor: '#0D1520',
    },
    chipValue: {
        color: '#B8C8DB',
        fontWeight: '800',
        fontSize: 11,
        letterSpacing: 0.8,
    },
    metaColumn: {
        flex: 1.1,
        marginRight: 22,
    },
    metaLabel: {
        fontSize: 11,
        marginBottom: 2,
    },
    metaValue: {
        fontSize: 13,
        lineHeight: 17,
    },
    arrowColumn: {
        flex: 0.12,
        marginRight: 14,
        paddingTop: 10,
    },
    headerSpacer: {
        flex: 0.15,
    },
    collectedSalesColumn: {
        minWidth: 110,
        alignItems: 'flex-end',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 14,
        backgroundColor: '#121926',
        borderWidth: 1,
        borderColor: '#30445d',
    },
    collectedSalesValue: {
        color: '#34C759',
        fontSize: 16,
        lineHeight: 20,
    },
    summaryRow: {
        marginRight: 26,
        marginTop: 4,
        alignItems: 'stretch',
    },
    summaryRail: {
        flex: 2,
        marginRight: 22,
    },
    summaryMetricsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    summaryMetricCard: {
        flex: 1,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 16,
        backgroundColor: '#101722',
        borderWidth: 1,
        borderColor: '#243145',
    },
    discountMetricCard: {
        backgroundColor: '#2A2114',
        borderColor: '#7A541C',
    },
    refundMetricCard: {
        backgroundColor: '#241733',
        borderColor: '#6F3FA0',
    },
    summaryMetricLabel: {
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.35,
        marginBottom: 3,
    },
    summaryMetricValue: {
        fontSize: 13,
        lineHeight: 16,
    },
    paymentsPanel: {
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 16,
        backgroundColor: '#0D1520',
        borderWidth: 1,
        borderColor: '#243145',
    },
    paymentRows: {
        marginTop: 4,
        gap: 4,
    },
    paymentRow: {
        fontSize: 14,
    },
    itemBox: {
        flex: 6,
        borderRadius: 18,
        borderColor: '#243145',
        backgroundColor: '#0B1018',
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 12,
    },
    itemHeaderRow: {
        borderRadius: 14,
        paddingHorizontal: 8,
        paddingVertical: 10,
        marginBottom: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#2D3C52',
        backgroundColor: '#101722',
    },
    qtyHeader: {
        flex: 1,
        marginRight: 30,
    },
    nameHeader: {
        flex: 3,
    },
    moneyHeader: {
        flex: 1,
    },
    adjustmentRow: {
        marginTop: 2,
        paddingTop: 2,
    },
    adjustmentLabel: {
        flex: 5,
        textAlign: 'right',
        paddingRight: 14,
        fontSize: 12,
        color: '#8f9aab',
    },
    adjustmentValue: {
        flex: 1,
        color: '#8BC34A',
        fontSize: 12,
        fontWeight: '800',
    },
});

export default OrderDetails;
