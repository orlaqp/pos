import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Dialog } from '@rneui/themed';
import { useSharedStyles } from '@pos/theme/native';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import type {
    CartPayment as ICartPayment,
    CartState,
} from '@pos/sales/data-access';
import { translateWithFallback } from '@pos/shared/utils';
import CartPayment from './cart-payment';
import { buildDiscountBreakdown, buildOrderSummary } from '../cart/cart.logic';
import { createCartStyles } from '../cart/cart.styles';
import { OrderSummaryPanel } from '../cart/order-summary-panel';

export interface CartPaymentDialogProps {
    visible: boolean;
    cart?: CartState;
    canReceiveChecks: boolean;
    creditCardSurchargePercent?: number;
    busy?: boolean;
    onClose: () => void;
    onPaymentEntered: (payments: ICartPayment[]) => void;
    summaryActions?: React.ReactNode;
    paymentFooterActions?: React.ReactNode;
}

export function CartPaymentDialog({
    visible,
    cart,
    canReceiveChecks,
    creditCardSurchargePercent = 0,
    busy = false,
    onClose,
    onPaymentEntered,
    summaryActions,
    paymentFooterActions,
}: CartPaymentDialogProps) {
    const sharedStyles = useSharedStyles();
    const tokens = useDesignTokens();
    const summaryStyles = createCartStyles(tokens);
    const styles = useStyles(tokens);
    const t = translateWithFallback;
    const orderSummary = cart ? buildOrderSummary(cart) : undefined;
    const discountBreakdown = buildDiscountBreakdown(
        cart?.appliedDiscountSummary,
    );

    if (!cart || !orderSummary) {
        return null;
    }

    return (
        <Dialog
            isVisible={visible}
            onBackdropPress={busy ? undefined : onClose}
            supportedOrientations={['landscape']}
            presentationStyle="fullScreen"
            overlayStyle={[sharedStyles.overlay, styles.overlay]}
        >
            <View style={styles.surface} testID="cart-payment-dialog">
                <View style={styles.columns}>
                    <View style={styles.summaryColumn}>
                        <OrderSummaryPanel
                            styles={summaryStyles}
                            orderSummary={orderSummary}
                            discountBreakdown={discountBreakdown}
                            title={t(
                                'ORDERPAYMENT_SummaryTitle',
                                'Order summary',
                            )}
                            hint={t(
                                'ORDERPAYMENT_SummaryHint',
                                'Review the order details before receiving payment.',
                            )}
                            scrollStyle={styles.summaryScroll}
                            scrollContentStyle={styles.summaryScrollContent}
                            contentTestID="cart-payment-summary"
                            plain={true}
                            footer={
                                <View style={summaryStyles.summaryFooter}>
                                    <View
                                        style={
                                            summaryStyles.summaryFooterTotalBlock
                                        }
                                    >
                                        <Text
                                            style={
                                                summaryStyles.summaryFooterLabel
                                            }
                                        >
                                            {t('ORDERPAYMENT_Total', 'Total')}
                                        </Text>
                                        <Text
                                            style={
                                                summaryStyles.summaryFooterValue
                                            }
                                        >
                                            ${orderSummary.total.toFixed(2)}
                                        </Text>
                                    </View>
                                    {summaryActions ? (
                                        <View
                                            style={
                                                summaryStyles.summaryFooterActions
                                            }
                                        >
                                            {summaryActions}
                                        </View>
                                    ) : null}
                                </View>
                            }
                        />
                    </View>

                    <View style={styles.paymentColumn}>
                        <View style={styles.paymentSurface}>
                            <CartPayment
                                total={orderSummary.total}
                                ebtEligibleTotal={orderSummary.ebtEligibleTotal}
                                canReceiveChecks={canReceiveChecks}
                                creditCardSurchargePercent={
                                    creditCardSurchargePercent
                                }
                                onPaymentEntered={onPaymentEntered}
                                layout="compact"
                                disableSubmit={busy}
                                footerActions={
                                    paymentFooterActions ?? (
                                        <View style={styles.secondaryActions}>
                                            <Button
                                                testID="cart-payment-dialog-close-button"
                                                type="outline"
                                                title={t(
                                                    'ORDERPAYMENT_Close',
                                                    'Close',
                                                )}
                                                disabled={busy}
                                                onPress={onClose}
                                                buttonStyle={
                                                    styles.secondaryButton
                                                }
                                                titleStyle={
                                                    styles.secondaryButtonTitle
                                                }
                                            />
                                        </View>
                                    )
                                }
                            />
                        </View>
                    </View>
                </View>
            </View>
        </Dialog>
    );
}

const useStyles = (tokens: ReturnType<typeof useDesignTokens>) =>
    StyleSheet.create({
        overlay: {
            width: 1220,
            maxWidth: '96%',
            padding: 0,
            borderRadius: 28,
            overflow: 'hidden',
        },
        surface: {
            backgroundColor: '#05080C',
            padding: tokens.spacing.lg,
        },
        columns: {
            flexDirection: 'row',
            gap: tokens.spacing.lg,
            alignItems: 'stretch',
            minHeight: 620,
        },
        summaryColumn: {
            flex: 1.35,
        },
        paymentColumn: {
            flex: 1,
            minHeight: 0,
        },
        paymentSurface: {
            flex: 1,
            minHeight: 0,
            borderRadius: 28,
            borderWidth: 1,
            borderColor: '#C7D0DB33',
            backgroundColor: '#080B10',
            padding: tokens.spacing.lg,
        },
        summaryScroll: {
            maxHeight: 540,
        },
        summaryScrollContent: {
            paddingBottom: tokens.spacing.sm,
        },
        secondaryActions: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: tokens.spacing.sm,
        },
        secondaryButton: {
            minHeight: 48,
            borderRadius: 18,
            borderColor: tokens.colors.border,
        },
        secondaryButtonTitle: {
            color: tokens.colors.textPrimary,
            fontWeight: '700',
        },
    });

export default CartPaymentDialog;
