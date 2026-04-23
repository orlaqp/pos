import React from 'react';

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSharedStyles } from '@pos/theme/native';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import { OrderLineEntity } from '@pos/orders/data-access';
import { useTheme } from '@rneui/themed';
import { EACH } from '@pos/unit-of-measures/data-access';

export interface CompactOrderItemProps {
    line: OrderLineEntity;
    onToggle: (line: OrderLineEntity, selected: boolean) => void;
    readOnly?: boolean;
    selected?: boolean;
    compact?: boolean;
    testIDPrefix?: string;
}

export function OrderVoidableItem({
    line,
    onToggle,
    readOnly = false,
    selected = false,
    compact = false,
    testIDPrefix = 'order-void-line',
}: CompactOrderItemProps) {
    const theme = useTheme();
    const styles = useSharedStyles();
    const tokens = useDesignTokens();
    const local = useStyles(tokens);

    const toggleSelection = () => {
        if (readOnly) return;
        onToggle(line, !selected);
    };
    const displayAmount = (
        (line.basePrice ?? line.price) * line.quantity
    ).toFixed(2);

    return (
        <TouchableOpacity
            testID={`${testIDPrefix}-${line.identifier}`}
            style={[
                styles.dataRow,
                local.container,
                compact && local.compactContainer,
                readOnly && local.readOnlyContainer,
                selected && {
                    backgroundColor: `${theme.theme.colors.error}33`,
                    borderColor: `${theme.theme.colors.error}aa`,
                },
            ]}
            onPress={toggleSelection}
            disabled={readOnly}
            activeOpacity={0.85}
        >
            <View style={local.mainColumn}>
                <Text
                    style={[
                        styles.name,
                        local.centeredText,
                        compact && local.compactText,
                        readOnly && local.readOnlyText,
                    ]}
                >
                    {line.productName}
                </Text>
            </View>
            <View style={local.qtyColumn}>
                <Text
                    style={[
                        styles.name,
                        local.centeredText,
                        compact && local.compactText,
                        readOnly && local.readOnlyText,
                    ]}
                >
                    {line.quantity % 1 === 0 ? line.quantity.toString() : line.quantity.toFixed(2)}{' '}
                    {line.unitOfMeasure === EACH ? '' : line.unitOfMeasure}
                </Text>
            </View>
            <View style={local.priceColumn}>
                <Text
                    style={[
                        styles.name,
                        styles.textRight,
                        local.centeredText,
                        compact && local.compactText,
                        readOnly && local.readOnlyText,
                    ]}
                >
                    {displayAmount}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

export default OrderVoidableItem;

const useStyles = (tokens: ReturnType<typeof useDesignTokens>) =>
    StyleSheet.create({
        container: {
            borderRadius: tokens.radii.lg,
            borderWidth: 1,
            borderColor: tokens.colors.border,
            marginBottom: tokens.spacing.sm,
            minHeight: 76,
            paddingVertical: tokens.spacing.sm,
            paddingHorizontal: tokens.spacing.sm,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: tokens.colors.surface,
        },
        compactContainer: {
            minHeight: 52,
            paddingVertical: tokens.spacing.xs,
        },
        mainColumn: {
            flex: 3,
            justifyContent: 'center',
        },
        qtyColumn: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'flex-start',
        },
        priceColumn: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'flex-end',
        },
        centeredText: {
            marginBottom: 0,
            lineHeight: 24,
            textAlignVertical: 'center',
        },
        compactText: {
            fontSize: 15,
            lineHeight: 20,
        },
        readOnlyContainer: {
            backgroundColor: '#0D131A',
            borderStyle: 'dashed',
            borderColor: `${tokens.colors.border}88`,
            opacity: 0.68,
        },
        readOnlyText: {
            color: tokens.colors.textMuted,
        },
    });
