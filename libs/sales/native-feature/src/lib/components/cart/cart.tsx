import { cartActions, CartItem, getOrderStatus, orderActions, selectCart, submitOrder } from '@pos/sales/data-access';
import { UIEmptyState } from '@pos/shared/ui-native';
import { Button, useTheme } from '@rneui/themed';
import React, { useEffect, useState } from 'react';

import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';
import every from 'lodash/every';

import EmptyCart from '../../../../assets/images/empty-cart.png';
import CartLine from '../cart-line/cart-line';
import { print } from '@pos/printings/data-access';

export type CartMode = 'order' | 'payment'; 

/* eslint-disable-next-line */
export interface CartProps {
    mode: CartMode;
}

export function Cart({ mode }: CartProps) {
    const theme = useTheme();
    const dispatch = useDispatch();
    const cart = useSelector(selectCart);
    const [ready, setReady] = useState(false);
    const orderStatus = useSelector(getOrderStatus);

    const onSelect = (item: CartItem) => {
        dispatch(cartActions.select(item));
    };

    const onRemove = (item: CartItem) => {
        dispatch(cartActions.removeProduct(item));
    };

    const submit = () => {
        if (mode === 'order') {
            dispatch(submitOrder(cart));
            print();
            return;
        }

        return;
    }

    useEffect(() => {
        setReady(
            cart.items.length > 0 && every(cart.items, (i) => i.quantity > 0)
        );
    }, [cart]);

    useEffect(() => {
        if (orderStatus === 'saved') {
            dispatch(cartActions.reset());
        }
    }, [dispatch, orderStatus]);

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
                        <CartLine
                            key={i.product.id}
                            item={i}
                            onSelect={onSelect}
                            onRemove={onRemove}
                        />
                    ))}
                </ScrollView>
            </View>
            <View>
                <Button
                    title={`$ ${cart.footer.total.toFixed(2)}\nPrint Order`}
                    type="solid"
                    disabled={!ready}
                    onPress={submit}
                    loading={orderStatus === 'saving'}
                />
            </View>
        </View>
    );
}

export default Cart;
