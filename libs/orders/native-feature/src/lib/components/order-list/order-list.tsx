import React, { useState } from 'react';
import {
    ordersActions,
    selectFilteredList,
    selectIsEmpty,
    selectLoadingStatus,
} from '@pos/orders/data-access';
import {
    ItemListProps,
    UIEmptyState,
    UIGenericItemList,
    UISearchInput,
} from '@pos/shared/ui-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import OrderItem from '../order-item/order-item';
import { useSharedStyles } from '@pos/theme/native';
import { View, StyleSheet, FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { ButtonGroup, useTheme } from '@rneui/themed';
import { OrderStatus } from '@pos/shared/api';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface OrderListProps {
    navigation: NativeStackNavigationProp<any>;
}

export function OrderList({ navigation }: OrderListProps) {
    const theme = useTheme();
    const styles = useStyles();
    const dispatch = useDispatch();
    const [filterText, setFilterText] = useState<string>();
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const items = useSelector(selectFilteredList);
    const statusButtons: OrderStatus[] = [OrderStatus.OPEN, OrderStatus.PAID];

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
                    <View style={{ flex: 2 }}>
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
                    <View style={{ flex: 5 }}>
                        <UISearchInput
                            debounceTime={300}
                            onTextChanged={(text) =>
                                filter(selectedIndex, text)
                            }
                        />
                    </View>
                </View>
                <View style={{ padding: 20 }}>
                    {Object.keys(items || {}).length === 0 && (
                        <UIEmptyState text="No orders found" />
                    )}
                    {Object.keys(items || {}).length > 0 && (
                        <FlatList
                            data={Object.keys(items)}
                            renderItem={({ item }) => (
                                <OrderItem
                                    navigation={navigation}
                                    item={items[item]!}
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

export default OrderList;
