import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { UICard } from '@pos/shared/ui-native';
import { CartStyles } from './cart.styles';

interface CartDiscountActionsProps {
    styles: CartStyles;
    selectedItemName?: string;
    discountsLoading: boolean;
    actionsExpanded: boolean;
    hasDiscountSummary: boolean;
    savingsTotal: number;
    orderLevelAdjustments: Array<{
        discountApplicationId: string;
        name: string;
        discountAmount: number;
    }>;
    promoCodes: Array<{ code: string }>;
    pricingWarnings: string[];
    discountError?: string;
    disabledActionReason?: string | null;
    selectedLineHasManualAdjustment: boolean;
    hasOrderManualAdjustment: boolean;
    onToggleExpanded: () => void;
    onOpenPromo: () => void;
    onOpenManual: () => void;
    onOpenOverride: () => void;
    onRemovePromo: (code: string) => void;
    onClearLinePricing: () => void;
    onClearOrderDiscount: () => void;
}

export function CartDiscountActions({
    styles,
    selectedItemName,
    discountsLoading,
    actionsExpanded,
    hasDiscountSummary,
    savingsTotal,
    orderLevelAdjustments,
    promoCodes,
    pricingWarnings,
    discountError,
    disabledActionReason,
    selectedLineHasManualAdjustment,
    hasOrderManualAdjustment,
    onToggleExpanded,
    onOpenPromo,
    onOpenManual,
    onOpenOverride,
    onRemovePromo,
    onClearLinePricing,
    onClearOrderDiscount,
}: CartDiscountActionsProps) {
    return (
        <UICard style={styles.discountActionCard}>
            <View style={styles.discountActionHeader}>
                <View style={styles.discountHeaderContent}>
                    <Text style={styles.discountActionTitle}>Discounts</Text>
                    <Text style={styles.discountActionHint}>
                        {selectedItemName
                            ? `Selected: ${selectedItemName}`
                            : 'Select a line for line-level actions.'}
                    </Text>
                </View>
                <View style={styles.discountHeaderMeta}>
                    {discountsLoading ? (
                        <Text style={styles.discountActionStatus}>Loading rules…</Text>
                    ) : null}
                    <Pressable style={styles.expandButton} onPress={onToggleExpanded}>
                        <Text style={styles.expandButtonText}>
                            {actionsExpanded ? 'Hide actions' : 'Show actions'}
                        </Text>
                    </Pressable>
                </View>
            </View>
            {hasDiscountSummary ? (
                <>
                    <Text style={styles.summaryValue}>Saved ${savingsTotal.toFixed(2)}</Text>
                    {orderLevelAdjustments.map((adjustment) => (
                        <Text
                            key={adjustment.discountApplicationId}
                            style={styles.summaryLine}
                        >
                            {adjustment.name}: -${adjustment.discountAmount.toFixed(2)}
                        </Text>
                    ))}
                    {promoCodes.length ? (
                        <View style={styles.promoChipRow}>
                            {promoCodes.map((promo) => (
                                <Pressable
                                    key={promo.code}
                                    style={styles.promoChip}
                                    onPress={() => onRemovePromo(promo.code)}
                                >
                                    <Text style={styles.promoChipText}>{promo.code} ×</Text>
                                </Pressable>
                            ))}
                        </View>
                    ) : null}
                </>
            ) : null}
            {discountError ? <Text style={styles.warningInline}>{discountError}</Text> : null}
            {disabledActionReason ? (
                <Text style={styles.actionMutedCopy}>{disabledActionReason}</Text>
            ) : null}
            {pricingWarnings.map((warning) => (
                <Text key={warning} style={styles.warningInline}>
                    {warning}
                </Text>
            ))}
            {actionsExpanded ? (
                <>
                    <View style={styles.discountActionRow}>
                        <Pressable
                            style={[styles.discountActionButton, styles.discountActionButtonPromo]}
                            onPress={onOpenPromo}
                            disabled={discountsLoading}
                        >
                            <Text style={styles.discountActionButtonEyebrow}>CODE</Text>
                            <Text style={styles.discountActionButtonText}>Promo</Text>
                        </Pressable>
                        <Pressable
                            style={[styles.discountActionButton, styles.discountActionButtonManual]}
                            onPress={onOpenManual}
                            disabled={discountsLoading}
                        >
                            <Text style={styles.discountActionButtonEyebrow}>ONE-TIME</Text>
                            <Text style={styles.discountActionButtonText}>Manual</Text>
                        </Pressable>
                        <Pressable
                            style={[styles.discountActionButton, styles.discountActionButtonOverride]}
                            onPress={onOpenOverride}
                            disabled={discountsLoading}
                        >
                            <Text style={styles.discountActionButtonEyebrow}>PRICE</Text>
                            <Text style={styles.discountActionButtonText}>Override</Text>
                        </Pressable>
                    </View>
                    {selectedLineHasManualAdjustment || hasOrderManualAdjustment ? (
                        <View style={styles.discountActionRow}>
                            {selectedLineHasManualAdjustment ? (
                                <Pressable
                                    style={styles.discountSecondaryButton}
                                    onPress={onClearLinePricing}
                                >
                                    <Text style={styles.discountSecondaryButtonText}>
                                        Clear line pricing
                                    </Text>
                                </Pressable>
                            ) : null}
                            {hasOrderManualAdjustment ? (
                                <Pressable
                                    style={styles.discountSecondaryButton}
                                    onPress={onClearOrderDiscount}
                                >
                                    <Text style={styles.discountSecondaryButtonText}>
                                        Clear order discount
                                    </Text>
                                </Pressable>
                            ) : null}
                        </View>
                    ) : null}
                </>
            ) : null}
        </UICard>
    );
}
