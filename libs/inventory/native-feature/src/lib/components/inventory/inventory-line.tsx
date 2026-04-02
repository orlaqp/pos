import React, { useState } from 'react';

import { StyleSheet, View, Text } from 'react-native';
import { useSharedStyles } from '@pos/theme/native';
import { TextInput } from 'react-native-gesture-handler';
import { ProductEntity } from '@pos/products/data-access';
import { useTheme } from '@rneui/themed';
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
    const theme = useTheme();
    const styles = useSharedStyles();
    const tokens = useDesignTokens();
    const local = useStyles(tokens);
    const [reorderPoint, setReorderPoint] = useState<string | null | undefined>(item.reorderPoint?.toString());
    const prevReorderPoint = item.reorderPoint;
    const [reorderQuantity, setReorderQuantity] = useState<string | null | undefined>(item.reorderQuantity?.toString());
    const prevReorderQuantity = item.reorderQuantity;
    const isLowInventory = item.quantity <= +(reorderPoint || -1);

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
                styles.smallDataRow,
                local.row,
                {
                    backgroundColor:
                        isLowInventory
                            ? theme.theme.colors.error
                            : styles.smallDataRow.backgroundColor,
                    borderWidth: 1,
                },
            ]}
        >
            <View style={local.identityColumn}>
                <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
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
                <Text testID={`inventory-stock-qty-${productKey}`} style={styles.name}>
                    {item.quantity % 1 === 0 ? item.quantity : item.quantity.toFixed(2) }
                </Text>
            </View>
            <View style={local.inputColumn}>
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
            alignItems: 'flex-start',
            paddingVertical: tokens.spacing.sm,
        },
        identityColumn: {
            flex: 4,
            flexDirection: 'column',
            paddingRight: tokens.spacing.md,
        },
        description: {
            marginBottom: 0,
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
        inputColumn: {
            flex: 1,
            paddingHorizontal: tokens.spacing.xs,
            justifyContent: 'center',
        },
        input: {
            marginRight: 0,
            minWidth: 80,
        },
    });

export default InventoryLine;
