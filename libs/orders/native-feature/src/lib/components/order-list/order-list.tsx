import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    OrderEntity,
    OrderService,
    selectAllOrders,
    subscribeToOrderChanges,
    subscribeToOrderRefundChanges,
    subscribeToOrderRefundLineChanges,
} from '@pos/orders/data-access';
import { UIScreen, UISearchInput, UIEmptyState } from '@pos/shared/ui-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import OrderItem from '../order-item/order-item';
import { View, StyleSheet, FlatList, TextInput, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { ButtonGroup, Dialog } from '@rneui/themed';
import { OrderStatus } from '@pos/shared/api';
import OrderVoidForm from '../order-void-form/order-void-form';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import { logSyncDebug } from '@pos/shared/utils';
import { translateWithFallback } from '../../../../../../shared/utils/src/lib/translation';
import { RootState } from '@pos/store';
import OpenOrderPaymentDialog from '../open-order-payment-dialog/open-order-payment-dialog';
import OrderRefundedDetailsDialog from '../order-refunded-details-dialog/order-refunded-details-dialog';

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
    const [orderToPay, setOrderToPay] = useState<OrderEntity | undefined>();
    const [orderToOpenDetails, setOrderToOpenDetails] = useState<
        OrderEntity | undefined
    >();
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const allOrders = useSelector(selectAllOrders);
    const currentTenantId = useSelector(
        (state: RootState) => state?.tenantSession?.currentTenantId,
    );
    const t = translateWithFallback;
    const orderStatusTabs = useMemo(
        () => [
            t('ORDERSTATUS_Open', 'OPEN'),
            t('ORDERSTATUS_Paid', 'PAID'),
            t('ORDERSTATUS_PartiallyRefunded', 'PARTIAL'),
            t('ORDERSTATUS_Refunded', 'REFUNDED'),
        ],
        [t],
    );

    useFocusEffect(
        React.useCallback(() => {
            const ordersSub = subscribeToOrderChanges(
                dispatch,
                currentTenantId,
            );
            const refundsSub = subscribeToOrderRefundChanges(
                dispatch,
                currentTenantId,
            );
            const refundLinesSub = subscribeToOrderRefundLineChanges(
                dispatch,
                currentTenantId,
            );
            return () => {
                ordersSub?.unsubscribe();
                refundsSub?.unsubscribe();
                refundLinesSub?.unsubscribe();
            };
        }, [currentTenantId, dispatch]),
    );

    const filteredOrders = useMemo(
        () =>
            OrderService.search(allOrders, {
                status: orderStatusList[selectedIndex],
                filter: filterText,
            }),
        [allOrders, selectedIndex, filterText],
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
                <View
                    style={styles.filtersRow}
                    testID="order-list-filters-card"
                >
                    <View style={styles.tabsColumn}>
                        <View style={styles.filtersIntro}>
                            <Text style={styles.filtersEyebrow}>
                                {t('ORDERS_FilterEyebrow', 'Order status')}
                            </Text>
                            <Text style={styles.filtersTitle}>
                                {t(
                                    'ORDERS_FilterTitle',
                                    'Track payments and refunds',
                                )}
                            </Text>
                        </View>
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
                        <Text style={styles.searchLabel}>
                            {t('ORDERS_SearchLabel', 'Search')}
                        </Text>
                        <View
                            style={
                                !hasStatusOrders ? styles.searchDisabled : null
                            }
                        >
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

                <View
                    style={styles.resultsCard}
                    testID="order-list-results-card"
                >
                    {!hasStatusOrders && (
                        <View style={styles.emptyStateWrap}>
                            <UIEmptyState
                                title={t(
                                    'ORDERS_NoOrdersFound',
                                    'No orders found',
                                )}
                                subtitle={t(
                                    'ORDERS_NoOrdersFoundSubtitle',
                                    'Orders with the selected status will appear here.',
                                )}
                            />
                        </View>
                    )}
                    {hasStatusOrders && !hasFilteredOrders && (
                        <View style={styles.emptyStateWrap}>
                            <UIEmptyState
                                title={t(
                                    'ORDERS_NoOrdersFound',
                                    'No orders found',
                                )}
                                subtitle={t(
                                    'ORDERS_NoOrdersFoundSearchSubtitle',
                                    'Try another search term or switch to a different status.',
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
                                    onPay={(order) => setOrderToPay(order)}
                                    onOpenDetails={(order) =>
                                        setOrderToOpenDetails(order)
                                    }
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
                overlayStyle={[
                    styles.overlay,
                    { width: 1120, maxWidth: '94%' },
                ]}
            >
                {orderToVoid ? (
                    <OrderVoidForm
                        order={orderToVoid}
                        onRefundComplete={() => setOrderToVoid(undefined)}
                    />
                ) : null}
            </Dialog>
            <OpenOrderPaymentDialog
                visible={!!orderToPay}
                order={orderToPay}
                navigation={navigation}
                onClose={() => setOrderToPay(undefined)}
            />
            <OrderRefundedDetailsDialog
                visible={!!orderToOpenDetails}
                order={orderToOpenDetails}
                onClose={() => setOrderToOpenDetails(undefined)}
            />
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
            alignItems: 'flex-end',
            marginHorizontal: tokens.spacing.md,
            marginTop: tokens.spacing.md,
            marginBottom: tokens.spacing.sm,
            paddingHorizontal: tokens.spacing.md,
            paddingVertical: tokens.spacing.md,
            borderWidth: 1,
            borderColor: tokens.colors.border,
            borderRadius: tokens.radii.lg,
            backgroundColor: tokens.colors.surfaceMuted,
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
        filtersIntro: {
            marginBottom: tokens.spacing.sm,
        },
        filtersEyebrow: {
            color: tokens.colors.accent,
            fontSize: 12,
            fontWeight: '800',
            textTransform: 'uppercase',
            letterSpacing: 1.2,
            marginBottom: 4,
        },
        filtersTitle: {
            color: tokens.colors.textPrimary,
            fontSize: 18,
            fontWeight: '800',
        },
        searchLabel: {
            color: tokens.colors.textMuted,
            fontSize: 12,
            fontWeight: '800',
            textTransform: 'uppercase',
            letterSpacing: 1.1,
            marginBottom: tokens.spacing.xs,
        },
        searchDisabled: {
            opacity: 0.45,
        },
        filterGroup: {
            margin: 0,
            borderWidth: 1,
            borderColor: tokens.colors.border,
            backgroundColor: tokens.colors.surfaceMuted,
            borderRadius: tokens.radii.lg,
            overflow: 'hidden',
            minHeight: 54,
        },
        filterButton: {
            backgroundColor: 'transparent',
            minHeight: 52,
            paddingVertical: 0,
            paddingHorizontal: tokens.spacing.md,
            justifyContent: 'center',
        },
        filterButtonContainer: {
            minHeight: 52,
        },
        filterButtonSelected: {
            backgroundColor: tokens.colors.accent,
            minHeight: 52,
        },
        filterButtonText: {
            color: tokens.colors.textMuted,
            fontWeight: '700',
            fontSize: 15,
        },
        filterButtonTextSelected: {
            color: tokens.colors.textPrimary,
            fontWeight: '800',
            fontSize: 15,
        },
        resultsCard: {
            flex: 1,
            marginHorizontal: tokens.spacing.md,
            marginBottom: tokens.spacing.md,
            borderWidth: 1,
            borderColor: tokens.colors.border,
            borderRadius: tokens.radii.lg,
            backgroundColor: tokens.colors.surfaceMuted,
            overflow: 'hidden',
            paddingTop: tokens.spacing.xs,
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
