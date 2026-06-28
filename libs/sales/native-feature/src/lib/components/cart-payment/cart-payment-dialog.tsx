import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Dialog } from '@rneui/themed';
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
    const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
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
                    <View
                        testID="cart-payment-summary-column"
                        style={[
                            styles.summaryColumn,
                            isSummaryExpanded
                                ? styles.summaryColumnExpanded
                                : styles.summaryColumnCollapsed,
                        ]}
                    >
                        {isSummaryExpanded ? (
                            <View style={styles.summaryExpandedContent}>
                                <Pressable
                                    testID="cart-payment-summary-toggle"
                                    accessibilityRole="button"
                                    onPress={() => setIsSummaryExpanded(false)}
                                    style={styles.summaryCollapseButton}
                                >
                                    <Text style={styles.summaryCollapseText}>
                                        {t(
                                            'ORDERPAYMENT_CollapseSummary',
                                            'Collapse summary',
                                        )}
                                    </Text>
                                </Pressable>
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
                                    scrollContentStyle={
                                        styles.summaryScrollContent
                                    }
                                    contentTestID="cart-payment-summary"
                                    plain={true}
                                    footer={
                                        <View
                                            style={summaryStyles.summaryFooter}
                                        >
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
                                                    {t(
                                                        'ORDERPAYMENT_Total',
                                                        'Total',
                                                    )}
                                                </Text>
                                                <Text
                                                    style={
                                                        summaryStyles.summaryFooterValue
                                                    }
                                                >
                                                    $
                                                    {orderSummary.total.toFixed(
                                                        2,
                                                    )}
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
                        ) : (
                            <Pressable
                                testID="cart-payment-summary-toggle"
                                accessibilityRole="button"
                                onPress={() => setIsSummaryExpanded(true)}
                                style={styles.summaryRail}
                            >
                                <View
                                    testID="cart-payment-summary-rail"
                                    style={styles.summaryRailContent}
                                >
                                    <Text
                                        testID="cart-payment-summary-rail-label"
                                        style={styles.summaryRailLabel}
                                    >
                                        {t(
                                            'ORDERPAYMENT_SummaryRailLabel',
                                            'ORDER SUMMARY',
                                        )}
                                    </Text>
                                    <Text style={styles.summaryRailChevron}>
                                        ›
                                    </Text>
                                </View>
                            </Pressable>
                        )}
                    </View>

                    <View
                        testID="cart-payment-column"
                        style={[
                            styles.paymentColumn,
                            isSummaryExpanded
                                ? styles.paymentColumnExpanded
                                : styles.paymentColumnDominant,
                        ]}
                    >
                        <View style={styles.paymentSurface}>
                            <Pressable
                                testID="cart-payment-dialog-close-icon-button"
                                accessibilityRole="button"
                                accessibilityLabel={t(
                                    'ORDERPAYMENT_Close',
                                    'Close',
                                )}
                                disabled={busy}
                                onPress={onClose}
                                style={[
                                    styles.closeIconButton,
                                    busy && styles.closeIconButtonDisabled,
                                ]}
                            >
                                <Text style={styles.closeIconText}>×</Text>
                            </Pressable>
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
                                footerActions={paymentFooterActions}
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
            minHeight: 560,
        },
        summaryColumn: {
            minHeight: 0,
        },
        summaryColumnCollapsed: {
            width: 64,
            flexGrow: 0,
            flexShrink: 0,
        },
        summaryColumnExpanded: {
            flex: 3,
        },
        paymentColumn: {
            minHeight: 0,
        },
        paymentColumnDominant: {
            flex: 1,
        },
        paymentColumnExpanded: {
            flex: 7,
        },
        paymentSurface: {
            flex: 1,
            minHeight: 0,
            position: 'relative',
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
        summaryExpandedContent: {
            flex: 1,
            minHeight: 0,
        },
        summaryCollapseButton: {
            minHeight: 44,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: '#C7D0DB33',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: tokens.spacing.sm,
            backgroundColor: '#0F151E',
        },
        summaryCollapseText: {
            color: tokens.colors.textPrimary,
            fontWeight: '800',
            fontSize: 13,
        },
        summaryRail: {
            flex: 1,
            minHeight: 0,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: '#C7D0DB33',
            backgroundColor: '#0A0F16',
        },
        summaryRailContent: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: tokens.spacing.md,
            paddingHorizontal: tokens.spacing.xs,
            position: 'relative',
        },
        summaryRailLabel: {
            color: tokens.colors.textMuted,
            fontSize: 12,
            fontWeight: '900',
            letterSpacing: 0,
            textTransform: 'uppercase',
            textAlign: 'center',
            transform: [{ rotate: '-90deg' }],
            width: 140,
        },
        summaryRailChevron: {
            position: 'absolute',
            top: 14,
            color: '#8FC5FF',
            fontSize: 22,
            fontWeight: '800',
            textAlign: 'center',
        },
        closeIconButton: {
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 3,
            width: 34,
            height: 34,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: '#C7D0DB33',
            backgroundColor: '#101721',
            alignItems: 'center',
            justifyContent: 'center',
        },
        closeIconButtonDisabled: {
            opacity: 0.45,
        },
        closeIconText: {
            color: tokens.colors.textPrimary,
            fontSize: 22,
            lineHeight: 24,
            fontWeight: '800',
        },
    });

export default CartPaymentDialog;
