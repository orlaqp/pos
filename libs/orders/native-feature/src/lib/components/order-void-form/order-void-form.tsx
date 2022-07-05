import React, { useEffect, useState } from 'react';

import { View, Text, Alert, FlatList } from 'react-native';
import { useSharedStyles } from '@pos/theme/native';
import {
    OrderEntity,
    OrderLineEntity,
    OrderService,
} from '@pos/orders/data-access';
import OrderVoidableItem from '../order-voidable-item/order-voidable-item';
import { Button, useTheme } from '@rneui/themed';
import { EACH } from '@pos/unit-of-measures/data-access';
import { useSelector } from 'react-redux';
import { selectLoginEmployee } from '@pos/employees/data-access';

export interface OrderItemProps {
    order: OrderEntity;
    onRefundComplete: () => void;
}

export function OrderVoidForm({ order, onRefundComplete }: OrderItemProps) {
    const theme = useTheme();
    const styles = useSharedStyles();
    const [refundAmount, setRefundAmount] = useState<number>(0);
    const [itemList, setItemList] = useState<OrderLineEntity[]>([]);
    const [newTotal, setNewTotal] = useState<number>(0);
    const [linesToRefund, setLinesToRefund] = useState<OrderLineEntity[]>([]);
    const [busy, setBusy] = useState<boolean>(false);
    const employee = useSelector(selectLoginEmployee);

    const onItemToggle = (line: OrderLineEntity, selected: boolean) => {
        if (selected) {
            setLinesToRefund((list) => [...list, line]);
        } else {
            const newItems = [...linesToRefund];
            newItems.splice(newItems.indexOf(line), 1);
            setLinesToRefund((list) => [...newItems]);
        }
    };

    const processRefund = async () => {
        debugger;
        if (!employee) {
            Alert.alert('Error', 'Refund is not possible because no login employee was found');
            return;
        }

        setBusy(true);
        await OrderService.refund(
            employee,
            order,
            linesToRefund.map((l) => ({
                id: l.id!,
                price: l.price,
                quantity: l.quantity,
            }))
        );
        setBusy(false);
        onRefundComplete();
    };

    const confirmRefund = () => {
        Alert.alert(
            'Are you sure?',
            'You will not be able to undo this operation',
            [{ text: 'No' }, { text: 'Yes', onPress: processRefund }]
        );
    };

    useEffect(() => {
        const refundAmount = linesToRefund.reduce(
            (prev, next) => prev + next.price * next.quantity,
            0
        );

        setRefundAmount(-1 * refundAmount);
        setNewTotal(order.total - refundAmount);
    }, [order, linesToRefund]);

    useEffect(() => {
        const spreadLines: OrderLineEntity[] = [];
        order.lines?.forEach((line) => {
            if (line.unitOfMeasure === EACH) {
                for (let i = 0; i < line.quantity; i++) {
                    spreadLines.push({ ...line, quantity: 1 });
                }
            } else {
                spreadLines.push(line);
            }
        });

        setItemList(spreadLines);
    }, [order]);

    return (
        <View
            style={
                (styles.pageBackground,
                { height: 500, flexDirection: 'column', margin: 20 })
            }
        >
            <View style={{ flex: 9 }}>
                <FlatList
                    horizontal={false}
                    data={itemList}
                    renderItem={(data) => (
                        <OrderVoidableItem
                            key={data.index}
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
                        Original Amount:
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
                        Refund Amount:
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
                        New Amount:
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
                        title="Process"
                        icon={{
                            name: 'check',
                            type: 'material-community',
                            color:
                                refundAmount === 0
                                    ? theme.theme.colors.grey2
                                    : styles.primaryText.color,
                        }}
                        disabled={refundAmount === 0}
                        loading={busy}
                        onPress={confirmRefund}
                    />
                </View>
            </View>
        </View>
    );
}

export default OrderVoidForm;
