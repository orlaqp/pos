import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Button, Dialog } from '@rneui/themed';
import { CartStyles } from './cart.styles';

interface CartOrderSummaryDialogProps {
    visible: boolean;
    styles: CartStyles;
    overlayStyle: object;
    orderSummary: any;
    orderLevelAdjustments: Array<{
        discountApplicationId: string;
        name: string;
        discountAmount: number;
    }>;
    onClose: () => void;
    onConfirm: () => void;
}

export function CartOrderSummaryDialog({
    visible,
    styles,
    overlayStyle,
    orderSummary,
    orderLevelAdjustments,
    onClose,
    onConfirm,
}: CartOrderSummaryDialogProps) {
    return (
        <Dialog
            isVisible={visible}
            onBackdropPress={onClose}
            supportedOrientations={['landscape']}
            presentationStyle="fullScreen"
            overlayStyle={overlayStyle}
        >
            <View style={styles.summarySurface}>
                <Text style={styles.dialogTitle}>Order summary</Text>
                <Text style={styles.dialogHint}>
                    Review the order with the customer before printing.
                </Text>
                <ScrollView
                    style={styles.summaryDialogScroll}
                    contentContainerStyle={styles.summaryDialogContent}
                >
                    <View style={styles.summarySection}>
                        <Text style={styles.summarySectionTitle}>Items</Text>
                        {orderSummary.lines.map((line: any) => (
                            <View key={line.id} style={styles.summaryItemRow}>
                                <View style={styles.summaryItemMain}>
                                    <Text style={styles.summaryItemName}>{line.name}</Text>
                                    <Text style={styles.summaryItemMeta}>
                                        ${line.unitPrice.toFixed(2)} x {line.quantity} {line.unitLabel}
                                    </Text>
                                    {line.discounts.map((discount: any) => (
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
                            {orderLevelAdjustments.map((adjustment) => (
                                <Text
                                    key={adjustment.discountApplicationId}
                                    style={styles.summaryLine}
                                >
                                    {adjustment.name}: -${adjustment.discountAmount.toFixed(2)}
                                </Text>
                            ))}
                            {orderSummary.promoCodes.length ? (
                                <View style={styles.promoChipRow}>
                                    {orderSummary.promoCodes.map((code: string) => (
                                        <View key={code} style={styles.promoChipStatic}>
                                            <Text style={styles.promoChipText}>{code}</Text>
                                        </View>
                                    ))}
                                </View>
                            ) : null}
                            {orderSummary.warnings.map((warning: string) => (
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
                <View style={styles.summaryFooter}>
                    <View style={styles.summaryFooterTotalBlock}>
                        <Text style={styles.summaryFooterLabel}>Total</Text>
                        <Text style={styles.summaryFooterValue}>
                            ${orderSummary.total.toFixed(2)}
                        </Text>
                    </View>
                    <View style={styles.summaryFooterActions}>
                        <Button
                            type="clear"
                            title="Back to cart"
                            onPress={onClose}
                            buttonStyle={styles.summarySecondaryButton}
                            titleStyle={styles.summarySecondaryButtonTitle}
                        />
                        <Button
                            testID="order-summary-print-button"
                            onPress={onConfirm}
                            icon={{
                                name: 'printer',
                                type: 'material-community',
                                color: '#ffffff',
                                size: 22,
                            }}
                            buttonStyle={styles.summaryPrimaryIconButton}
                        />
                    </View>
                </View>
            </View>
        </Dialog>
    );
}
