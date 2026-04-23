import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Button, Dialog } from '@rneui/themed';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';

import {
    OrderEntity,
    OrderEntityMapper,
    OrderService,
    payOrder,
} from '@pos/orders/data-access';
import { cartActions } from '@pos/sales/data-access';
import {
    buildDiscountBreakdown,
    buildOrderSummary,
    CartPayment,
    createCartStyles,
    OrderSummaryPanel,
} from '@pos/sales/native-feature';
import {
    getDefaultPrinter,
    printReceipt,
    PrinterEntityMapper,
    PrinterService,
} from '@pos/printings/data-access';
import {
    selectStore,
    StoreInfoEntityMapper,
    StoreInfoService,
} from '@pos/store-info/data-access';
import { selectLoginEmployee } from '@pos/employees/data-access';
import { Role } from '@pos/auth/data-access';
import { useSharedStyles } from '@pos/theme/native';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import i18next from 'i18next';

interface OpenOrderPaymentDialogProps {
    visible: boolean;
    order?: OrderEntity;
    navigation?: NativeStackNavigationProp<any>;
    onClose: () => void;
}

export function OpenOrderPaymentDialog({
    visible,
    order,
    navigation,
    onClose,
}: OpenOrderPaymentDialogProps) {
    const dispatch = useDispatch();
    const sharedStyles = useSharedStyles();
    const tokens = useDesignTokens();
    const summaryStyles = createCartStyles(tokens);
    const styles = useStyles(tokens);
    const defaultPrinter = useSelector(getDefaultPrinter);
    const store = useSelector(selectStore);
    const employee = useSelector(selectLoginEmployee);
    const [busy, setBusy] = useState(false);
    const t = (key: string, fallback: string) =>
        i18next.isInitialized && i18next.exists(key)
            ? String(i18next.t(key))
            : fallback;

    const cart = useMemo(
        () => (order ? OrderEntityMapper.asCartState(order) : undefined),
        [order]
    );
    const orderSummary = useMemo(
        () => (cart ? buildOrderSummary(cart) : undefined),
        [cart]
    );
    const discountBreakdown = useMemo(
        () => buildDiscountBreakdown(cart?.appliedDiscountSummary),
        [cart?.appliedDiscountSummary]
    );
    const canReceiveChecks = !!employee?.roles?.includes(Role.Checks);

    const closeDialog = () => {
        if (busy) return;
        onClose();
    };

    const openInSales = () => {
        if (!order || busy) return;

        dispatch(cartActions.set(order));
        onClose();
        navigation?.navigate('Sales', { mode: 'payment' });
    };

    const printReference = async () => {
        if (!cart || busy) return;

        const resolvedStore =
            store ||
            (await StoreInfoService.getStore()
                .then((stores) => {
                    const preferred = stores?.[0];
                    return preferred
                        ? StoreInfoEntityMapper.fromModel(preferred)
                        : undefined;
                })
                .catch(() => undefined));
        const resolvedPrinter =
            defaultPrinter ||
            (await PrinterService.getDefaultPrinter()
                .then((printer) =>
                    printer ? PrinterEntityMapper.fromModel(printer) : undefined
                )
                .catch(() => undefined));

        if (!resolvedStore || !resolvedPrinter) {
            Alert.alert(
                t(
                    'ORDERPAYMENT_PrintRequirements',
                    'Store info and printer setup need to be ready before printing a reference.'
                )
            );
            return;
        }

        await printReceipt(
            resolvedStore,
            resolvedPrinter,
            OrderService.buildPrintTicketPreview(cart, 'CUSTOMER')
        );
    };

    const receivePayment = async (
        payments: Array<{ type: string; amount: number }>
    ) => {
        if (!cart || busy) return;

        setBusy(true);
        try {
            const result = await dispatch(
                payOrder({
                    cart,
                    payments,
                    defaultPrinter,
                    storeInfo: store,
                    skipAutoPrint: !store,
                }) as any
            );

            if (!payOrder.fulfilled.match(result) || !result.payload) {
                Alert.alert(
                    t(
                        'ORDERPAYMENT_FailedTitle',
                        'Payment could not be completed'
                    ),
                    t(
                        'ORDERPAYMENT_FailedMessage',
                        'The order is still open. Please try again.'
                    )
                );
                return;
            }

            onClose();
        } finally {
            setBusy(false);
        }
    };

    if (!order || !cart || !orderSummary) {
        return null;
    }

    return (
        <Dialog
            isVisible={visible}
            onBackdropPress={closeDialog}
            supportedOrientations={['landscape']}
            presentationStyle="fullScreen"
            overlayStyle={[sharedStyles.overlay, styles.overlay]}
        >
            <View style={styles.surface} testID="open-order-payment-dialog">
                <View style={styles.columns}>
                    <View style={styles.summaryColumn}>
                        <OrderSummaryPanel
                            styles={summaryStyles}
                            orderSummary={orderSummary}
                            discountBreakdown={discountBreakdown}
                            title={t('ORDERPAYMENT_SummaryTitle', 'Order summary')}
                            hint={t(
                                'ORDERPAYMENT_SummaryHint',
                                'Review the order details before receiving payment.'
                            )}
                            scrollStyle={styles.summaryScroll}
                            scrollContentStyle={styles.summaryScrollContent}
                            contentTestID="open-order-payment-summary"
                            plain={true}
                            footer={
                                <View style={summaryStyles.summaryFooter}>
                                    <View style={summaryStyles.summaryFooterTotalBlock}>
                                        <Text style={summaryStyles.summaryFooterLabel}>
                                            {t('ORDERPAYMENT_Total', 'Total')}
                                        </Text>
                                        <Text style={summaryStyles.summaryFooterValue}>
                                            ${orderSummary.total.toFixed(2)}
                                        </Text>
                                    </View>
                                    <View style={summaryStyles.summaryFooterActions}>
                                        <Button
                                            testID="open-order-payment-print-button"
                                            onPress={printReference}
                                            type="clear"
                                            title={t(
                                                'ORDERPAYMENT_PrintReference',
                                                'Print reference'
                                            )}
                                            disabled={busy}
                                            buttonStyle={summaryStyles.summarySecondaryButton}
                                            titleStyle={
                                                summaryStyles.summarySecondaryButtonTitle
                                            }
                                        />
                                    </View>
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
                                onPaymentEntered={receivePayment}
                                layout="compact"
                                disableSubmit={busy}
                                footerActions={
                                    <View style={styles.secondaryActions}>
                                        <Button
                                            testID="open-order-payment-cancel-button"
                                            type="outline"
                                            title={t('ORDERPAYMENT_Close', 'Close')}
                                            disabled={busy}
                                            onPress={closeDialog}
                                            buttonStyle={styles.secondaryButton}
                                            titleStyle={styles.secondaryButtonTitle}
                                        />
                                        <Button
                                            testID="open-order-payment-open-in-sales-button"
                                            type="clear"
                                            title={t(
                                                'ORDERPAYMENT_OpenInSales',
                                                'Open in Sales'
                                            )}
                                            disabled={busy}
                                            onPress={openInSales}
                                            titleStyle={styles.openInSalesButtonTitle}
                                        />
                                    </View>
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
        openInSalesButtonTitle: {
            color: tokens.colors.accent,
            fontWeight: '700',
        },
    });

export default OpenOrderPaymentDialog;
