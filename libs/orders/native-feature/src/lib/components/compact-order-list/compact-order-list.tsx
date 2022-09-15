import React, { useEffect, useState } from 'react';
import {
    OrderEntity,
    OrderService,
    selectOpenOrders,
    subscribeToOrderChanges,
} from '@pos/orders/data-access';
import { UIEmptyState, UISearchInput } from '@pos/shared/ui-native';
import { useSharedStyles } from '@pos/theme/native';
import { View, StyleSheet, FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { OrderStatus } from '@pos/shared/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import CompactOrderItem from '../compact-order-item/compact-order-item';
import { selectLoginEmployee } from '@pos/employees/data-access';

export interface CompactOrderListProps {
    onSelect: () => void;
}

export function CompactOrderList({ onSelect }: CompactOrderListProps) {
    const styles = useStyles();
    const dispatch = useDispatch();
    const [filterText, setFilterText] = useState<string>();
    const openOrders = useSelector(selectOpenOrders);
    const [filteredList, setFilteredList] = useState<OrderEntity[]>(openOrders);
    const employee = useSelector(selectLoginEmployee);

    useEffect(() => {
        const ordersSub = subscribeToOrderChanges(dispatch, employee);
        return () => {
            console.log('Closing orders subscription');
            ordersSub?.unsubscribe();
        };
    }, [dispatch, employee]);

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
