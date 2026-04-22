import React from 'react';
import { ScrollView, Text, View } from 'react-native';

import type {
    OrderSummaryViewModel,
    SummaryDiscountBreakdownItem,
} from './cart.logic';
import type { CartStyles } from './cart.styles';

interface OrderSummaryPanelProps {
    styles: CartStyles;
    orderSummary: OrderSummaryViewModel;
    discountBreakdown: SummaryDiscountBreakdownItem[];
    title?: string;
    hint?: string;
    footer?: React.ReactNode;
    scrollStyle?: object;
    scrollContentStyle?: object;
    contentTestID?: string;
}

export function OrderSummaryPanel({
    styles,
    orderSummary,
    discountBreakdown,
    title = 'Order summary',
    hint = 'Review the order with the customer before printing.',
    footer,
    scrollStyle,
    scrollContentStyle,
    contentTestID,
}: OrderSummaryPanelProps) {
    return (
        <View style={styles.summarySurface} testID={contentTestID}>
            <Text style={styles.dialogTitle}>{title}</Text>
            <Text style={styles.dialogHint}>{hint}</Text>
            <ScrollView
                style={[styles.summaryDialogScroll, scrollStyle]}
                contentContainerStyle={[
                    styles.summaryDialogContent,
                    scrollContentStyle,
                ]}
            >
                <View style={styles.summarySection}>
                    <Text style={styles.summarySectionTitle}>Items</Text>
                    {orderSummary.lines.map((line) => (
                        <View key={line.id} style={styles.summaryItemRow}>
                            <View style={styles.summaryItemMain}>
                                <Text style={styles.summaryItemName}>{line.name}</Text>
                                <Text style={styles.summaryItemMeta}>
                                    ${line.unitPrice.toFixed(2)} x {line.quantity} {line.unitLabel}
                                </Text>
                                {line.discounts.map((discount) => (
                                    <Text
                                        key={discount.discountApplicationId}
                                        style={styles.summaryDiscountLine}
                                    >
                                        {discount.name}: -${discount.discountAmount.toFixed(2)}
                                    </Text>
                                ))}
                            </View>
                            <View style={styles.summaryItemTotals}>
                                {line.savings > 0 ? (
                                    <Text style={styles.summaryItemOriginal}>
                                        ${line.originalTotal.toFixed(2)}
                                    </Text>
                                ) : null}
                                <Text style={styles.summaryItemFinal}>
                                    ${line.finalTotal.toFixed(2)}
                                </Text>
                                {line.savings > 0 ? (
                                    <Text style={styles.summaryItemSavings}>
                                        Saved ${line.savings.toFixed(2)}
                                    </Text>
                                ) : null}
                            </View>
                        </View>
                    ))}
                </View>

                {(orderSummary.discountTotal > 0 ||
                    orderSummary.promoCodes.length > 0 ||
                    orderSummary.warnings.length > 0) && (
                    <View style={styles.summarySection}>
                        <Text style={styles.summarySectionTitle}>Savings</Text>
                        {orderSummary.discountTotal > 0 ? (
                            <Text style={styles.summaryValue}>
                                Saved ${orderSummary.savingsTotal.toFixed(2)}
                            </Text>
                        ) : null}
                        {discountBreakdown.length > 1 ? (
                            <Text style={styles.actionMutedCopy}>
                                {discountBreakdown.length} discounts applied
                            </Text>
                        ) : null}
                        {discountBreakdown.map((adjustment) => (
                            <Text
                                key={adjustment.discountApplicationId}
                                style={styles.summaryLine}
                            >
                                {adjustment.scope === 'LINE' ? 'Line' : 'Order'} ·{' '}
                                {adjustment.name}: -${adjustment.discountAmount.toFixed(2)}
                            </Text>
                        ))}
                        {orderSummary.promoCodes.length ? (
                            <View style={styles.promoChipRow}>
                                {orderSummary.promoCodes.map((code) => (
                                    <View key={code} style={styles.promoChipStatic}>
                                        <Text style={styles.promoChipText}>{code}</Text>
                                    </View>
                                ))}
                            </View>
                        ) : null}
                        {orderSummary.warnings.map((warning) => (
                            <Text key={warning} style={styles.warningInline}>
                                {warning}
                            </Text>
                        ))}
                    </View>
                )}

                <View style={styles.summarySection}>
                    <Text style={styles.summarySectionTitle}>Totals</Text>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Subtotal</Text>
                        <Text style={styles.totalValue}>
                            ${orderSummary.subtotal.toFixed(2)}
                        </Text>
                    </View>
                    {orderSummary.discountTotal > 0 ? (
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Discounts</Text>
                            <Text style={styles.totalValueSuccess}>
                                -${orderSummary.discountTotal.toFixed(2)}
                            </Text>
                        </View>
                    ) : null}
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Tax</Text>
                        <Text style={styles.totalValue}>
                            ${orderSummary.tax.toFixed(2)}
                        </Text>
                    </View>
                    {orderSummary.ebtEligibleTotal > 0 ? (
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>EBT eligible</Text>
                            <Text style={styles.totalValue}>
                                ${orderSummary.ebtEligibleTotal.toFixed(2)}
                            </Text>
                        </View>
                    ) : null}
                    <View style={[styles.totalRow, styles.totalRowStrong]}>
                        <Text style={styles.totalLabelStrong}>Total</Text>
                        <Text style={styles.totalValueStrong}>
                            ${orderSummary.total.toFixed(2)}
                        </Text>
                    </View>
                </View>
            </ScrollView>
            {footer}
        </View>
    );
}

export default OrderSummaryPanel;
