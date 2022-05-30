import React, { useEffect, useState } from 'react';
import {
    OrderEntity,
    ordersActions,
    OrderService,
    selectAllOrders,
    selectFilteredList,
    selectOpenOrders,
    subscribeToOrderChanges,
    subscribeToOrderLineChanges,
} from '@pos/orders/data-access';
import { UIEmptyState, UISearchInput } from '@pos/shared/ui-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import OrderItem from '../order-item/order-item';
import { useSharedStyles } from '@pos/theme/native';
import { View, StyleSheet, FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { ButtonGroup, useTheme } from '@rneui/themed';
import { OrderStatus } from '@pos/shared/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import CompactOrderItem from '../compact-order-item/compact-order-item';

export interface CompactOrderListProps {
    onSelect: () => void;
}

export function CompactOrderList({ onSelect }: CompactOrderListProps) {
    const styles = useStyles();
    const dispatch = useDispatch();
    const [filterText, setFilterText] = useState<string>();
    const openOrders = useSelector(selectOpenOrders);
    const [filteredList, setFilteredList] = useState<OrderEntity[]>(openOrders);

    useEffect(() => {
        const ordersSub = subscribeToOrderChanges(dispatch);
        const linesSub = subscribeToOrderLineChanges(dispatch);
        return () => {
            console.log('Closing orders subscription');
            ordersSub.unsubscribe();
            linesSub.unsubscribe();
        };
    }, [dispatch]);

    useEffect(() => {
        setFilteredList(
            OrderService.search(openOrders, {
                status: OrderStatus.OPEN,
                filter: filterText,
            })
        );
    }, [filterText, openOrders]);

    return (
        <SafeAreaView>
            <View style={{ flexDirection: 'column' }}>
                <View style={[styles.header, { alignItems: 'center' }]}>
                    <View style={{ flex: 5 }}>
                        <UISearchInput
                            debounceTime={300}
                            onSubmit={(text) => setFilterText(text)}
                        />
                    </View>
                </View>
                <View style={{ padding: 20 }}>
                    {filteredList.length === 0 && (
                        <UIEmptyState text="No orders found" />
                    )}
                    {filteredList.length > 0 && (
                        <FlatList
                            data={filteredList}
                            renderItem={({ item }) => (
                                <CompactOrderItem
                                    // navigation={navigation}
                                    item={item}
                                    onSelect={onSelect}
                                />
                            )}
                        />
                    )}
                </View>
            </View>
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

export default CompactOrderList;
