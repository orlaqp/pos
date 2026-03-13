import React, { useState } from 'react';

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSharedStyles } from '@pos/theme/native';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import { OrderLineEntity } from '@pos/orders/data-access';
import { useTheme } from '@rneui/themed';
import { EACH } from '@pos/unit-of-measures/data-access';

export interface CompactOrderItemProps {
    line: OrderLineEntity;
    onToggle: (line: OrderLineEntity, selected: boolean) => void;
}

export function OrderVoidableItem({ line, onToggle }: CompactOrderItemProps) {
    const theme = useTheme();
    const styles = useSharedStyles();
    const tokens = useDesignTokens();
    const local = useStyles(tokens);
    const [selected, setSelected] = useState<boolean>();

    const toggleSelection = () => {
        const newSelected = !selected;
        setSelected(newSelected);
        onToggle(line, newSelected);
    };

    return (
        <TouchableOpacity
            testID={`order-void-line-${line.identifier}`}
            style={[
                styles.dataRow,
                local.container,
                selected && {
                    backgroundColor: `${theme.theme.colors.error}33`,
                    borderColor: `${theme.theme.colors.error}aa`,
                },
            ]}
            onPress={toggleSelection}
            activeOpacity={0.85}
        >
            <View style={local.mainColumn}>
                <Text style={[styles.name, local.centeredText]}>{line.productName}</Text>
            </View>
            <View style={local.qtyColumn}>
                <Text style={[styles.name, local.centeredText]}>
                    {line.quantity % 1 === 0 ? line.quantity.toString() : line.quantity.toFixed(2)}{' '}
                    {line.unitOfMeasure === EACH ? '' : line.unitOfMeasure}
                </Text>
            </View>
            <View style={local.priceColumn}>
                <Text style={[styles.name, styles.textRight, local.centeredText]}>
                    {(line.price * line.quantity).toFixed(2)}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

export default OrderVoidableItem;

const useStyles = (tokens: ReturnType<typeof useDesignTokens>) =>
    StyleSheet.create({
        container: {
            borderRadius: tokens.radii.md,
            borderWidth: 1,
            borderColor: tokens.colors.border,
            marginBottom: tokens.spacing.xs,
            minHeight: 72,
            paddingVertical: tokens.spacing.sm,
            paddingHorizontal: tokens.spacing.sm,
            justifyContent: 'center',
            alignItems: 'center',
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
    });
