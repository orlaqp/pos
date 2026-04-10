import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    OrderEntity,
    OrderService,
    selectAllOrders,
    subscribeToOrderChanges,
} from '@pos/orders/data-access';
import {
    UICard,
    UIScreen,
    UISearchInput,
} from '@pos/shared/ui-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import OrderItem from '../order-item/order-item';
import { View, StyleSheet, FlatList, TextInput, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { ButtonGroup, Dialog } from '@rneui/themed';
import { OrderStatus } from '@pos/shared/api';
import OrderVoidForm from '../order-void-form/order-void-form';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import i18next from 'i18next';
import { logSyncDebug } from '@pos/shared/utils';

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
    const searchRef = useRef<TextInput>(null);
    const [filterText, setFilterText] = useState<string>();
    const [orderToVoid, setOrderToVoid] = useState<OrderEntity | undefined>();
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const allOrders = useSelector(selectAllOrders);
    const t = (key: string, fallback: string) =>
        i18next.isInitialized && i18next.exists(key)
            ? String(i18next.t(key))
            : fallback;
    
    useFocusEffect(
        React.useCallback(() => {
            const ordersSub = subscribeToOrderChanges(dispatch);
            return () => {
                ordersSub?.unsubscribe();
            };
        }, [dispatch])
    );

    const filteredOrders = useMemo(
        () =>
            OrderService.search(allOrders, {
                status: orderStatusList[selectedIndex],
                filter: filterText,
            }),
        [allOrders, selectedIndex, filterText]
    );

    useEffect(() => {
        const timer = setTimeout(() => {
            searchRef.current?.focus();
        }, 50);
        return () => clearTimeout(timer);
    }, []);

    const filter = (statusIndex: number, filter?: string) => {
        setSelectedIndex(statusIndex);
        setFilterText(filter);
        // dispatch(
        //     ordersActions.filter({ status: orderStatusList[statusIndex], filter })
        // );
        searchRef.current?.clear();
    };

    const selectedStatus = orderStatusList[selectedIndex];
    const statusOrders = OrderService.search(allOrders, {
        status: selectedStatus,
    });
    const hasStatusOrders = statusOrders.length > 0;
    const hasFilteredOrders = filteredOrders.length > 0;

    useEffect(() => {
        logSyncDebug('orders.screen', 'tab:view', {
            selectedStatus,
            allOrdersCount: allOrders.length,
            statusOrdersCount: statusOrders.length,
            filteredOrdersCount: filteredOrders.length,
            filterText: filterText ?? '',
            statusSample: statusOrders.slice(0, 5).map((order) => ({
                id: order.id,
                orderNo: order.orderNo,
                status: order.status,
                orderDate: order.orderDate,
                updatedAt: order.updatedAt,
            })),
            filteredSample: filteredOrders.slice(0, 5).map((order) => ({
                id: order.id,
                orderNo: order.orderNo,
                status: order.status,
                orderDate: order.orderDate,
                updatedAt: order.updatedAt,
            })),
        });
    }, [allOrders, filteredOrders, filterText, selectedStatus, statusOrders]);

    return (
        <UIScreen padded testID="order-list-screen">
            <View style={styles.container}>
                <UICard tone="muted" padding="sm" testID="order-list-filters-card">
                    <View style={styles.filtersRow}>
                        <View style={styles.tabsColumn}>
                            <ButtonGroup
                                buttons={orderStatusList}
                                selectedIndex={selectedIndex}
                                onPress={(value) => filter(value, '')}
                                containerStyle={styles.filterGroup}
                                buttonStyle={styles.filterButton}
                                buttonContainerStyle={styles.filterButtonContainer}
                                selectedButtonStyle={styles.filterButtonSelected}
                                textStyle={styles.filterButtonText}
                                selectedTextStyle={styles.filterButtonTextSelected}
                                innerBorderStyle={{ color: tokens.colors.border }}
                            />
                        </View>
                        {hasStatusOrders && (
                            <View style={styles.searchColumn}>
                                <UISearchInput
                                    testID="order-list-search-input"
                                    ref={searchRef}
                                    debounceTime={300}
                                    onSubmit={(text) => filter(selectedIndex, text)}
                                    onClear={() => setFilterText(undefined)}
                                    autoFocus={true}
                                    returnKeyType="search"
                                />
                            </View>
                        )}
                    </View>
                </UICard>

                <UICard
                    style={styles.resultsCard}
                    testID="order-list-results-card"
                    padding="lg"
                >
                    {!hasStatusOrders && (
                        <View style={styles.emptyStateWrap}>
                            <Text style={styles.emptyStateTitle}>
                                {t('ORDERS_NoOrdersFound', 'No orders found')}
                            </Text>
                            <Text style={styles.emptyStateSubtitle}>
                                {t(
                                    'ORDERS_NoOrdersFoundSubtitle',
                                    'Orders with the selected status will appear here.'
                                )}
                            </Text>
                        </View>
                    )}
                    {hasStatusOrders && !hasFilteredOrders && (
                        <View style={styles.emptyStateWrap}>
                            <Text style={styles.emptyStateTitle}>
                                {t('ORDERS_NoOrdersFound', 'No orders found')}
                            </Text>
                            <Text style={styles.emptyStateSubtitle}>
                                {t(
                                    'ORDERS_NoOrdersFoundSearchSubtitle',
                                    'Try another search term or switch to a different status.'
                                )}
                            </Text>
                        </View>
                    )}
                    {hasStatusOrders && hasFilteredOrders && (
                        <FlatList
                            testID="order-list-flat-list"
                            keyboardShouldPersistTaps="handled"
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
            </View>

            <Dialog
                isVisible={!!orderToVoid}
                onBackdropPress={() => setOrderToVoid(undefined)}
                supportedOrientations={['landscape']}
                presentationStyle="fullScreen"
                overlayStyle={[styles.overlay, { width: 700 }]}
            >
                {orderToVoid ? (
                    <OrderVoidForm
                        order={orderToVoid}
                        onRefundComplete={() => setOrderToVoid(undefined)}
                    />
                ) : null}
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
        filtersRow: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        tabsColumn: {
            flex: 2,
            justifyContent: 'center',
            marginRight: tokens.spacing.md,
        },
        searchColumn: {
            flex: 3,
            justifyContent: 'center',
        },
        filterGroup: {
            margin: 0,
            borderWidth: 1,
            borderColor: tokens.colors.border,
            backgroundColor: 'transparent',
            borderRadius: tokens.radii.md,
            overflow: 'hidden',
            minHeight: 52,
        },
        filterButton: {
            backgroundColor: tokens.colors.surfaceMuted,
            minHeight: 50,
            paddingVertical: 0,
            justifyContent: 'center',
        },
        filterButtonContainer: {
            minHeight: 50,
        },
        filterButtonSelected: {
            backgroundColor: tokens.colors.accent,
            minHeight: 50,
        },
        filterButtonText: {
            color: tokens.colors.textMuted,
            fontWeight: '500',
            fontSize: 18,
        },
        filterButtonTextSelected: {
            color: tokens.colors.textPrimary,
            fontWeight: '700',
            fontSize: 18,
        },
        resultsCard: {
            flex: 1,
        },
        emptyStateWrap: {
            flex: 1,
            minHeight: 320,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: tokens.spacing.xl,
            paddingVertical: tokens.spacing.xl,
        },
        emptyStateTitle: {
            color: tokens.colors.textPrimary,
            fontSize: 28,
            fontWeight: '700',
            textAlign: 'center',
        },
        emptyStateSubtitle: {
            color: tokens.colors.textSecondary,
            fontSize: 16,
            lineHeight: 26,
            marginTop: tokens.spacing.md,
            maxWidth: 520,
            textAlign: 'center',
        },
        overlay: {
            backgroundColor: tokens.colors.canvas,
            borderColor: tokens.colors.border,
            borderWidth: 1,
            borderRadius: 5,
        },
    });

export default OrderList;
