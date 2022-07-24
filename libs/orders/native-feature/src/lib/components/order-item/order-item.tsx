import React, { useState } from 'react';

import { View, Text, Alert, ActivityIndicator } from 'react-native';
import { useSharedStyles } from '@pos/theme/native';
import { Button, useTheme } from '@rneui/themed';
import {
    ordersActions,
    OrderEntity,
    OrderService,
    OrderEntityMapper,
} from '@pos/orders/data-access';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { cartActions } from '@pos/sales/data-access';
import { getDefaultPrinter, printReceipt } from '@pos/printings/data-access';
import { selectStore } from '@pos/store-info/data-access';
import { Role } from '@pos/auth/data-access';
import { selectLoginEmployee } from '@pos/employees/data-access';

export interface OrderItemProps {
    item: OrderEntity;
    navigation?: NativeStackNavigationProp<any>;
    onVoid: (order: OrderEntity) => void;
}

export function OrderItem({ item, navigation, onVoid }: OrderItemProps) {
    const theme = useTheme();
    const styles = useSharedStyles();
    const dispatch = useDispatch();
    const defaultPrinter = useSelector(getDefaultPrinter);
    const employee = useSelector(selectLoginEmployee);
    const store = useSelector(selectStore);
    const [busy, setBusy] = useState<boolean>(false);

    const deleteItem = async () => {
        if (!item.id) return;

        setBusy(true);
        await OrderService.delete(item.id);
        setBusy(false);
        dispatch(ordersActions.remove(item.id));
    };

    const openItem = async () => {
        dispatch(cartActions.set({...item}));
        navigation?.navigate('Sales', { mode: 'payment' });
    };

    const printItem = async () => {
        if (!store || !defaultPrinter) {
            Alert.alert(
                'Store info and printer setup needs ro be ready before closing an order'
            );
            return;
        }

        printReceipt(
            store,
            defaultPrinter,
            OrderEntityMapper.asCartState(item),
            item
        );
    };

    const confirmDeletion = () => {
        Alert.alert(
            'Are you sure?',
            'You will not be able to undo this operation',
            [{ text: 'No' }, { text: 'Yes', onPress: () => deleteItem() }]
        );
    };

    const orderDate = new Date(item.orderDate!);
    const orderDateString = `${orderDate.toLocaleDateString()} ${orderDate.toLocaleTimeString()}`;

    return (
        <View style={styles.dataRow}>
            {busy && <ActivityIndicator size="small" />}
            <View style={{ flex: 2 }}>
                <Text style={[styles.name, { textAlign: 'center' }]}>
                    {item.orderNo}
                </Text>
                {item.status === 'PAID' &&
                <Text style={[styles.name, { textAlign: 'center' }]}>
                        <Text style={styles.secondaryText}>By: {item?.paymentInfo?.employeeName || 'N/A'}</Text>
                </Text>
                }
                {item.status === 'REFUNDED' &&
                <Text style={[styles.name, { textAlign: 'center' }]}>
                        <Text style={styles.secondaryText}>By: {item?.refundInfo?.employeeName || 'N/A'}</Text>
                </Text>
                }
            </View>
            <View style={{ flex: 3 }}>
                <Text style={styles.primaryText}>{item.employeeName}</Text>
                <Text style={styles.secondaryText}>{orderDateString}</Text>
            </View>
            {/* <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.items?.length} item(s)</Text>
            </View> */}
            <View style={{ flex: 1 }}>
                <Text style={[styles.name, { textAlign: 'right' }]}>
                    {`$ ${item.total.toFixed(2)}`}
                </Text>
            </View>
            <View style={{ flex: 1 }}></View>
            <View
                style={{
                    flex: 2,
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                }}
            >
                {item.status === 'OPEN' && (
                    <Button
                        type="clear"
                        title="Charge"
                        icon={{
                            name: 'folder-open-outline',
                            type: 'material-community',
                            color: theme.theme.colors.primary,
                        }}
                        titleStyle={{ paddingRight: 10 }}
                        onPress={openItem}
                    />
                )}
                {item.status === 'PAID' && (
                    <>
                        { employee?.roles.includes(Role.VoidOrder) &&
                        <Button
                            type="clear"
                            title="Void"
                            icon={{
                                name: 'close-circle-outline',
                                type: 'material-community',
                                color: theme.theme.colors.primary,
                            }}
                            titleStyle={{ paddingRight: 10 }}
                            onPress={() => onVoid(item)}
                        />
                        }
                        <Button
                            type="clear"
                            title="Print"
                            icon={{
                                name: 'printer-outline',
                                type: 'material-community',
                                color: theme.theme.colors.primary,
                            }}
                            titleStyle={{ paddingRight: 10 }}
                            onPress={printItem}
                        />
                    </>
                )}
                { employee?.roles.includes(Role.RemoveSale) &&
                <Button
                    type="clear"
                    icon={{
                        name: 'trash-can',
                        type: 'material-community',
                        color: theme.theme.colors.error,
                    }}
                    onPress={confirmDeletion}
                />
                }
            </View>
        </View>
    );
}

export default OrderItem;
