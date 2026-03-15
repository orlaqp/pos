import { CartItem } from '@pos/sales/data-access';
import { UIEbtRibbon } from '@pos/shared/ui-native';
import { useSharedStyles } from '@pos/theme/native';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import { Button, useTheme } from '@rneui/themed';
import React from 'react';

import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';

/* eslint-disable-next-line */
export interface CartLineProps {
    item: CartItem;
    onSelect: (item: CartItem) => void;
    onRemove: (item: CartItem) => void;
}

export function CartLine({ item, onRemove, onSelect }: CartLineProps) {
    const theme = useTheme();
    const styles = useSharedStyles();
    const tokens = useDesignTokens();
    const localStyles = useStyles(tokens, theme.theme.colors.error);
    const requiresWeight = item.quantity === 0;
    
    const confirmDeletion = () => {
        Alert.alert(
            'Are you sure?',
            'You will not be able to undo this operation',
            [
                { text: 'No' },
                { text: 'Yes', onPress: () => onRemove(item) },
            ]
        );
    }


    return (
        <TouchableOpacity
            style={[
                localStyles.container,
                requiresWeight && localStyles.containerError,
            ]}
            onPress={() => onSelect(item)}
        >
            {requiresWeight ? <View style={localStyles.errorAccent} /> : null}
            <View style={localStyles.content}>
                <Text style={styles.primaryText}>{item.product.name}</Text>
                {requiresWeight ? (
                    <View style={localStyles.statusBadge}>
                        <Text style={localStyles.statusBadgeText}>Needs weight</Text>
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
                        $ {item.product.price.toFixed(2)}x
                        {`${item.quantity.toFixed(2)}${item.product.unitOfMeasure}`}
                    </Text>
                    <Text
                        style={[
                            styles.primaryText,
                            localStyles.totalText,
                            requiresWeight && localStyles.totalTextError,
                        ]}
                    >
                        {'  '}($
                        {(item.product.price * item.quantity).toFixed(2)})
                    </Text>
                </View>
            </View>
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
        </TouchableOpacity>
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
        metaRow: {
            flexDirection: 'row',
            alignItems: 'flex-end',
            marginTop: 2,
        },
        metaText: {
            fontSize: 14,
            fontWeight: '700',
        },
        metaTextError: {
            color: dangerColor,
        },
        totalText: {
            fontSize: 20,
            fontWeight: '800',
        },
        totalTextError: {
            color: dangerColor,
        },
    });

export default CartLine;
