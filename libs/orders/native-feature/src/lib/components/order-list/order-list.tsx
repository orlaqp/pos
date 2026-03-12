import React, { useEffect, useState } from 'react';
import {
    OrderEntity,
    OrderService,
    selectAllOrders,
    subscribeToOrderChanges,
} from '@pos/orders/data-access';
import {
    UICard,
    UIEmptyState,
    UIScreen,
    UISearchInput,
    UIStack,
} from '@pos/shared/ui-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import OrderItem from '../order-item/order-item';
import { View, StyleSheet, FlatList, TextInput } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { ButtonGroup, Dialog } from '@rneui/themed';
import { OrderStatus } from '@pos/shared/api';
import OrderVoidForm from '../order-void-form/order-void-form';
import { eventsActions } from '@pos/shared/data-store';
import uuid from 'react-native-uuid';
import { useDesignTokens } from '@pos/theme/native/design-tokens';

export interface OrderListProps {
    navigation?: NativeStackNavigationProp<any>;
}

const orderStatusList: OrderStatus[] = [
    OrderStatus.OPEN,
    OrderStatus.PAID,
    OrderStatus.REFUNDED,
];

export function OrderList({ navigation }: OrderListProps) {
    const tokens = useDesignTokens();
    const styles = useStyles(tokens);
    const dispatch = useDispatch();
    const searchRef = React.createRef<TextInput>();
    const [filterText, setFilterText] = useState<string>();
    const [orderToVoid, setOrderToVoid] = useState<OrderEntity | undefined>();
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const allOrders = useSelector(selectAllOrders);
    const [filteredOrders, setFilteredOrders] = useState<OrderEntity[]>();
    
    useEffect(() => {
        const ordersSub = subscribeToOrderChanges(dispatch);
        return () => {
            ordersSub?.unsubscribe();
        };
    }, [dispatch]);

    useEffect(() => {
        const searchResult = OrderService.search(allOrders, {
            status: orderStatusList[selectedIndex],
            filter: filterText,
        });

        dispatch(
            eventsActions.add({
                id: uuid.v4().toString(),
                event: 'Order search',
                data: JSON.stringify({
                    filter: filterText,
                    result: searchResult
                }).substring(0, 350),
                timestamp: (new Date()).toISOString()
            })
        );

        setFilteredOrders((items) => [...searchResult]);
    }, [dispatch, allOrders, selectedIndex, filterText]);

    useEffect(() => {
        setTimeout(() => {
            searchRef.current?.focus();
        }, 50);
    }, [filteredOrders, filterText, searchRef]);

    const filter = (statusIndex: number, filter?: string) => {
        setSelectedIndex(statusIndex);
        setFilterText(filter);
        // dispatch(
        //     ordersActions.filter({ status: orderStatusList[statusIndex], filter })
        // );
        searchRef.current?.clear();
    };

    return (
        <UIScreen padded testID="order-list-screen">
            <UIStack spacing="md" style={styles.container}>
                <UICard tone="muted" padding="sm" testID="order-list-filters-card">
                    <UIStack direction="horizontal" align="center" spacing="md">
                        <View style={styles.filterColumn}>
                            <ButtonGroup
                                buttons={orderStatusList}
                                selectedIndex={selectedIndex}
                                onPress={(value) => filter(value, '')}
                                containerStyle={styles.filterGroup}
                            />
                        </View>
                        <View style={styles.filterColumn}>
                            <UISearchInput
                                ref={searchRef}
                                debounceTime={300}
                                onSubmit={(text) => filter(selectedIndex, text)}
                                autoFocus={true}
                                returnKeyType="search"
                            />
                        </View>
                    </UIStack>
                </UICard>

                <UICard
                    style={styles.resultsCard}
                    testID="order-list-results-card"
                    padding="lg"
                >
                    {filteredOrders?.length === 0 && (
                        <UIEmptyState text="No orders found" />
                    )}
                    {filteredOrders && filteredOrders?.length > 0 && (
                        <FlatList
                            testID="order-list-flat-list"
                            data={filteredOrders}
                            renderItem={({ item }) => (
                                <OrderItem
                                    navigation={navigation}
                                    item={item}
                                    onVoid={(order) => setOrderToVoid(order)}
                                />
                            )}
                        />
                    )}
                </UICard>
            </UIStack>

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
        </UIScreen>
    );
}

const useStyles = (tokens: ReturnType<typeof useDesignTokens>) =>
    StyleSheet.create({
        container: {
            flex: 1,
        },
        filterColumn: {
            flex: 1,
        },
        filterGroup: {
            margin: 0,
            borderWidth: 1,
            borderColor: tokens.colors.border,
        },
        resultsCard: {
            flex: 1,
        },
        overlay: {
            backgroundColor: tokens.colors.canvas,
            borderColor: tokens.colors.border,
            borderWidth: 1,
            borderRadius: 5,
        },
    });

export default OrderList;
