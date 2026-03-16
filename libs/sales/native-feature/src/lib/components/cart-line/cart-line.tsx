import { AppliedDiscountDetail } from '@pos/discounts/domain';
import { CartItem } from '@pos/sales/data-access';
import { UIEbtRibbon } from '@pos/shared/ui-native';
import { useSharedStyles } from '@pos/theme/native';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import { Button, useTheme } from '@rneui/themed';
import React from 'react';

import { View, Text, TouchableOpacity, Alert, StyleSheet, Pressable } from 'react-native';
import { EACH } from '@pos/unit-of-measures/data-access';

/* eslint-disable-next-line */
export interface CartLineProps {
    item: CartItem;
    appliedDiscounts?: AppliedDiscountDetail[];
    lineDiscountTotal?: number;
    lineTotal?: number;
    onSelect: (item: CartItem) => void;
    onRemove: (item: CartItem) => void;
    onIncrement?: (item: CartItem) => void;
    onDecrement?: (item: CartItem) => void;
}

export function CartLine({
    item,
    appliedDiscounts = [],
    lineDiscountTotal = 0,
    lineTotal,
    onRemove,
    onSelect,
    onIncrement,
    onDecrement,
}: CartLineProps) {
    const theme = useTheme();
    const styles = useSharedStyles();
    const tokens = useDesignTokens();
    const localStyles = useStyles(tokens, theme.theme.colors.error);
    const requiresWeight = item.quantity === 0;
    const isEach = item.product.unitOfMeasure?.toLowerCase() === EACH;
    const baseTotal = item.product.price * item.quantity;
    const discountedLine = lineDiscountTotal > 0;
    const displayLineTotal = lineTotal ?? baseTotal;
    const quantityLabel = isEach
        ? `${Math.round(item.quantity)} ${item.product.unitOfMeasure.toLowerCase()}`
        : `${item.quantity.toFixed(2)} ${item.product.unitOfMeasure.toLowerCase()}`;
    
    const confirmDeletion = () => {
        Alert.alert(
            'Are you sure?',
            'You will not be able to undo this operation',
            [
                { text: 'No' },
                { text: 'Yes', onPress: () => onRemove(item) },
            ]
        );
    };


    return (
        <View
            style={[
                localStyles.container,
                requiresWeight && localStyles.containerError,
            ]}
        >
            {requiresWeight ? <View style={localStyles.errorAccent} /> : null}
            <TouchableOpacity
                style={localStyles.content}
                onPress={() => onSelect(item)}
            >
                <Text style={styles.primaryText}>{item.product.name}</Text>
                {requiresWeight ? (
                    <View style={localStyles.statusBadge}>
                        <Text style={localStyles.statusBadgeText}>Needs weight</Text>
                    </View>
                ) : null}
                {!requiresWeight && appliedDiscounts.length ? (
                    <View style={localStyles.badgesRow}>
                        {appliedDiscounts.map((discount) => (
                            <View key={discount.discountApplicationId} style={localStyles.discountBadge}>
                                <Text style={localStyles.discountBadgeText}>
                                    {discount.applicationType === 'PRICE_OVERRIDE'
                                        ? 'Override'
                                        : discount.code || discount.name}
                                </Text>
                            </View>
                        ))}
                    </View>
                ) : null}
                <View style={localStyles.metaRow}>
                    <Text
                        style={[
                            styles.secondaryText,
                            localStyles.metaText,
                            requiresWeight && localStyles.metaTextError,
                        ]}
                    >
                        ${item.product.price.toFixed(2)} x {quantityLabel}
                    </Text>
                </View>
                <View style={localStyles.totalRow}>
                    {discountedLine ? (
                        <Text style={localStyles.originalTotalText}>
                            ${baseTotal.toFixed(2)}
                        </Text>
                    ) : null}
                    <Text
                        style={[
                            styles.primaryText,
                            localStyles.totalText,
                            requiresWeight && localStyles.totalTextError,
                        ]}
                    >
                        ${displayLineTotal.toFixed(2)}
                    </Text>
                </View>
                {!requiresWeight && discountedLine ? (
                    <Text style={localStyles.savedText}>Saved ${lineDiscountTotal.toFixed(2)}</Text>
                ) : null}
            </TouchableOpacity>
            {isEach && !requiresWeight && onIncrement && onDecrement ? (
                <View style={localStyles.stepperWrap}>
                    <Pressable
                        testID="cart-line-decrement"
                        style={localStyles.stepperButtonMuted}
                        onPress={() => onDecrement(item)}
                    >
                        <Text style={localStyles.stepperButtonMutedText}>-</Text>
                    </Pressable>
                    <Text style={localStyles.stepperValue}>{Math.round(item.quantity)}</Text>
                    <Pressable
                        testID="cart-line-increment"
                        style={localStyles.stepperButtonAccent}
                        onPress={() => onIncrement(item)}
                    >
                        <Text style={localStyles.stepperButtonAccentText}>+</Text>
                    </Pressable>
                </View>
            ) : null}
            <Button
                type="clear"
                icon={{
                    name: 'trash-can',
                    type: 'material-community',
                    color: theme.theme.colors.grey2,
                }}
                onPress={confirmDeletion}
            />
            {item.product.isEBTEligible && <UIEbtRibbon />}
        </View>
    );
}

