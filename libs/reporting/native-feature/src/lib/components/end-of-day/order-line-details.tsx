import { OrderLine } from '@pos/shared/models';
import { useSharedStyles } from '@pos/theme/native';
import { EACH } from '@pos/unit-of-measures/data-access';
import React from 'react';

import { View, Text } from 'react-native';

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
        line.lineTotalAfterTax ?? line.lineTotalBeforeTax ?? originalLineTotal
    );
    const discountAmount = Math.max(
        0,
        Number(line.lineDiscountTotal || 0) +
            Number(line.allocatedOrderDiscountTotal || 0)
    );
    return (
        <View>
            <View style={styles.row}>
                <Text style={[textStyle, styles.textRight, { flex: 1, marginRight: 30 }]}>
                    {line.unitOfMeasure === EACH ? line.quantity : line.quantity.toFixed(2)}
                </Text>
                <Text style={[textStyle, { flex: 3 }]}>
                    {line.productName} ({line.unitOfMeasure})
                </Text>
                <Text style={[textStyle, styles.textRight, { flex: 1 }]}>
                    $ {line.price.toFixed(2)}
                </Text>
                <Text style={[textStyle, styles.textRight, { flex: 1 }]}>
                    $ {finalLineTotal.toFixed(2)}
                </Text>
            </View>
            {discountAmount > 0 && (
                <View style={styles.row}>
                    <Text style={[styles.secondaryText, { flex: 5, textAlign: 'right' }]}>
                        Discount
                    </Text>
                    <Text
                        style={[
                            styles.secondaryText,
                            styles.textRight,
                            { flex: 1, color: '#8BC34A' },
                        ]}
                    >
                        - $ {discountAmount.toFixed(2)}
                    </Text>
                </View>
            )}
            {refundedAmount > 0 && (
                <View style={styles.row}>
                    <Text style={[styles.secondaryText, { flex: 5, textAlign: 'right' }]}>
                        Refund
                    </Text>
                    <Text
                        style={[
                            styles.secondaryText,
                            styles.textRight,
                            { color: '#f59e0b' },
                            { flex: 1 },
                        ]}
                    >
                        - $ {refundedAmount.toFixed(2)}
                    </Text>
                </View>
            )}
        </View>
    );
}

export default OrderLineDetails;
