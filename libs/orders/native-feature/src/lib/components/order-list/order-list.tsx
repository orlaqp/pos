import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    OrderEntity,
    OrderService,
    selectAllOrders,
    subscribeToOrderChanges,
    subscribeToOrderRefundChanges,
    subscribeToOrderRefundLineChanges,
} from '@pos/orders/data-access';
import {
    UIScreen,
    UISearchInput,
    UIEmptyState,
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
import { RootState } from '@pos/store';

export interface OrderListProps {
    navigation?: NativeStackNavigationProp<any>;
}

const orderStatusList: OrderStatus[] = [
    OrderStatus.OPEN,
    OrderStatus.PAID,
    OrderStatus.PARTIALLY_REFUNDED,
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
    const currentTenantId = useSelector(
        (state: RootState) => state?.tenantSession?.currentTenantId
    );
    const t = (key: string, fallback: string) => {
        if (!(i18next.isInitialized && i18next.exists(key))) {
            return fallback;
        }

        const translated = String(i18next.t(key)).trim();
        return translated.length > 0 ? translated : fallback;
    };
    const orderStatusTabs = useMemo(
        () => [
            t('ORDERSTATUS_Open', 'OPEN'),
            t('ORDERSTATUS_Paid', 'PAID'),
            t('ORDERSTATUS_PartiallyRefunded', 'PARTIAL'),
            t('ORDERSTATUS_Refunded', 'REFUNDED'),
        ],
        [t]
    );
    
    useFocusEffect(
        React.useCallback(() => {
            const ordersSub = subscribeToOrderChanges(dispatch, currentTenantId);
            const refundsSub = subscribeToOrderRefundChanges(
                dispatch,
                currentTenantId
            );
            const refundLinesSub = subscribeToOrderRefundLineChanges(
                dispatch,
                currentTenantId
            );
            return () => {
                ordersSub?.unsubscribe();
                refundsSub?.unsubscribe();
                refundLinesSub?.unsubscribe();
            };
        }, [currentTenantId, dispatch])
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
                <View style={styles.filtersRow} testID="order-list-filters-card">
                    <View style={styles.tabsColumn}>
                        <ButtonGroup
                            buttons={orderStatusTabs}
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
                    <View style={styles.searchColumn}>
                        <View style={!hasStatusOrders ? styles.searchDisabled : null}>
                            <UISearchInput
                                testID="order-list-search-input"
                                ref={searchRef}
                                debounceTime={300}
                                onSubmit={(text) => filter(selectedIndex, text)}
                                onClear={() => setFilterText(undefined)}
                                autoFocus={hasStatusOrders}
                                returnKeyType="search"
                                editable={hasStatusOrders}
                            />
                        </View>
                    </View>
                </View>

                <View style={styles.resultsCard} testID="order-list-results-card">
                    {!hasStatusOrders && (
                        <View style={styles.emptyStateWrap}>
                            <UIEmptyState
                                title={t('ORDERS_NoOrdersFound', 'No orders found')}
                                subtitle={t(
                                    'ORDERS_NoOrdersFoundSubtitle',
                                    'Orders with the selected status will appear here.'
                                )}
                            />
                        </View>
                    )}
                    {hasStatusOrders && !hasFilteredOrders && (
                        <View style={styles.emptyStateWrap}>
                            <UIEmptyState
                                title={t('ORDERS_NoOrdersFound', 'No orders found')}
                                subtitle={t(
                                    'ORDERS_NoOrdersFoundSearchSubtitle',
                                    'Try another search term or switch to a different status.'
                                )}
                            />
                        </View>
                    )}
                    {hasStatusOrders && hasFilteredOrders && (
                        <FlatList
                            testID="order-list-flat-list"
                            keyboardShouldPersistTaps="handled"
                            data={filteredOrders}
                            keyExtractor={(item) => item.id}
                            initialNumToRender={10}
                            maxToRenderPerBatch={10}
                            windowSize={7}
                            removeClippedSubviews={true}
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
                supportedOrientations={['landscape']}
                presentationStyle="overFullScreen"
                overlayStyle={[styles.overlay, { width: 1120, maxWidth: '94%' }]}
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
            marginHorizontal: tokens.spacing.md,
            marginTop: tokens.spacing.md,
            marginBottom: tokens.spacing.sm,
        },
        tabsColumn: {
            flex: 3.4,
            justifyContent: 'center',
            marginRight: tokens.spacing.md,
        },
        searchColumn: {
            flex: 1.9,
            justifyContent: 'center',
        },
        searchDisabled: {
            opacity: 0.45,
        },
        filterGroup: {
            margin: 0,
            borderWidth: 1,
            borderColor: tokens.colors.border,
            backgroundColor: tokens.colors.surfaceMuted,
            borderRadius: tokens.radii.md,
            overflow: 'hidden',
            minHeight: 52,
        },
        filterButton: {
            backgroundColor: 'transparent',
            minHeight: 50,
            paddingVertical: 0,
            paddingHorizontal: tokens.spacing.md,
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
            fontSize: 16,
        },
        filterButtonTextSelected: {
            color: tokens.colors.textPrimary,
            fontWeight: '700',
            fontSize: 16,
        },
        resultsCard: {
            flex: 1,
            marginHorizontal: tokens.spacing.md,
            marginBottom: tokens.spacing.md,
            borderWidth: 1,
            borderColor: tokens.colors.border,
            borderRadius: tokens.radii.md,
            backgroundColor: tokens.colors.surfaceMuted,
            overflow: 'hidden',
        },
        emptyStateWrap: {
            flex: 1,
            minHeight: 320,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: tokens.spacing.lg,
            paddingVertical: tokens.spacing.xl,
        },
        overlay: {
            backgroundColor: tokens.colors.canvas,
            borderColor: tokens.colors.border,
            borderWidth: 1,
            borderRadius: 5,
        },
    });

export default OrderList;
