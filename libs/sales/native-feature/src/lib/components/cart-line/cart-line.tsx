import { useSharedStyles } from '@pos/theme/native';
import { Icon, useTheme } from '@rneui/themed';
import { CartItem } from 'libs/sales/data-access/src/cart-entity';
import React from 'react';

import { View, Text, TouchableOpacity } from 'react-native';

/* eslint-disable-next-line */
export interface CartLineProps {
    item: CartItem;
}

export function CartLine({ item }: CartLineProps) {
    const theme = useTheme();
    const styles = useSharedStyles();

    return (
        <TouchableOpacity
            style={{
                // ...styles.darkBackground,
                backgroundColor: theme.theme.colors.grey4,
                marginBottom: 10,
                paddingHorizontal: 10,
                paddingVertical: 15,
                borderRadius: 5,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            <View>
                <Text style={styles.primaryText}>{item.product.name}</Text>
                <Text style={[styles.secondaryText, { fontSize: 20 }]}>
                    $ {item.product.price.toFixed(2)}x{item.quantity}
                </Text>
            </View>
            <View style={{ flexGrow: 1 }}></View>
            <Icon
                name="trash-can"
                type="material-community"
                color={theme.theme.colors.error}
            />
        </TouchableOpacity>
    );
}

export default CartLine;
