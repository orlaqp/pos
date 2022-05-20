
import React, { useState } from 'react';

import { View, Text, Alert, ActivityIndicator } from 'react-native';
import { useSharedStyles } from '@pos/theme/native';
import { Button, useTheme } from '@rneui/themed';
import { ordersActions, OrderEntity, OrderService } from '@pos/orders/data-access';
import { useDispatch } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format, formatDistance, formatRelative, subDays } from 'date-fns'


export interface OrderItemProps {
    item: OrderEntity;
    navigation: NativeStackNavigationProp<any>;
}

export function OrderItem({ item, navigation }: OrderItemProps) {
    const theme = useTheme();
    const styles = useSharedStyles();
    const dispatch = useDispatch();
    const [busy, setBusy] = useState<boolean>(false);

    const deleteItem = async () => {
        if (!item.id) return;

        setBusy(true);
        await OrderService.delete(item.id);
        setBusy(false);
        dispatch(ordersActions.remove(item.id));

    }

    const editItem = () => {
        dispatch(ordersActions.select(item));
        navigation.navigate('Order Form');
    }

    const confirmDeletion = () => {
        Alert.alert(
            'Are you sure?',
            'You will not be able to undo this operation',
            [
                { text: 'No' },
                { text: 'Yes', onPress: () => deleteItem() },
            ]
        );
    }

    return (
        <View style={styles.dataRow}>
            { busy &&
            <ActivityIndicator size='small' />
            }
            <View style={{ flex: 1.5 }}>
                <Text style={styles.name}>{`${item.id.substring(0, 8)}...`}</Text>
            </View>
            <View style={{ flex: 3 }}>
                <Text style={styles.name}>
                    {new Date(item.createdAt!).toLocaleString()}
                </Text>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.status}</Text>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.items?.length}</Text>
            </View>
            <View style={{ flex: 3 }}>
                <Text style={styles.name}>{`$ ${item.total.toFixed(2)}`}</Text>
            </View>
            <View
                style={{
                    flex: 2,
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                }}
            >
                <Button
                    type="clear"
                    title="Edit"
                    icon={{
                        name: 'pencil-outline',
                        type: 'material-community',
                    }}
                    onPress={editItem}
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
