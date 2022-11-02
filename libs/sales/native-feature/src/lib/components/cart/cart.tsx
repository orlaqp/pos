import {
    cartActions,
    CartItem,
    CartPayment as ICartPayment,
    CartState,
    selectCart,
} from '@pos/sales/data-access';
import { UIEmptyState } from '@pos/shared/ui-native';
import { Button, Dialog } from '@rneui/themed';
import React, { useEffect, useState } from 'react';

import { View, TextInput, Alert } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';
import every from 'lodash/every';

import { useSharedStyles } from '@pos/theme/native';

import CartLine from '../cart-line/cart-line';
import EmptyCart from '../../../../assets/images/empty-cart.png';
import CartPayment from '../cart-payment/cart-payment';
import { selectLoginEmployee } from '@pos/employees/data-access';
import { Role } from '@pos/auth/data-access';
import { ProductEntity } from '@pos/products/data-access';

export type CartMode = 'order' | 'payment';
type ProductSummary = { product: ProductEntity, totalQuantity: number, delta: number };

/* eslint-disable-next-line */
export interface CartProps {
    mode: CartMode;
    onSubmit: (cart: CartState, payments?: ICartPayment[]) => void;
    searchRef: React.RefObject<TextInput>;
    products: ProductEntity[];
}

export function Cart({ mode, onSubmit, searchRef, products }: CartProps) {
    const styles = useSharedStyles();
    const dispatch = useDispatch();
    const cart = useSelector(selectCart);
    const employee = useSelector(selectLoginEmployee);
    const [ready, setReady] = useState(false);
    const [receivePayment, setReceivePayment] = useState<boolean>(false);
    
    const onSelect = (item: CartItem) => {
        dispatch(cartActions.select(item));
    };

    const onRemove = (item: CartItem) => {
        dispatch(cartActions.removeProduct(item));
    };

    const paymentEntered = (payments: ICartPayment[]) => {
        setReceivePayment(false);
        onSubmit(cart, payments);
    }

    const submitOrder = () => {
        if (!validateProductInventory())
            return;

        if (mode === 'payment') {
            setReceivePayment(true);
        } else {
            onSubmit(cart);
        }
    }

    const validateProductInventory = () => {
        // aggregate product quantities
        const summary: Record<string, ProductSummary> = {};

        cart.items.reduce((s, item) => {
            const product = products.find(x => x.id === item.product.id);
            const pSummary: ProductSummary = s[item.product.id] || {
                product,
                totalQuantity: 0,
                delta: 0
            };

            pSummary.totalQuantity += item.quantity;
            pSummary.delta = (product?.quantity || 0) - pSummary.totalQuantity;
            summary[item.product.id] = pSummary;

            return summary;
        }, summary);

        const notAvailableProducts = Object.keys(summary).filter(x => summary[x].delta < 0);

        if (notAvailableProducts.length) {
            Alert.alert('Product(s) not available', `You do not have enough of these product(s) in inventory:\n${notAvailableProducts.map(x => `${summary[x].product.name} -> ${summary[x].delta}`)}`);
        }

        return !notAvailableProducts.length;
    }

    useEffect(() => {
        setReady(
            cart.items.length > 0 && every(cart.items, (i) => i.quantity > 0)
        );

        setTimeout(() => {
            searchRef.current?.focus();
            // console.log('[cart]: setting focus');
        }, 25);
        

    }, [cart, searchRef]);

    if (!cart.items.length) {
        return (
            <View style={{ marginTop: 150, flexDirection: 'column', justifyContent: 'center' }}>
                <UIEmptyState
                    text="Cart is empty"
                    picture={EmptyCart}
                    backgroundColor={styles.darkBackground.backgroundColor}
                />
            </View>
        );
    }

    return (
        <View style={{ flexGrow: 1, flexDirection: 'column' }}>
            <View style={{ flex: 11 }}>
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
            <View style={{ flex: 1 }}>
                <Button
                    title={`$ ${cart.footer.total.toFixed(2)}\n${
                        mode === 'order' ? 'Print Order' : 'Paid'
                    }`}
                    type="solid"
                    disabled={!ready}
                    onPress={submitOrder}
                    // loading={orderStatus === 'saving'}
                />
            </View>

            <Dialog
                    isVisible={receivePayment}
                    onBackdropPress={() => setReceivePayment(false)}
                    overlayStyle={[styles.overlay, { width: 450 }]}
                >
                    <CartPayment
                        total={cart.footer.total}
                        canReceiveChecks={employee?.roles.includes(Role.Checks) || false}
                        onPaymentEntered={paymentEntered}
                    />
                </Dialog>
        </View>
    );
}

export default Cart;
