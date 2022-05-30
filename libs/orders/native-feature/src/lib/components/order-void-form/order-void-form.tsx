import React, { useEffect, useState } from 'react';

import { View, Text, Alert, FlatList } from 'react-native';
import { useSharedStyles } from '@pos/theme/native';
import { OrderEntity, OrderLineEntity } from '@pos/orders/data-access';
import OrderVoidableItem from '../order-voidable-item/order-voidable-item';
import { Button, useTheme } from '@rneui/themed';

export interface OrderItemProps {
    order: OrderEntity;
}

export function OrderVoidForm({ order }: OrderItemProps) {
    const theme = useTheme();
    const styles = useSharedStyles();
    const [refundAmount, setRefundAmount] = useState<number>(0);
    const [newTotal, setNewTotal] = useState<number>(0);

    // const deleteItem = async () => {
    //     if (!item.id) return;

    //     setBusy(true);
    //     await OrderService.delete(item.id);
    //     setBusy(false);
    //     dispatch(ordersActions.remove(item.id));
    // };

    const onItemToggle = (line: OrderLineEntity, selected: boolean) => {
        const subtotal = line.price * line.quantity;
        if (selected) {
            setRefundAmount(refundAmount - subtotal);
        } else {
            setRefundAmount(refundAmount + subtotal);
        }
    }

    const confirmVoid = () => {
        Alert.alert(
            'Are you sure?',
            'You will not be able to undo this operation',
            [
                { text: 'No' },
                { text: 'Yes', onPress: () => console.log('confirming') },
            ]
        );
    };

    useEffect(() => {
        setNewTotal(order.total + refundAmount);
    }, [order, refundAmount]);

    return (
        <View
            style={
                (styles.pageBackground,
                { height: 500, flexDirection: 'column' })
            }
        >
            <View style={{ flex: 9 }}>
                <FlatList
                    horizontal={false}
                    data={order.items}
                    renderItem={(data) => (
                        <OrderVoidableItem
                            line={data.item}
                            onToggle={onItemToggle}
                        />
                    )}
                    style={{
                        flex: 1,
                        flexDirection: 'column',
                    }}
                />
            </View>

            <View style={[styles.dataRow, { flex: 1 }]}>
                <View
                    style={{
                        flex: 2,
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                    }}
                >
                    <Text style={[styles.secondaryText, { fontSize: 14 }]}>
                        Original Total:
                    </Text>
                    <Text
                        style={[
                            styles.primaryText,
                            styles.textRight,
                            { fontSize: 24, fontWeight: 'bold' },
                        ]}
                    >
                        $ {order.total.toFixed(2)}
                    </Text>
                </View>
                <View
                    style={{
                        flex: 2,
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                    }}
                >
                    <Text style={[styles.secondaryText, { fontSize: 14 }]}>
                        To Refund:
                    </Text>
                    <Text
                        style={[
                            styles.textRight,
                            {
                                fontSize: 24,
                                fontWeight: 'bold',
                                color: theme.theme.colors.error,
                            },
                        ]}
                    >
                        $ {(refundAmount * -1).toFixed(2)}
                    </Text>
                </View>
                <View
                    style={{
                        flex: 2,
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                    }}
                >
                    <Text style={[styles.secondaryText, { fontSize: 14 }]}>
                        New Total:
                    </Text>
                    <Text
                        style={[
                            styles.textRight,
                            {
                                fontSize: 24,
                                fontWeight: 'bold',
                                color: theme.theme.colors.success,
                            },
                        ]}
                    >
                        $ {newTotal.toFixed(2)}
                    </Text>
                </View>
                <View style={{ flex: 2, paddingLeft: 60 }}>
                    <Button
                        title="Save"
                        icon={{
                            name: 'check',
                            type: 'material-community',
                            color: styles.primaryText.color,
                        }}
                    />
                </View>
            </View>
        </View>
    );
}

export default OrderVoidForm;
