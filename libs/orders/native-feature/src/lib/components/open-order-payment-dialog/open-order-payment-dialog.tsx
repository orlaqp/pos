import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button } from '@rneui/themed';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';

import {
    OrderEntity,
    OrderEntityMapper,
    OrderService,
    payOrder,
} from '@pos/orders/data-access';
import { cartActions } from '@pos/sales/data-access';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { CartPaymentDialog } from '../../../../../../sales/native-feature/src/lib/components/cart-payment/cart-payment-dialog';
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
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import { translateWithFallback } from '@pos/shared/utils';

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
    const tokens = useDesignTokens();
    const styles = useStyles(tokens);
    const defaultPrinter = useSelector(getDefaultPrinter);
    const store = useSelector(selectStore);
    const employee = useSelector(selectLoginEmployee);
    const [busy, setBusy] = useState(false);
    const t = translateWithFallback;

    const cart = useMemo(
        () => (order ? OrderEntityMapper.asCartState(order) : undefined),
        [order],
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
                    printer
                        ? PrinterEntityMapper.fromModel(printer)
                        : undefined,
                )
                .catch(() => undefined));

        if (!resolvedStore || !resolvedPrinter) {
            Alert.alert(
                t(
                    'ORDERPAYMENT_PrintRequirements',
                    'Store info and printer setup need to be ready before printing a reference.',
                ),
            );
            return;
        }

        await printReceipt(
            resolvedStore,
            resolvedPrinter,
            OrderService.buildPrintTicketPreview(cart, 'CUSTOMER'),
        );
    };

    const receivePayment = async (
        payments: Array<{ type: string; amount: number }>,
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
                }) as any,
            );

            if (!payOrder.fulfilled.match(result) || !result.payload) {
                Alert.alert(
                    t(
                        'ORDERPAYMENT_FailedTitle',
                        'Payment could not be completed',
                    ),
                    t(
                        'ORDERPAYMENT_FailedMessage',
                        'The order is still open. Please try again.',
                    ),
                );
                return;
            }

            onClose();
        } finally {
            setBusy(false);
        }
    };

    if (!order || !cart) {
        return null;
    }

    return (
        <CartPaymentDialog
            visible={visible}
            cart={cart}
            canReceiveChecks={canReceiveChecks}
            busy={busy}
            onClose={closeDialog}
            onPaymentEntered={receivePayment}
            summaryActions={
                <Button
                    testID="open-order-payment-print-button"
                    onPress={printReference}
                    type="clear"
                    title={t('ORDERPAYMENT_PrintReference', 'Print reference')}
                    disabled={busy}
                    buttonStyle={styles.summarySecondaryButton}
                    titleStyle={styles.summarySecondaryButtonTitle}
                />
            }
            paymentFooterActions={
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
                        title={t('ORDERPAYMENT_OpenInSales', 'Open in Sales')}
                        disabled={busy}
                        onPress={openInSales}
                        titleStyle={styles.openInSalesButtonTitle}
                    />
                </View>
            }
        />
    );
}

const useStyles = (tokens: ReturnType<typeof useDesignTokens>) =>
    StyleSheet.create({
        summarySecondaryButton: {
            minHeight: 44,
            borderRadius: 16,
            paddingHorizontal: tokens.spacing.sm,
        },
        summarySecondaryButtonTitle: {
            color: tokens.colors.accent,
            fontWeight: '700',
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
