import { Order } from '@pos/shared/models';
import { useSharedStyles } from '@pos/theme/native';
import { Icon } from '@rneui/themed';
import React from 'react';

import { View, Text } from 'react-native';
import { OrderLineDetails } from './order-line-details';

/* eslint-disable-next-line */
export interface OrderDetailsProps {
    order: Order;
}

export function OrderDetails({ order }: OrderDetailsProps) {
    const styles = useSharedStyles();

    return (
        <View style={[styles.box, styles.column]}>
            <View style={styles.row}>
                <View style={[styles.column, { flex: 1.30, marginRight: 45 }]}>
                    <Text style={styles.secondaryText}>Order No.</Text>
                    <Text style={styles.primaryText}>{order.orderNo}</Text>
                </View>
                <View style={[styles.column, { flex: 1, marginRight: 45 }]}>
                    <Text style={styles.secondaryText}>Created By</Text>
                    <Text style={styles.primaryText}>{order.createdBy?.name}</Text>
                </View>
                <View style={[styles.column, styles.centered, { flex: .15, marginRight: 45 }]}>
                    <Icon name='arrow-right' type='material-community' size={16} />
                </View>
                <View style={[styles.column, { flex: 1, marginRight: 45 }]}>
                    <Text style={styles.secondaryText}>Received By</Text>
                    <Text style={styles.primaryText}>{order.paymentInfo?.employeeName}</Text>
                </View>
                <View style={{ flex: .5 }}></View>
                <View style={[styles.column, { marginRight: 45 }]}>
                    <Text style={[styles.secondaryText, styles.textRight ]}>Total</Text>
                    <Text style={[styles.primaryText, styles.textSuccess, styles.textBold ]}>$ {order.total.toFixed(2)}</Text>
                </View>
            </View>
            <View style={[styles.box, { marginLeft: 200, marginRight: 26, marginTop: 10 }]}>
                <View style={styles.row}>
                    <Text style={[styles.secondaryText, { flex: 1 }]}>Quantity</Text>
                    <Text style={[styles.secondaryText, { flex: 3 }]}>Name</Text>
                    <Text style={[styles.secondaryText, styles.textRight, { flex: 1 }]}>Price</Text>
                    <Text style={[styles.secondaryText, styles.textRight, { flex: 1 }]}>Total</Text>
                </View>
                {order.lines.map(l => !l ? null : <OrderLineDetails key={l.identifier} line={l} />)}
            </View>
        </View>
    );
}

export default OrderDetails;
