import { Order } from '@pos/shared/models';
import { useSharedStyles } from '@pos/theme/native';
import { Icon } from '@rneui/themed';
import React from 'react';

import { View, Text } from 'react-native';
import { OrderLineDetails } from './order-line-details';

/* eslint-disable-next-line */
export interface OrderDetailsProps {
    order: Order;
    productId: string | null;
}

export function OrderDetails({ order, productId }: OrderDetailsProps) {
    const styles = useSharedStyles();

    return (
        <View style={[styles.box, styles.column]}>
            <View style={styles.row}>
                <View style={[styles.column, { flex: 1.50, marginRight: 45 }]}>
                    <Text style={styles.secondaryText}>Order No.</Text>
                    <Text style={styles.primaryText}>{order.orderNo}</Text>
                </View>
                <View style={[styles.column, { flex: 1.5, marginRight: 45 }]}>
                    <Text style={styles.secondaryText}>Created By</Text>
                    <Text style={styles.primaryText}>{order.createdBy?.name}</Text>
                </View>
                <View style={[styles.column, styles.centered, { flex: .15, marginRight: 45 }]}>
                    <Icon name='arrow-right' type='material-community' size={16} />
                </View>
                <View style={[styles.column, { flex: 1.5, marginRight: 45 }]}>
                    <Text style={styles.secondaryText}>Closed By</Text>
                    <Text style={styles.primaryText}>{order.paymentInfo?.employeeName}</Text>
                </View>
                <View style={{ flex: .5 }}></View>
                <View style={[styles.column, { marginRight: 45 }]}>
                    <Text style={[styles.secondaryText, styles.textRight ]}>Total</Text>
                    <Text style={[styles.primaryText, styles.textWarning, styles.textBold ]}>$ {order.total.toFixed(2)}</Text>
                </View>
            </View>
            <View style={[styles.row, { marginRight: 26, marginTop: 10 }]}>
                <View style={{ flex: 2 }}>
                    <Text style={styles.secondaryText}>Payments</Text>
                    {order.paymentInfo?.payments?.map(p => (
                        <Text style={styles.primaryText}>{p?.type}: ${p?.amount.toFixed(2)}</Text>
                    ))}
                </View>
                <View style={[styles.box, { flex: 6 }]}>
                    <View style={[styles.row]}>
                        <Text style={[styles.secondaryText, styles.textRight, { flex: 1, marginRight: 30 }]}>Quantity</Text>
                        <Text style={[styles.secondaryText, { flex: 3 }]}>Name</Text>
                        <Text style={[styles.secondaryText, styles.textRight, { flex: 1 }]}>Price</Text>
                        <Text style={[styles.secondaryText, styles.textRight, { flex: 1 }]}>Total</Text>
                    </View>
                    {order.lines.map(l => !l ? null : <OrderLineDetails key={l.identifier} line={l} productId={productId} />)}
                </View>
            </View>
        </View>
    );
}

export default OrderDetails;
