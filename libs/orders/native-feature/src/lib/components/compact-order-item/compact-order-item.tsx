import React from 'react';

import { View, Text, TouchableOpacity } from 'react-native';
import { useSharedStyles } from '@pos/theme/native';
import { OrderEntity } from '@pos/orders/data-access';
import { useDispatch } from 'react-redux';
import { cartActions } from '@pos/sales/data-access';

export interface CompactOrderItemProps {
    item: OrderEntity;
    onSelect: () => void;
}

export function CompactOrderItem({ item, onSelect: onOpen }: CompactOrderItemProps) {
    const styles = useSharedStyles();
    const dispatch = useDispatch();

    const openInCart = async () => {
        dispatch(cartActions.set({ ...item }));
        onOpen();
    };

    return (
        <TouchableOpacity style={styles.dataRow} onPress={openInCart}>
            <View style={{ flex: 3 }}>
                <Text style={styles.name}>{item.orderNo}</Text>
            </View>
            <View style={{ flex: 2 }}>
                <Text style={styles.name}>{item.employeeName}</Text>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.lines?.length} item(s)</Text>
            </View>
            <View style={{ flex: 1.5 }}>
                <Text style={[styles.name, { textAlign: 'right' }]}>
                    {`$ ${item.total.toFixed(2)}`}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

export default CompactOrderItem;
