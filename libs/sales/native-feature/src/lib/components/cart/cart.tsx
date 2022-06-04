import {
    cartActions,
    CartItem,
    CartState,
    selectCart,
} from '@pos/sales/data-access';
import { UIEmptyState } from '@pos/shared/ui-native';
import { Button, useTheme } from '@rneui/themed';
import React, { useEffect, useState } from 'react';

import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';
import every from 'lodash/every';

import { getDefaultPrinter, PrinterEntity } from '@pos/printings/data-access';
import { selectStore, StoreInfoEntity } from '@pos/store-info/data-access';
import { useSharedStyles } from '@pos/theme/native';

import CartLine from '../cart-line/cart-line';
import EmptyCart from '../../../../assets/images/empty-cart.png';

export type CartMode = 'order' | 'payment';

/* eslint-disable-next-line */
export interface CartProps {
    mode: CartMode;
    onSubmit: (
        cart: CartState,
        printer?: PrinterEntity,
        storeInfo?: StoreInfoEntity
    ) => void;
}

export function Cart({ mode, onSubmit }: CartProps) {
    const styles = useSharedStyles();
    const dispatch = useDispatch();
    const cart = useSelector(selectCart);
    const [ready, setReady] = useState(false);
    const storeInfo = useSelector(selectStore);
    const defaultPrinter = useSelector(getDefaultPrinter);

    const onSelect = (item: CartItem) => {
        dispatch(cartActions.select(item));
    };

    const onRemove = (item: CartItem) => {
        dispatch(cartActions.removeProduct(item));
    };

    useEffect(() => {
        setReady(
            cart.items.length > 0 && every(cart.items, (i) => i.quantity > 0)
        );
    }, [cart]);

    if (!cart.items.length) {
        return (
            <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
                <UIEmptyState
                    text="Cart is empty"
                    picture={EmptyCart}
                    backgroundColor={styles.darkBackground.backgroundColor}
                />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, flexDirection: 'column' }}>
            <View style={{ flex: 5 }}>
                <ScrollView>
                    {cart.items.map((i, idx) => (
                        <CartLine
                            key={idx}
                            item={i}
                            onSelect={onSelect}
                            onRemove={onRemove}
                        />
                    ))}
                </ScrollView>
            </View>
            <View>
                <Button
                    title={`$ ${cart.footer.total.toFixed(2)}\n${
                        mode === 'order' ? 'Print Order' : 'Paid'
                    }`}
                    type="solid"
                    disabled={!ready}
                    onPress={() => onSubmit(cart, defaultPrinter, storeInfo)}
                    // loading={orderStatus === 'saving'}
                />
            </View>
        </View>
    );
}

export default Cart;
