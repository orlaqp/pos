import { selectCart } from '@pos/sales/data-access';
import { UIEmptyState } from '@pos/shared/ui-native';
import { theme, useSharedStyles } from '@pos/theme/native';
import { Button, Divider, Icon, ListItem, useTheme } from '@rneui/themed';
import React from 'react';

import { View, Text } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';

import EmptyCart from '../../../../assets/images/empty-cart.png';
import CartLine from '../cart-line/cart-line';

/* eslint-disable-next-line */
export interface CartProps {}

export function Cart(props: CartProps) {
    const theme = useTheme();
    const styles = useSharedStyles();
    const cart = useSelector(selectCart);

    if (!cart.items.length) {
        return (
            <UIEmptyState
                text="Cart is empty"
                picture={EmptyCart}
                backgroundColor={`${theme.theme.colors.searchBg}44`}
            />
        );
    }

    return (
        <View style={{ flex: 1, flexDirection: 'column' }}>
            <View style={{ flex: 5 }}>
                <ScrollView>
                    {cart.items.map((i) => (
                        <CartLine item={i} />
                    ))}
                </ScrollView>
            </View>
            <View>
                <Button title={'$ 30.45'} type='solid' />
            </View>
        </View>
    );
}

export default Cart;
