import React from 'react';
import { Text, View } from 'react-native';
import { Button, Dialog } from '@rneui/themed';
import { isE2EEnabled } from '@pos/shared/utils';
import { CartStyles } from './cart.styles';
import { OrderSummaryPanel } from './order-summary-panel';

interface CartOrderSummaryDialogProps {
    visible: boolean;
    styles: CartStyles;
    overlayStyle: object;
    orderSummary: any;
    discountBreakdown: Array<{
        discountApplicationId: string;
        name: string;
        discountAmount: number;
        scope: 'LINE' | 'ORDER';
    }>;
    onClose: () => void;
    onConfirm: () => void;
}

export function CartOrderSummaryDialog({
    visible,
    styles,
    overlayStyle,
    orderSummary,
    discountBreakdown,
    onClose,
    onConfirm,
}: CartOrderSummaryDialogProps) {
    return (
        <Dialog
            isVisible={visible}
            onBackdropPress={onClose}
            supportedOrientations={['landscape']}
            presentationStyle="fullScreen"
            overlayStyle={overlayStyle}
        >
            <OrderSummaryPanel
                styles={styles}
                orderSummary={orderSummary}
                discountBreakdown={discountBreakdown}
                footer={
                    <View style={styles.summaryFooter}>
                        <View style={styles.summaryFooterTotalBlock}>
                            <Text style={styles.summaryFooterLabel}>Total</Text>
                            <Text style={styles.summaryFooterValue}>
                                ${orderSummary.total.toFixed(2)}
                            </Text>
                        </View>
                        <View style={styles.summaryFooterActions}>
                            {typeof __DEV__ !== 'undefined' && __DEV__ && isE2EEnabled() ? (
                                <Button
                                    testID="order-summary-print-e2e-shortcut"
                                    type="clear"
                                    title="E2E Print"
                                    onPress={onConfirm}
                                />
                            ) : null}
                            <Button
                                type="clear"
                                title="Back to cart"
                                onPress={onClose}
                                buttonStyle={styles.summarySecondaryButton}
                                titleStyle={styles.summarySecondaryButtonTitle}
                            />
                            <Button
                                testID="order-summary-print-button"
                                onPress={onConfirm}
                                icon={{
                                    name: 'printer',
                                    type: 'material-community',
                                    color: '#ffffff',
                                    size: 22,
                                }}
                                buttonStyle={styles.summaryPrimaryIconButton}
                            />
                        </View>
                    </View>
                }
            />
        </Dialog>
    );
}
