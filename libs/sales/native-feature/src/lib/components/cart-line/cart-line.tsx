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
                item.quantity === 0 && localStyles.containerError,
            ]}
            onPress={() => onSelect(item)}
        >
            <View style={localStyles.content}>
                <Text style={styles.primaryText}>{item.product.name}</Text>
                <View style={localStyles.metaRow}>
                    <Text
                        style={[
                            styles.secondaryText,
                            localStyles.metaText,
                        ]}
                    >
                        $ {item.product.price.toFixed(2)}x
                        {`${item.quantity.toFixed(2)}${item.product.unitOfMeasure}`}
                    </Text>
                    <Text
                        style={[
                            styles.primaryText,
                            localStyles.totalText,
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
            borderColor: `${dangerColor}99`,
        },
        content: {
            flex: 1,
            paddingRight: tokens.spacing.xs,
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
        totalText: {
            fontSize: 20,
            fontWeight: '800',
        },
    });

export default CartLine;
