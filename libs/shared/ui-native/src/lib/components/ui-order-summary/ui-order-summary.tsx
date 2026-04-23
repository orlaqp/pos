import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useDesignTokens } from '@pos/theme/native/design-tokens';

export interface UIOrderSummaryDiscount {
    discountApplicationId: string;
    name: string;
    discountAmount: number;
}

export interface UIOrderSummaryLine {
    id: string;
    name: string;
    quantity: number;
    unitLabel: string;
    unitPrice: number;
    originalTotal: number;
    finalTotal: number;
    savings: number;
    discounts: UIOrderSummaryDiscount[];
}

export interface UIOrderSummaryDiscountBreakdownItem {
    discountApplicationId: string;
    name: string;
    discountAmount: number;
    scope: 'LINE' | 'ORDER';
}

export interface UIOrderSummaryViewModel {
    lines: UIOrderSummaryLine[];
    promoCodes: string[];
    warnings: string[];
    subtotal: number;
    discountTotal: number;
    tax: number;
    total: number;
    savingsTotal: number;
    ebtEligibleTotal: number;
}

interface UIOrderSummaryPanelProps {
    orderSummary: UIOrderSummaryViewModel;
    discountBreakdown: UIOrderSummaryDiscountBreakdownItem[];
    title?: string;
    hint?: string;
    footer?: React.ReactNode;
    scrollStyle?: object;
    scrollContentStyle?: object;
    contentTestID?: string;
    plain?: boolean;
}

export function UIOrderSummaryPanel({
    orderSummary,
    discountBreakdown,
    title = 'Order summary',
    hint = 'Review the order with the customer before printing.',
    footer,
    scrollStyle,
    scrollContentStyle,
    contentTestID,
    plain = false,
}: UIOrderSummaryPanelProps) {
    const tokens = useDesignTokens();
    const styles = useStyles(tokens);

    return (
        <View
            style={[styles.summarySurface, plain && styles.summarySurfacePlain]}
            testID={contentTestID}
        >
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
                                <Text style={styles.summaryItemName}>
                                    {line.name}
                                </Text>
                                <Text style={styles.summaryItemMeta}>
                                    ${line.unitPrice.toFixed(2)} x{' '}
                                    {line.quantity} {line.unitLabel}
                                </Text>
                                {line.discounts.map((discount) => (
                                    <Text
                                        key={discount.discountApplicationId}
                                        style={styles.summaryDiscountLine}
                                    >
                                        {discount.name}: -$
                                        {discount.discountAmount.toFixed(2)}
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
                                {adjustment.scope === 'LINE' ? 'Line' : 'Order'}{' '}
                                · {adjustment.name}: -$
                                {adjustment.discountAmount.toFixed(2)}
                            </Text>
                        ))}
                        {orderSummary.promoCodes.length ? (
                            <View style={styles.promoChipRow}>
                                {orderSummary.promoCodes.map((code) => (
                                    <View
                                        key={code}
                                        style={styles.promoChipStatic}
                                    >
                                        <Text style={styles.promoChipText}>
                                            {code}
                                        </Text>
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

const useStyles = (tokens: ReturnType<typeof useDesignTokens>) =>
    StyleSheet.create({
        summarySurface: {
            flex: 1,
            borderRadius: tokens.radii.lg,
            borderWidth: 1,
            borderColor: tokens.colors.border,
            backgroundColor: tokens.colors.surfaceMuted,
            padding: tokens.spacing.lg,
        },
        summarySurfacePlain: {
            borderWidth: 0,
            padding: 0,
            backgroundColor: 'transparent',
        },
        dialogTitle: {
            color: tokens.colors.textPrimary,
            fontSize: 24,
            fontWeight: '800',
        },
        dialogHint: {
            color: tokens.colors.textSecondary,
            fontSize: 14,
            lineHeight: 20,
            marginTop: tokens.spacing.xs,
            marginBottom: tokens.spacing.md,
        },
        summaryDialogScroll: {
            flex: 1,
        },
        summaryDialogContent: {
            paddingBottom: tokens.spacing.md,
        },
        summarySection: {
            marginBottom: tokens.spacing.md,
            borderRadius: tokens.radii.md,
            borderWidth: 1,
            borderColor: tokens.colors.border,
            backgroundColor: tokens.colors.surface,
            padding: tokens.spacing.md,
        },
        summarySectionTitle: {
            color: tokens.colors.textPrimary,
            fontSize: 16,
            fontWeight: '800',
            marginBottom: tokens.spacing.sm,
        },
        summaryItemRow: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            paddingVertical: tokens.spacing.sm,
            borderTopWidth: 1,
            borderTopColor: tokens.colors.border,
        },
        summaryItemMain: {
            flex: 1,
            paddingRight: tokens.spacing.md,
        },
        summaryItemName: {
            color: tokens.colors.textPrimary,
            fontSize: 15,
            fontWeight: '700',
        },
        summaryItemMeta: {
            color: tokens.colors.textSecondary,
            fontSize: 12,
            marginTop: 4,
        },
        summaryDiscountLine: {
            color: tokens.colors.success,
            fontSize: 12,
            marginTop: 4,
        },
        summaryItemTotals: {
            alignItems: 'flex-end',
        },
        summaryItemOriginal: {
            color: tokens.colors.textSecondary,
            fontSize: 12,
            textDecorationLine: 'line-through',
        },
        summaryItemFinal: {
            color: tokens.colors.textPrimary,
            fontSize: 15,
            fontWeight: '800',
        },
        summaryItemSavings: {
            color: tokens.colors.success,
            fontSize: 12,
            marginTop: 4,
        },
        summaryValue: {
            color: tokens.colors.success,
            fontSize: 18,
            fontWeight: '800',
            marginBottom: tokens.spacing.xs,
        },
        actionMutedCopy: {
            color: tokens.colors.textSecondary,
            fontSize: 12,
            marginBottom: tokens.spacing.xs,
        },
        summaryLine: {
            color: tokens.colors.textSecondary,
            fontSize: 13,
            lineHeight: 18,
        },
        promoChipRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: tokens.spacing.xs,
            marginTop: tokens.spacing.xs,
        },
        promoChipStatic: {
            borderRadius: 999,
            paddingHorizontal: tokens.spacing.xs,
            paddingVertical: 4,
            borderWidth: 1,
            borderColor: `${tokens.colors.accent}55`,
            backgroundColor: `${tokens.colors.accent}14`,
        },
        promoChipText: {
            color: tokens.colors.accent,
            fontSize: 12,
            fontWeight: '700',
        },
        warningInline: {
            color: tokens.colors.warning,
            fontSize: 12,
            fontWeight: '700',
            marginTop: tokens.spacing.xs,
        },
        totalRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: tokens.spacing.xs,
        },
        totalRowStrong: {
            marginTop: tokens.spacing.sm,
            paddingTop: tokens.spacing.sm,
            borderTopWidth: 1,
            borderTopColor: tokens.colors.border,
        },
        totalLabel: {
            color: tokens.colors.textSecondary,
            fontSize: 14,
        },
        totalValue: {
            color: tokens.colors.textPrimary,
            fontSize: 14,
            fontWeight: '700',
        },
        totalValueSuccess: {
            color: tokens.colors.success,
            fontSize: 14,
            fontWeight: '700',
        },
        totalLabelStrong: {
            color: tokens.colors.textPrimary,
            fontSize: 16,
            fontWeight: '800',
        },
        totalValueStrong: {
            color: tokens.colors.textPrimary,
            fontSize: 18,
            fontWeight: '800',
        },
    });

export default UIOrderSummaryPanel;
