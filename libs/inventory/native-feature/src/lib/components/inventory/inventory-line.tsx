import React, { useState } from 'react';

import { StyleSheet, View, Text } from 'react-native';
import { translateWithFallback } from '@pos/shared/utils';
import { useSharedStyles } from '@pos/theme/native';
import { TextInput } from 'react-native-gesture-handler';
import { ProductEntity } from '@pos/products/data-access';
import { OrderService } from '@pos/orders/data-access';
import { useDesignTokens } from '@pos/theme/native/design-tokens';

export interface InventoryLineProps {
    item: ProductEntity;
}

const toTestKey = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

export function InventoryLine({ item }: InventoryLineProps) {
    const t = translateWithFallback;
    const styles = useSharedStyles();
    const tokens = useDesignTokens();
    const local = useStyles(tokens);
    const [reorderPoint, setReorderPoint] = useState<string | null | undefined>(item.reorderPoint?.toString());
    const prevReorderPoint = item.reorderPoint;
    const [reorderQuantity, setReorderQuantity] = useState<string | null | undefined>(item.reorderQuantity?.toString());
    const prevReorderQuantity = item.reorderQuantity;
    const isLowInventory = item.quantity <= +(reorderPoint || -1);
    const quantityLabel = item.quantity % 1 === 0 ? item.quantity : item.quantity.toFixed(2);

    const updateReorderPoint = (text: string) => {
        const value = +text;
        if (!text || !value) {
            setReorderPoint(prevReorderPoint?.toString());
            return;
        }

        setReorderPoint(text);
        OrderService.updateReorderPoint(item.id, value);
    };


    const updateReorderQuantity = (text: string) => {
        const value = +text;
        if (!text || !value) {
            setReorderQuantity(prevReorderQuantity?.toString());
            return;
        }

        setReorderQuantity(text);
        OrderService.updateReorderQuantity(item.id, value);
    };
    const productKey = toTestKey(item.name);

    return (
        <View
            style={[
                local.row,
                isLowInventory && local.lowInventoryRow,
            ]}
        >
            <View style={local.identityColumn}>
                <Text style={local.name} numberOfLines={1} ellipsizeMode="tail">
                    {item.name}
                </Text>
                {!!item.description && (
                    <Text
                        testID={`inventory-stock-description-${productKey}`}
                        style={[
                            styles.description,
                            local.description,
                            isLowInventory && local.lowInventoryDescription,
                        ]}
                    >
                        {item.description}
                    </Text>
                )}
            </View>
            <View style={local.qtyColumn}>
                <View style={[local.quantityPill, isLowInventory && local.lowQuantityPill]}>
                    <Text testID={`inventory-stock-qty-${productKey}`} style={local.quantityText}>
                        {quantityLabel}
                    </Text>
                </View>
                {isLowInventory && (
                    <Text style={local.lowInventoryLabel}>
                        {t('SALES_ProductCardLowStock', 'Low stock')}
                    </Text>
                )}
            </View>
            <View style={local.inputColumn}>
                <Text style={local.inputLabel}>
                    {t('INVENTORY_ReorderPointShort', 'Point')}
                </Text>
                <TextInput
                    value={reorderPoint}
                    onChangeText={setReorderPoint}
                    style={[
                        styles.input,
                        styles.primaryText,
                        local.input,
                    ]}
                    onFocus={() => setReorderPoint('')}
                    onBlur={() => updateReorderPoint(reorderPoint || '')}
                />
            </View>
            <View style={local.inputColumn}>
                <Text style={local.inputLabel}>
                    {t('COMMON_QuantityShort', 'Qty')}
                </Text>
                <TextInput
                    value={reorderQuantity}
                    onChangeText={setReorderQuantity}
                    style={[
                        styles.input,
                        styles.primaryText,
                        local.input,
                    ]}
                    onFocus={() => setReorderQuantity('')}
                    onBlur={() => updateReorderQuantity(reorderQuantity || '')}
                />
            </View>
        </View>
    );
}

const useStyles = (tokens: ReturnType<typeof useDesignTokens>) =>
    StyleSheet.create({
        row: {
            alignItems: 'center',
            backgroundColor: '#0B1119',
            borderColor: '#1D2A3B',
            borderRadius: 18,
            borderWidth: 1,
            flexDirection: 'row',
            marginBottom: tokens.spacing.sm,
            paddingHorizontal: tokens.spacing.md,
            paddingVertical: tokens.spacing.md,
        },
        lowInventoryRow: {
            backgroundColor: '#221217',
            borderColor: '#A9444F',
        },
        identityColumn: {
            flex: 4,
            flexDirection: 'column',
            paddingRight: tokens.spacing.md,
        },
        name: {
            color: tokens.colors.textPrimary,
            fontSize: 17,
            fontWeight: '800',
        },
        description: {
            marginBottom: 0,
            marginTop: 4,
        },
        lowInventoryDescription: {
            color: 'rgba(255, 255, 255, 0.9)',
        },
        qtyColumn: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            alignSelf: 'stretch',
        },
        quantityPill: {
            alignItems: 'center',
            backgroundColor: '#121B27',
            borderColor: '#26364C',
            borderRadius: 14,
            borderWidth: 1,
            minWidth: 74,
            paddingHorizontal: tokens.spacing.sm,
            paddingVertical: tokens.spacing.xs,
        },
        lowQuantityPill: {
            backgroundColor: '#351A21',
            borderColor: '#D65A66',
        },
        quantityText: {
            color: tokens.colors.textPrimary,
            fontSize: 16,
            fontWeight: '800',
        },
        lowInventoryLabel: {
            color: '#FF9BA6',
            fontSize: 10,
            fontWeight: '800',
            letterSpacing: 0.8,
            marginTop: 4,
            textTransform: 'uppercase',
        },
        inputColumn: {
            flex: 1,
            paddingHorizontal: tokens.spacing.xs,
            justifyContent: 'center',
        },
        inputLabel: {
            color: tokens.colors.textMuted,
            fontSize: 10,
            fontWeight: '800',
            letterSpacing: 0.8,
            marginBottom: 4,
            textTransform: 'uppercase',
        },
        input: {
            backgroundColor: '#111923',
            borderColor: '#26364C',
            borderRadius: 14,
            borderWidth: 1,
            marginRight: 0,
            minWidth: 80,
            paddingHorizontal: tokens.spacing.sm,
            textAlign: 'center',
        },
    });

export default InventoryLine;
