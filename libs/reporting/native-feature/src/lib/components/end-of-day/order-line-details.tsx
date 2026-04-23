import { OrderLine } from '@pos/shared/models';
import { useSharedStyles } from '@pos/theme/native';
import { EACH } from '@pos/unit-of-measures/data-access';
import React from 'react';

import { View, Text, StyleSheet } from 'react-native';

/* eslint-disable-next-line */
export interface OrderLineDetailsProps {
    line: OrderLine;
    productId: string | null;
    refundedAmount?: number;
}

export function OrderLineDetails({
    line,
    productId,
    refundedAmount = 0,
}: OrderLineDetailsProps) {
    const styles = useSharedStyles();
    const highlightProduct = !productId || line.productId === productId;
    const textStyle = highlightProduct ? styles.primaryText : styles.secondaryText;
    const originalLineTotal = Number(line.quantity || 0) * Number(line.price || 0);
    const finalLineTotal = Number(
        (line.lineTotalBeforeTax ?? line.lineTotalAfterTax ?? originalLineTotal) +
            Number(line.allocatedOrderDiscountTotal || 0)
    );
    const discountAmount = Math.max(0, Number(line.lineDiscountTotal || 0));
    return (
        <View>
            <View style={[styles.row, local.itemRow]}>
                <Text style={[textStyle, styles.textRight, local.qtyColumn]}>
                    {line.unitOfMeasure === EACH ? line.quantity : line.quantity.toFixed(2)}
                </Text>
                <Text style={[textStyle, local.nameColumn]}>
                    {line.productName} ({line.unitOfMeasure})
                </Text>
                <Text style={[textStyle, styles.textRight, local.moneyColumn]}>
                    $ {line.price.toFixed(2)}
                </Text>
                <Text style={[textStyle, styles.textRight, local.moneyColumn]}>
                    $ {finalLineTotal.toFixed(2)}
                </Text>
            </View>
            {discountAmount > 0 && (
                <View style={[styles.row, local.adjustmentRow]}>
                    <Text style={[styles.secondaryText, local.adjustmentLabel]}>
                        Discount
                    </Text>
                    <Text
                        style={[
                            styles.secondaryText,
                            styles.textRight,
                            local.discountValue,
                        ]}
                    >
                        - $ {discountAmount.toFixed(2)}
                    </Text>
                </View>
            )}
            {refundedAmount > 0 && (
                <View style={[styles.row, local.adjustmentRow]}>
                    <Text style={[styles.secondaryText, local.adjustmentLabel]}>
                        Refund
                    </Text>
                    <Text
                        style={[
                            styles.secondaryText,
                            styles.textRight,
                            local.refundValue,
                        ]}
                    >
                        - $ {refundedAmount.toFixed(2)}
                    </Text>
                </View>
            )}
        </View>
    );
}

const local = StyleSheet.create({
    itemRow: {
        paddingVertical: 2,
    },
    qtyColumn: {
        flex: 1,
        marginRight: 30,
    },
    nameColumn: {
        flex: 3,
    },
    moneyColumn: {
        flex: 1,
    },
    adjustmentRow: {
        marginTop: 1,
        paddingBottom: 2,
    },
    adjustmentLabel: {
        flex: 5,
        textAlign: 'right',
        paddingRight: 14,
        paddingLeft: 24,
        fontSize: 12,
        color: '#8f9aab',
    },
    discountValue: {
        flex: 1,
        color: '#8BC34A',
        fontSize: 12,
    },
    refundValue: {
        flex: 1,
        color: '#f59e0b',
        fontSize: 12,
    },
});

export default OrderLineDetails;
