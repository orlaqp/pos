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

export interface OrderItemProps {
    item: OrderEntity;
    navigation: NativeStackNavigationProp<any>;
}

export function OrderItem({ item, navigation }: OrderItemProps) {
    const theme = useTheme();
    const styles = useSharedStyles();
    const dispatch = useDispatch();
    const defaultPrinter = useSelector(getDefaultPrinter);
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
        if (item.status === 'OPEN') {
            const orderLines = await OrderService.getLines(item);
            dispatch(cartActions.set({
                ...item,
                items: orderLines
            }));
            navigation.navigate('Sales', { mode: 'payment' });
        }

        if (item.status === 'PAID') {
            if (!store || !defaultPrinter) {
                Alert.alert('Store info and printer setup needs ro be ready before closing an order');
                return;
            }

            printReceipt(
                store,
                defaultPrinter,
                OrderEntityMapper.asCartState(item),
                item
            );
        }
    };

    const confirmDeletion = () => {
        Alert.alert(
            'Are you sure?',
            'You will not be able to undo this operation',
            [{ text: 'No' }, { text: 'Yes', onPress: () => deleteItem() }]
        );
    };

    return (
        <View style={styles.dataRow}>
            {busy && <ActivityIndicator size="small" />}
            <View style={{ flex: 1.5 }}>
                <View
                    style={{
                        marginHorizontal: 10,
                        padding: 5,
                        borderRadius: 50,
                        backgroundColor: theme.theme.colors.primary,
                    }}
                >
                    <Text
                        style={{
                            textAlign: 'center',
                            color: theme.theme.colors.grey0,
                        }}
                    >
                        {item.status}
                    </Text>
                </View>
            </View>
            <View style={{ flex: 2 }}>
                <Text
                    style={[styles.name, { textAlign: 'center' }]}
                >{`${item.id.substring(0, 8)}...`}</Text>
            </View>
            <View style={{ flex: 3 }}>
                <Text style={styles.name}>
                    {new Date(item.createdAt!).toLocaleString()}
                </Text>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.items?.length} item(s)</Text>
            </View>
            <View style={{ flex: 3 }}>
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
                <Button
                    type="outline"
                    title={item.status === 'OPEN' ? 'Open' : 'Print'}
                    icon={{
                        name:
                            item.status === 'OPEN'
                                ? 'folder-open-outline'
                                : 'printer-outline',
                        type: 'material-community',
                        color: theme.theme.colors.primary,
                    }}
                    titleStyle={{ paddingRight: 10 }}
                    onPress={openItem}
                />
                <Button
                    type="clear"
                    icon={{
                        name: 'trash-can',
                        type: 'material-community',
                        color: theme.theme.colors.error,
                    }}
                    onPress={confirmDeletion}
                />
            </View>
        </View>
    );
}

export default OrderItem;
