import { cartActions, CartItem, selectCart } from '@pos/sales/data-access';
import { UIEmptyState } from '@pos/shared/ui-native';
import { theme, useSharedStyles } from '@pos/theme/native';
import { Button, Divider, Icon, ListItem, useTheme } from '@rneui/themed';
import React from 'react';

import { View, Text } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';

import EmptyCart from '../../../../assets/images/empty-cart.png';
import CartLine from '../cart-line/cart-line';

/* eslint-disable-next-line */
export interface CartProps {}

export function Cart(props: CartProps) {
    const theme = useTheme();
    const styles = useSharedStyles();
    const dispatch = useDispatch();
    const cart = useSelector(selectCart);

    const onSelect = (item: CartItem) => {
        dispatch(cartActions.select(item));
    }

    const onRemove = (item: CartItem) => {
        dispatch(cartActions.removeProduct(item));
    }

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
                        <CartLine key={i.product.id} item={i} onSelect={onSelect} onRemove={onRemove} />
                    ))}
                </ScrollView>
            </View>
            <View>
                <Button title={`$ ${cart.footer.total.toFixed(2)}`} type='solid' />
            </View>
        </View>
    );
}

export default Cart;
