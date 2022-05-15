import { selectCart } from '@pos/sales/data-access';
import { UIEmptyState } from '@pos/shared/ui-native';
import { useSharedStyles } from '@pos/theme/native';
import React from 'react';

import { View, Text } from 'react-native';
import { useSelector } from 'react-redux';

import EmptyCart from '../../../../assets/images/empty-cart.png';

/* eslint-disable-next-line */
export interface CartProps {}

export function Cart(props: CartProps) {
    const styles = useSharedStyles();
    const cart = useSelector(selectCart);

    if (!cart.items.length) {
        return <UIEmptyState text='Cart is empty' picture={EmptyCart} />
    }

    return (
        <View>
            <Text >Welcome to cart!</Text>
        </View>
    );
}

export default Cart;
