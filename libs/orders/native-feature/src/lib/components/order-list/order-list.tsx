import React, { useEffect, useState } from 'react';
import {
    OrderEntity,
    ordersActions,
    selectFilteredList,
    subscribeToOrderChanges,
} from '@pos/orders/data-access';
import { UIEmptyState, UISearchInput } from '@pos/shared/ui-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import OrderItem from '../order-item/order-item';
import { useSharedStyles } from '@pos/theme/native';
import { View, StyleSheet, FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { ButtonGroup, Dialog, useTheme } from '@rneui/themed';
import { OrderStatus } from '@pos/shared/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import OrderVoidForm from '../order-void-form/order-void-form';

export interface OrderListProps {
    navigation?: NativeStackNavigationProp<any>;
}

export function OrderList({ navigation }: OrderListProps) {
    const theme = useTheme();
    const styles = useStyles();
    const dispatch = useDispatch();
    const [filterText, setFilterText] = useState<string>();
    const [orderToVoid, setOrderToVoid] = useState<OrderEntity | undefined>(0);
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const items = useSelector(selectFilteredList);
    const statusButtons: OrderStatus[] = [
        OrderStatus.OPEN,
        OrderStatus.PAID,
        OrderStatus.REFUNDED,
    ];

    useEffect(() => {
        const ordersSub = subscribeToOrderChanges(dispatch);
        return () => {
            console.log('Closing orders subscription');
            ordersSub.unsubscribe();
        };
    }, [dispatch]);

    const filter = (statusIndex: number, filter?: string) => {
        setSelectedIndex(statusIndex);
        setFilterText(filter);
        dispatch(
            ordersActions.filter({ status: statusButtons[statusIndex], filter })
        );
    };

    return (
        <SafeAreaView style={styles.page}>
            <View style={{ flexDirection: 'column' }}>
                <View style={[styles.header, { alignItems: 'center' }]}>
                    <View style={{ flex: 4 }}>
                        <ButtonGroup
                            buttons={statusButtons}
                            selectedIndex={selectedIndex}
                            onPress={(value) => filter(value, filterText)}
                            containerStyle={[
                                styles.page,
                                {
                                    borderWidth: 1,
                                    borderColor: theme.theme.colors.grey4,
                                },
                            ]}
                        />
                    </View>
                    <View style={{ flex: 4 }}>
                        <UISearchInput
                            debounceTime={300}
                            onSubmit={(text) => filter(selectedIndex, text)}
                        />
                    </View>
                </View>
                <View style={{ paddingHorizontal: 20, height: '90%' }}>
                    {items?.length === 0 && (
                        <UIEmptyState text="No orders found" />
                    )}
                    {items?.length > 0 && (
                        <FlatList
                            data={items}
                            renderItem={({ item }) => (
                                <OrderItem
                                    navigation={navigation}
                                    item={item}
                                    onVoid={(order) => setOrderToVoid(order)}
                                />
                            )}
                        />
                    )}
                </View>
            </View>

            <Dialog
                isVisible={!!orderToVoid}
                onBackdropPress={() => setOrderToVoid(undefined)}
                overlayStyle={[styles.overlay, { width: 700 }]}
            >
                <OrderVoidForm
                    order={orderToVoid!}
                    onRefundComplete={() => setOrderToVoid(undefined)}
                />
            </Dialog>
        </SafeAreaView>
    );
}

const useStyles = () => {
    const sharedStyles = useSharedStyles();

    return {
        ...sharedStyles,
        ...StyleSheet.create({
            header: {
                margin: 10,
                flexDirection: 'row',
                justifyContent: 'center',
            },
        }),
    };
};

export default OrderList;
