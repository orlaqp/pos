import { OrderLine } from '@pos/shared/models';
import { useSharedStyles } from '@pos/theme/native';
import { EACH } from '@pos/unit-of-measures/data-access';
import React from 'react';

import { View, Text } from 'react-native';

/* eslint-disable-next-line */
export interface OrderLineDetailsProps {
    line: OrderLine;
    productId: string | null;
}

export function OrderLineDetails({ line, productId }: OrderLineDetailsProps) {
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
                    <Text style={[styles.secondaryText, { flex: 4 }]} />
                    <Text style={[styles.secondaryText, { flex: 1, textAlign: 'right' }]}>
                        Orig. $ {originalLineTotal.toFixed(2)}
                    </Text>
                    <Text
                        style={[
                            styles.secondaryText,
                            { flex: 1, textAlign: 'right', color: '#8BC34A' },
                        ]}
                    >
                        Disc. $ {discountAmount.toFixed(2)}
                    </Text>
                </View>
            )}
        </View>
    );
}

export default OrderLineDetails;
