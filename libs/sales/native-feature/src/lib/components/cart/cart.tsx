import {
    cartActions,
    CartItem,
    CartPayment as ICartPayment,
    CartState,
    selectCart,
} from '@pos/sales/data-access';
import { UICard } from '@pos/shared/ui-native';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import { Button, Dialog } from '@rneui/themed';
import React, { useEffect, useState } from 'react';
import i18next from 'i18next';

import { View, TextInput, Alert, Text, StyleSheet, Image } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';

import { useSharedStyles } from '@pos/theme/native';

import CartLine from '../cart-line/cart-line';
import EmptyCart from '../../../../../../../apps/mobile-ui/assets/illustrations/empty-cart-1600.png';
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
    const [receivePayment, setReceivePayment] = useState<boolean>(false);
    const ready = isCartReady(cart);
    const ebtEligibleTotal = getEbtEligibleTotal(cart);
    const invalidItemCount = cart.items.filter((item) => item.quantity === 0).length;
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
        setTimeout(() => {
            searchRef.current?.focus();
            // console.log('[cart]: setting focus');
        }, 25);
        
    }, [cart, searchRef]);

    if (!cart.items.length) {
        return (
            <View style={localStyles.emptyWrap}>
                <Image
                    source={EmptyCart}
                    style={localStyles.emptyImage}
                    resizeMode="contain"
                />
                <Text style={localStyles.emptyText}>
                    {t('CART_Empty', 'Cart is empty')}
                </Text>
                <Text style={localStyles.emptyHint}>
                    Scan items or search the catalog to start a sale.
                </Text>
            </View>
        );
    }

    return (
        <View style={localStyles.root}>
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
                {!ready && invalidItemCount > 0 ? (
                    <Text style={localStyles.warningText}>
                        {invalidItemCount === 1
                            ? '1 item needs weight before checkout'
                            : `${invalidItemCount} items need weight before checkout`}
                    </Text>
                ) : null}
                <Button
                    testID="cart-pay-order-button"
                    title={
                        !ready && invalidItemCount > 0
                            ? 'Resolve cart items to continue'
                            : mode === 'order'
                              ? `${t('CART_PrintOrder', 'Print Order')}  •  $${cart.footer.total.toFixed(2)}`
                              : `${t('CART_ReceivePayment', 'Receive Payment')}  •  $${cart.footer.total.toFixed(2)}`
                    }
                    icon={{
                        name:
                            !ready && invalidItemCount > 0
                                ? 'alert-circle-outline'
                                : mode === 'order'
                                  ? 'printer'
                                  : 'credit-card-check-outline',
                        type: 'material-community',
                        color: ready ? '#ffffff' : tokens.colors.textSecondary,
                    }}
                    type="solid"
                    disabled={!ready}
                    onPress={submitOrder}
                    buttonStyle={localStyles.primaryButton}
                    disabledStyle={localStyles.primaryButtonDisabled}
                    titleStyle={[
                        localStyles.primaryButtonTitle,
                        !ready && localStyles.primaryButtonTitleDisabled,
                    ]}
                    containerStyle={localStyles.primaryButtonContainer}
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
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: tokens.spacing.lg,
        },
        emptyImage: {
            width: 220,
            height: 220,
            marginBottom: tokens.spacing.sm,
        },
        emptyText: {
            color: tokens.colors.textPrimary,
            fontSize: 20,
            fontWeight: '700',
            textAlign: 'center',
        },
        emptyHint: {
            color: tokens.colors.textSecondary,
            fontSize: 15,
            lineHeight: 22,
            textAlign: 'center',
            marginTop: tokens.spacing.xs,
            maxWidth: 260,
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
        warningText: {
            color: tokens.colors.danger,
            fontSize: 13,
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: tokens.spacing.xs,
        },
        primaryButtonContainer: {
            borderRadius: tokens.radii.md,
            overflow: 'hidden',
        },
        primaryButton: {
            minHeight: 60,
            borderRadius: tokens.radii.md,
            backgroundColor: tokens.colors.accent,
        },
        primaryButtonDisabled: {
            minHeight: 60,
            borderRadius: tokens.radii.md,
            backgroundColor: tokens.colors.surfaceMuted,
            borderWidth: 1,
            borderColor: tokens.colors.border,
        },
        primaryButtonTitle: {
            fontSize: 20,
            fontWeight: '800',
        },
        primaryButtonTitleDisabled: {
            color: tokens.colors.textSecondary,
        },
    });

export default Cart;