const useStyles = (tokens: ReturnType<typeof useDesignTokens>, dangerColor: string) =>
    StyleSheet.create({
        container: {
            backgroundColor: `${tokens.colors.surfaceMuted}`,
            marginBottom: tokens.spacing.xs,
            paddingHorizontal: tokens.spacing.sm,
            paddingVertical: tokens.spacing.sm,
            borderRadius: tokens.radii.md,
            borderWidth: 1,
            borderColor: tokens.colors.border,
            flexDirection: 'row',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
        },
        containerError: {
            borderColor: `${dangerColor}cc`,
            backgroundColor: `${dangerColor}14`,
        },
        errorAccent: {
            width: 4,
            alignSelf: 'stretch',
            borderRadius: 999,
            backgroundColor: dangerColor,
            marginRight: tokens.spacing.sm,
        },
        content: {
            flex: 1,
            paddingRight: tokens.spacing.xs,
        },
        stepperWrap: {
            flexDirection: 'row',
            alignItems: 'center',
            marginLeft: tokens.spacing.sm,
            marginRight: tokens.spacing.xs,
            gap: tokens.spacing.xs,
            alignSelf: 'center',
        },
        stepperButtonMuted: {
            width: 28,
            height: 28,
            borderRadius: 999,
            backgroundColor: tokens.colors.surface,
            borderWidth: 1,
            borderColor: `${tokens.colors.border}dd`,
            alignItems: 'center',
            justifyContent: 'center',
        },
        stepperButtonAccent: {
            width: 28,
            height: 28,
            borderRadius: 999,
            backgroundColor: tokens.colors.accent,
            alignItems: 'center',
            justifyContent: 'center',
        },
        stepperButtonMutedText: {
            color: tokens.colors.textPrimary,
            fontSize: 18,
            fontWeight: '700',
            lineHeight: 20,
        },
        stepperButtonAccentText: {
            color: '#ffffff',
            fontSize: 18,
            fontWeight: '700',
            lineHeight: 20,
        },
        stepperValue: {
            minWidth: 18,
            textAlign: 'center',
            color: tokens.colors.textPrimary,
            fontSize: 15,
            fontWeight: '800',
        },
        statusBadge: {
            alignSelf: 'flex-start',
            marginTop: tokens.spacing.xs,
            paddingHorizontal: tokens.spacing.xs,
            paddingVertical: 3,
            borderRadius: 999,
            backgroundColor: `${dangerColor}22`,
        },
        statusBadgeText: {
            color: dangerColor,
            fontSize: 11,
            fontWeight: '800',
            letterSpacing: 0.4,
            textTransform: 'uppercase',
        },
        badgesRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginTop: tokens.spacing.xs,
            gap: tokens.spacing.xs,
        },
        discountBadge: {
            borderRadius: 999,
            backgroundColor: `${tokens.colors.accent}22`,
            borderWidth: 1,
            borderColor: `${tokens.colors.accent}44`,
            paddingHorizontal: tokens.spacing.xs,
            paddingVertical: 3,
        },
        discountBadgeText: {
            color: tokens.colors.accent,
            fontSize: 11,
            fontWeight: '800',
        },
        metaRow: {
            marginTop: 4,
        },
        metaText: {
            fontSize: 14,
            fontWeight: '700',
        },
        metaTextError: {
            color: dangerColor,
        },
        totalRow: {
            flexDirection: 'row',
            alignItems: 'baseline',
            flexWrap: 'wrap',
            columnGap: tokens.spacing.xs,
            marginTop: 3,
        },
        totalText: {
            fontSize: 18,
            fontWeight: '800',
        },
        originalTotalText: {
            color: tokens.colors.textSecondary,
            fontSize: 13,
            textDecorationLine: 'line-through',
        },
        totalTextError: {
            color: dangerColor,
        },
        savedText: {
            color: tokens.colors.success,
            fontSize: 12,
            fontWeight: '700',
            marginTop: tokens.spacing.xs,
        },
    });

export default CartLine;
