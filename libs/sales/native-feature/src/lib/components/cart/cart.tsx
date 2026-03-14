import {
    cartActions,
    CartItem,
    CartPayment as ICartPayment,
    CartState,
    selectCart,
} from '@pos/sales/data-access';
import { UICard, UIEmptyState } from '@pos/shared/ui-native';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import { Button, Dialog } from '@rneui/themed';
import React, { useEffect, useState } from 'react';
import i18next from 'i18next';

import { View, TextInput, Alert, Text, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';

import { useSharedStyles } from '@pos/theme/native';

import CartLine from '../cart-line/cart-line';
import EmptyCart from '../../../../assets/images/empty-cart.png';
import CartPayment from '../cart-payment/cart-payment';
import { selectLoginEmployee } from '@pos/employees/data-access';
import { Role } from '@pos/auth/data-access';
import { ProductEntity } from '@pos/products/data-access';
import {
    getEbtEligibleTotal,
    getUnavailableProductMessages,
    isCartReady,
} from './cart.logic';

export type CartMode = 'order' | 'payment';
/* eslint-disable-next-line */
export interface CartProps {
    mode: CartMode;
    onSubmit: (cart: CartState, payments?: ICartPayment[]) => void;
    searchRef: React.RefObject<TextInput>;
    products: ProductEntity[];
}

export function Cart({ mode, onSubmit, searchRef, products }: CartProps) {
    const styles = useSharedStyles();
    const tokens = useDesignTokens();
    const localStyles = useStyles(tokens);
    const dispatch = useDispatch();
    const cart = useSelector(selectCart);
    const employee = useSelector(selectLoginEmployee);
    const [ready, setReady] = useState(false);
    const [receivePayment, setReceivePayment] = useState<boolean>(false);
    const ebtEligibleTotal = getEbtEligibleTotal(cart);
    const t = (key: string, fallback: string) =>
        i18next.isInitialized && i18next.exists(key)
            ? String(i18next.t(key))
            : fallback;
    
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
        const notAvailableProducts = getUnavailableProductMessages(
            cart.items,
            products
        );

        if (notAvailableProducts.length) {
            Alert.alert(
                t('CART_InventoryNotAvailableTitle', 'Product(s) not available'),
                `${t(
                    'CART_InventoryNotAvailableMessage',
                    'You do not have enough of these product(s) in inventory:'
                )}\n${notAvailableProducts}`
            );
        }

        return !notAvailableProducts.length;
    }

    useEffect(() => {
        setReady(isCartReady(cart));

        setTimeout(() => {
            searchRef.current?.focus();
            // console.log('[cart]: setting focus');
        }, 25);
        

    }, [cart, searchRef]);

    if (!cart.items.length) {
        return (
            <View style={localStyles.emptyWrap}>
                <UIEmptyState
                    text={t('CART_Empty', 'Cart is empty')}
                    picture={EmptyCart}
                    backgroundColor={styles.darkBackground.backgroundColor}
                />
            </View>
        );
    }

    return (
        <View style={localStyles.root}>
            <UICard tone="default" padding="sm" radius="md" style={localStyles.summaryCard}>
                <View style={localStyles.summaryRow}>
                    <Text style={localStyles.summaryLabel}>{t('CART_Items', 'Items')}</Text>
                    <Text style={localStyles.summaryValue}>{cart.items.length}</Text>
                </View>
                <View style={localStyles.summaryRow}>
                    <Text style={localStyles.summaryLabel}>{t('CART_Total', 'Total')}</Text>
                    <Text style={localStyles.summaryTotal}>$ {cart.footer.total.toFixed(2)}</Text>
                </View>
            </UICard>
            <View style={localStyles.linesWrap}>
                <ScrollView contentContainerStyle={localStyles.linesContent}>
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
            <View style={localStyles.actionsWrap}>
                <Button
                    testID="cart-pay-order-button"
                    title={
                        mode === 'order'
                            ? `${t('CART_PrintOrder', 'Print Order')}  •  $${cart.footer.total.toFixed(2)}`
                            : `${t('CART_ReceivePayment', 'Receive Payment')}  •  $${cart.footer.total.toFixed(2)}`
                    }
                    icon={{
                        name: mode === 'order' ? 'printer' : 'credit-card-check-outline',
                        type: 'material-community',
                        color: '#ffffff',
                    }}
                    type="solid"
                    disabled={!ready}
                    onPress={submitOrder}
                />
            </View>

            <Dialog
                    isVisible={receivePayment}
                    onBackdropPress={() => setReceivePayment(false)}
                    supportedOrientations={['landscape']}
                    presentationStyle="fullScreen"
                    overlayStyle={[styles.overlay, { width: 450 }]}
                >
                    <CartPayment
                        total={cart.footer.total}
                        ebtEligibleTotal={ebtEligibleTotal}
                        canReceiveChecks={employee?.roles.includes(Role.Checks) || false}
                        onPaymentEntered={paymentEntered}
                    />
                </Dialog>
        </View>
    );
}

const useStyles = (tokens: ReturnType<typeof useDesignTokens>) =>
    StyleSheet.create({
        root: {
            flex: 1,
            flexDirection: 'column',
        },
        emptyWrap: {
            marginTop: 120,
            flexDirection: 'column',
            justifyContent: 'center',
        },
        summaryCard: {
            marginBottom: tokens.spacing.sm,
        },
        summaryRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        summaryLabel: {
            color: tokens.colors.textMuted,
            fontSize: 12,
            fontWeight: '700',
            letterSpacing: 0.5,
            textTransform: 'uppercase',
        },
        summaryValue: {
            color: tokens.colors.textPrimary,
            fontSize: 18,
            fontWeight: '700',
        },
        summaryTotal: {
            color: tokens.colors.textPrimary,
            fontSize: 24,
            fontWeight: '800',
        },
        linesWrap: {
            flex: 1,
        },
        linesContent: {
            paddingBottom: tokens.spacing.xs,
        },
        actionsWrap: {
            marginTop: tokens.spacing.sm,
        },
    });

export default Cart;
