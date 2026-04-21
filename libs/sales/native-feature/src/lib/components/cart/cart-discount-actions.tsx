import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { UICard } from '@pos/shared/ui-native';
import { CartStyles } from './cart.styles';

interface CartDiscountActionsProps {
    styles: CartStyles;
    selectedItemName?: string;
    discountsLoading: boolean;
    actionsExpanded: boolean;
    sectionCollapsed: boolean;
    hasDiscountSummary: boolean;
    savingsTotal: number;
    discountBreakdown: Array<{
        discountApplicationId: string;
        name: string;
        discountAmount: number;
        scope: 'LINE' | 'ORDER';
    }>;
    promoCodes: Array<{ code: string }>;
    pricingWarnings: string[];
    discountError?: string;
    disabledActionReason?: string | null;
    selectedLineHasManualAdjustment: boolean;
    hasOrderManualAdjustment: boolean;
    onToggleSectionCollapsed: () => void;
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
    sectionCollapsed,
    hasDiscountSummary,
    savingsTotal,
    discountBreakdown,
    promoCodes,
    pricingWarnings,
    discountError,
    disabledActionReason,
    selectedLineHasManualAdjustment,
    hasOrderManualAdjustment,
    onToggleSectionCollapsed,
    onToggleExpanded,
    onOpenPromo,
    onOpenManual,
    onOpenOverride,
    onRemovePromo,
    onClearLinePricing,
    onClearOrderDiscount,
}: CartDiscountActionsProps) {
    const showClearActions = selectedLineHasManualAdjustment || hasOrderManualAdjustment;

    return (
        <UICard style={styles.discountActionCard}>
            <View style={styles.discountActionHeader}>
                <View style={styles.discountHeaderMain}>
                    <Pressable
                        testID="cart-discounts-collapse-toggle"
                        style={styles.discountCollapseButton}
                        onPress={onToggleSectionCollapsed}
                    >
                        <Text style={styles.discountCollapseButtonText}>
                            {sectionCollapsed ? '▸' : '▾'}
                        </Text>
                    </Pressable>
                    <View style={styles.discountHeaderContent}>
                        <Text style={styles.discountActionTitle}>Discounts</Text>
                        {!sectionCollapsed ? (
                            <Text style={styles.discountActionHint}>
                                {selectedItemName
                                    ? `Selected: ${selectedItemName}`
                                    : 'Select a line for line-level actions.'}
                            </Text>
                        ) : null}
                    </View>
                </View>
                <View style={styles.discountHeaderMeta}>
                    {discountsLoading ? (
                        <Text style={styles.discountActionStatus}>Loading rules…</Text>
                    ) : null}
                    {!sectionCollapsed ? (
                        <Pressable style={styles.expandButton} onPress={onToggleExpanded}>
                            <Text style={styles.expandButtonText}>
                                {actionsExpanded ? 'Hide actions' : 'Show actions'}
                            </Text>
                        </Pressable>
                    ) : hasDiscountSummary ? (
                        <Text style={styles.discountCollapsedSummary}>
                            Saved ${savingsTotal.toFixed(2)}
                        </Text>
                    ) : null}
                </View>
            </View>

            {sectionCollapsed ? null : (
                <>
                    {hasDiscountSummary ? (
                        <>
                            <Text style={styles.summaryValue}>Saved ${savingsTotal.toFixed(2)}</Text>
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
                                    {adjustment.scope === 'LINE' ? 'Line' : 'Order'} · {adjustment.name}:{' '}
                                    -${adjustment.discountAmount.toFixed(2)}
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
                    {discountError ? (
                        <Text style={styles.warningInline}>{discountError}</Text>
                    ) : null}
                    {disabledActionReason ? (
                        <Text style={styles.actionMutedCopy}>{disabledActionReason}</Text>
                    ) : null}
                    {pricingWarnings.map((warning) => (
                        <Text key={warning} style={styles.warningInline}>
                            {warning}
                        </Text>
                    ))}
                    {showClearActions ? (
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
                    {actionsExpanded ? (
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
                    ) : null}
                </>
            )}
        </UICard>
    );
}
