import { AppliedDiscountDetail } from '@pos/discounts/domain';
import { CartItem } from '@pos/sales/data-access';
import { UIEbtRibbon } from '@pos/shared/ui-native';
import { useSharedStyles } from '@pos/theme/native';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import { Button, useTheme } from '@rneui/themed';
import React from 'react';

import { View, Text, Alert, StyleSheet, Pressable } from 'react-native';
import { EACH } from '@pos/unit-of-measures/data-access';

/* eslint-disable-next-line */
export interface CartLineProps {
    item: CartItem;
    selected?: boolean;
    appliedDiscounts?: AppliedDiscountDetail[];
    lineDiscountTotal?: number;
    lineTotal?: number;
    onOpenDetails: (item: CartItem) => void;
    onSelect: (item: CartItem) => void;
    onRemove: (item: CartItem) => void;
    onIncrement?: (item: CartItem) => void;
    onDecrement?: (item: CartItem) => void;
}

export function CartLine({
    item,
    selected = false,
    appliedDiscounts = [],
    lineDiscountTotal = 0,
    lineTotal,
    onOpenDetails,
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
        <Pressable
            style={[
                localStyles.container,
                selected && localStyles.containerSelected,
                requiresWeight && localStyles.containerError,
            ]}
            onPress={() => onOpenDetails(item)}
            onLongPress={() => onSelect(item)}
        >
            {selected && !requiresWeight ? (
                <View style={localStyles.selectedAccent} />
            ) : null}
            {requiresWeight ? <View style={localStyles.errorAccent} /> : null}
            <View style={localStyles.mainWrap}>
                <View style={localStyles.content}>
                    <Text
                        style={localStyles.nameText}
                        numberOfLines={2}
                    >
                        {item.product.name}
                    </Text>
                    {requiresWeight ? (
                        <View style={localStyles.statusBadge}>
                            <Text style={localStyles.statusBadgeText}>Needs weight</Text>
                        </View>
                    ) : null}
                    {!requiresWeight && appliedDiscounts.length ? (
                        <View style={localStyles.badgesRow}>
                            {appliedDiscounts.map((discount) => (
                                <View key={discount.discountApplicationId} style={localStyles.discountBadge}>
                                    <Text
                                        style={localStyles.discountBadgeText}
                                        numberOfLines={2}
                                    >
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
                            numberOfLines={1}
                        >
                            ${item.product.price.toFixed(2)} x {quantityLabel}
                        </Text>
                    </View>
                </View>
                <View style={localStyles.asideColumn}>
                    <View style={localStyles.controlsRow}>
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
                    </View>
                    <View style={localStyles.valueColumn}>
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
                    </View>
                </View>
            </View>
            {item.product.isEBTEligible && <UIEbtRibbon />}
        </Pressable>
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
        mainWrap: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'flex-start',
            minWidth: 0,
        },
        containerSelected: {
            backgroundColor: `${tokens.colors.accent}24`,
            borderColor: `${tokens.colors.accent}cc`,
            borderWidth: 2,
            shadowColor: tokens.colors.accent,
            shadowOpacity: 0.2,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 4 },
        },
        containerError: {
            borderColor: `${dangerColor}cc`,
            backgroundColor: `${dangerColor}14`,
        },
        selectedAccent: {
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 6,
            backgroundColor: tokens.colors.accent,
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
            minWidth: 0,
            paddingRight: tokens.spacing.sm,
        },
        nameText: {
            color: tokens.colors.textPrimary,
            fontSize: 16,
            fontWeight: '700',
            lineHeight: 20,
        },
        asideColumn: {
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginLeft: tokens.spacing.sm,
            minWidth: 118,
        },
        valueColumn: {
            alignItems: 'flex-end',
            justifyContent: 'center',
            minWidth: 118,
            marginTop: tokens.spacing.xs,
        },
        controlsRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-end',
        },
        stepperWrap: {
            flexDirection: 'row',
            alignItems: 'center',
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
            borderRadius: 14,
            backgroundColor: `${tokens.colors.accent}22`,
            borderWidth: 1,
            borderColor: `${tokens.colors.accent}44`,
            paddingHorizontal: tokens.spacing.xs,
            paddingVertical: 3,
            maxWidth: '100%',
        },
        discountBadgeText: {
            color: tokens.colors.accent,
            fontSize: 11,
            fontWeight: '800',
            lineHeight: 14,
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
            justifyContent: 'flex-end',
            flexWrap: 'wrap',
            columnGap: tokens.spacing.xs,
            marginTop: 3,
        },
        totalText: {
            fontSize: 18,
            fontWeight: '800',
            textAlign: 'right',
        },
        originalTotalText: {
            color: tokens.colors.textSecondary,
            fontSize: 13,
            textDecorationLine: 'line-through',
            textAlign: 'right',
        },
        totalTextError: {
            color: dangerColor,
        },
        savedText: {
            color: tokens.colors.success,
            fontSize: 12,
            fontWeight: '700',
            marginTop: tokens.spacing.xs,
            textAlign: 'right',
        },
    });

export default CartLine;
