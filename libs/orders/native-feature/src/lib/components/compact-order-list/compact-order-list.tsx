import React, { useEffect, useState } from 'react';
import {
    OrderEntity,
    OrderService,
    selectOpenOrders,
    subscribeToOrderChanges,
} from '@pos/orders/data-access';
import { UICard, UIEmptyState, UISearchInput } from '@pos/shared/ui-native';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import { View, StyleSheet, FlatList, Text, Pressable } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { OrderStatus } from '@pos/shared/api';
import CompactOrderItem from '../compact-order-item/compact-order-item';
import i18next from 'i18next';

export interface CompactOrderListProps {
    onSelect: () => void;
    onClose?: () => void;
}

export function CompactOrderList({ onSelect, onClose }: CompactOrderListProps) {
    const tokens = useDesignTokens();
    const local = useLocalStyles(tokens);
    const dispatch = useDispatch();
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filterText, setFilterText] = useState<string>();
    const openOrders = useSelector(selectOpenOrders);
    const [filteredList, setFilteredList] = useState<OrderEntity[]>(openOrders);
    const t = (key: string, fallback: string) =>
        i18next.isInitialized && i18next.exists(key)
            ? String(i18next.t(key))
            : fallback;

    useEffect(() => {
        const ordersSub = subscribeToOrderChanges(dispatch);
        return () => {
            console.log('Closing orders subscription');
            ordersSub?.unsubscribe();
        };
    }, [dispatch]);

    useEffect(() => {
        const normalizedFilter = (filterText || '').trim();
        if (!normalizedFilter) {
            setFilteredList(openOrders);
            return;
        }

        setFilteredList(
            OrderService.search(openOrders, {
                status: OrderStatus.OPEN,
                filter: normalizedFilter,
            })
        );
    }, [filterText, openOrders]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setFilterText(searchTerm);
        }, 250);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    return (
        <View style={local.container}>
            <View style={local.headerRow}>
                <View style={local.titleBlock}>
                    <View style={local.titleRow}>
                        <Text style={local.title}>{t('ORDERS_OpenOrders', 'Open Orders')}</Text>
                        <View style={local.countBadge}>
                            <Text style={local.countText}>{filteredList.length}</Text>
                        </View>
                    </View>
                    <Text style={local.subtitle}>
                        {t('ORDERS_OpenOrdersSubtitle', 'Tap an order to resume checkout')}
                    </Text>
                </View>
                <Pressable
                    testID="compact-order-list-close"
                    onPress={onClose}
                    style={local.closeButton}
                >
                    <Text style={local.closeText}>{t('COMMON_Close', 'X')}</Text>
                </Pressable>
            </View>
            <UICard tone="muted" padding="sm" radius="md" style={local.searchCard}>
                <UISearchInput
                    debounceTime={300}
                    value={searchTerm}
                    placeholder={t('ORDERS_SearchOpenOrders', 'Search open orders...')}
                    onChangeText={(text) => setSearchTerm(text)}
                    onSubmit={(text) => setSearchTerm(text)}
                />
            </UICard>
            <View style={local.listWrap}>
                {filteredList.length === 0 && (
                    <UIEmptyState text={t('ORDERS_NoOpenOrdersFound', 'No open orders found')} />
                )}
                {filteredList.length > 0 && (
                    <FlatList
                        data={filteredList}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={local.listContent}
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
    );
}

const useLocalStyles = (tokens: ReturnType<typeof useDesignTokens>) =>
    StyleSheet.create({
        container: {
            width: 720,
            maxWidth: '100%',
            minHeight: 460,
            maxHeight: 620,
        },
        headerRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: tokens.spacing.sm,
        },
        titleBlock: {
            flex: 1,
        },
        titleRow: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        title: {
            color: tokens.colors.textPrimary,
            fontSize: 26,
            fontWeight: '800',
        },
        subtitle: {
            color: tokens.colors.textMuted,
            marginTop: 2,
            fontSize: 13,
        },
        countBadge: {
            marginLeft: tokens.spacing.xs,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: `${tokens.colors.accent}77`,
            backgroundColor: `${tokens.colors.accent}22`,
            minWidth: 34,
            paddingHorizontal: 10,
            paddingVertical: 4,
            alignItems: 'center',
        },
        countText: {
            color: tokens.colors.accent,
            fontSize: 14,
            fontWeight: '800',
        },
        closeButton: {
            width: 30,
            height: 30,
            borderRadius: 15,
            borderWidth: 1,
            borderColor: tokens.colors.border,
            backgroundColor: tokens.colors.surfaceMuted,
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: tokens.spacing.sm,
        },
        closeText: {
            color: tokens.colors.textSecondary,
            fontSize: 13,
            fontWeight: '800',
        },
        searchCard: {
            marginBottom: tokens.spacing.sm,
        },
        listWrap: {
            minHeight: 320,
            maxHeight: 500,
        },
        listContent: {
            paddingBottom: tokens.spacing.sm,
        },
    });

export default CompactOrderList;
