import { OrderLine } from '@pos/shared/models';
import { useSharedStyles } from '@pos/theme/native';
import { EACH } from '@pos/unit-of-measures/data-access';
import React from 'react';

import { View, Text } from 'react-native';

/* eslint-disable-next-line */
export interface OrderLineDetailsProps {
    line: OrderLine;
}

export function OrderLineDetails({ line }: OrderLineDetailsProps) {
    const styles = useSharedStyles();

    return (
        <View style={styles.row}>
            <Text style={[styles.primaryText, styles.textRight, { flex: 1, marginRight: 30 }]}>
                {line.unitOfMeasure === EACH ? line.quantity : line.quantity.toFixed(2)}
            </Text>
            <Text style={[styles.primaryText, { flex: 3 }]}>
                {line.productName} ({line.unitOfMeasure})
            </Text>
            <Text style={[styles.primaryText, styles.textRight, { flex: 1 }]}>
                $ {line.price.toFixed(2)}
            </Text>
            <Text style={[styles.primaryText, styles.textRight, { flex: 1 }]}>
                $ {(line.quantity * line.price).toFixed(2)}
            </Text>
        </View>
    );
}

export default OrderLineDetails;
