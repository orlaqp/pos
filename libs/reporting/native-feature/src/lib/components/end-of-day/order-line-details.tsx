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

    return (
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
                $ {(line.quantity * line.price).toFixed(2)}
            </Text>
        </View>
    );
}

export default OrderLineDetails;
