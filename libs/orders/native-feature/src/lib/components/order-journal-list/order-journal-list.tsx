import React, { useEffect, useMemo, useState } from 'react';
import {
    markPendingOrderJournalEntry,
    PendingOrderJournalEntry,
    readPendingOrderJournal,
    retryPendingOrderJournalEntrySync,
} from '@pos/orders/data-access';
import { selectLoginEmployee } from '@pos/employees/data-access';
import { UICard, UIEmptyState, UISearchInput } from '@pos/shared/ui-native';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import i18next from 'i18next';
import { useSelector } from 'react-redux';

export interface OrderJournalListProps {
    tenantId?: string;
    onClose?: () => void;
}

const getEmployeeName = (entry: PendingOrderJournalEntry) =>
    entry.employee?.name || 'Unknown employee';

const getItemCount = (entry: PendingOrderJournalEntry) =>
    Array.isArray(entry.cart.items) ? entry.cart.items.length : 0;

const getOrderTotal = (entry: PendingOrderJournalEntry) => {
    const total = (entry.cart.footer as { total?: unknown } | undefined)?.total;
    return typeof total === 'number' ? total : 0;
};

const canRetrySync = (entry: PendingOrderJournalEntry) =>
    entry.syncState === 'local_only' || entry.syncState === 'sync_failed';

const toSearchText = (entry: PendingOrderJournalEntry) =>
    [
        entry.orderNo,
        entry.orderId,
        entry.statusTarget,
        entry.syncState,
        entry.employee?.name,
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

export function OrderJournalList({
    tenantId,
    onClose,
}: OrderJournalListProps) {
    const tokens = useDesignTokens();
    const local = useLocalStyles(tokens);
    const employee = useSelector(selectLoginEmployee);
    const [entries, setEntries] = useState<PendingOrderJournalEntry[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [retryingOrderIds, setRetryingOrderIds] = useState<
        Record<string, boolean>
    >({});
    const t = (key: string, fallback: string) =>
        i18next.isInitialized && i18next.exists(key)
            ? String(i18next.t(key))
            : fallback;

    useEffect(() => {
        let cancelled = false;

        const loadEntries = async () => {
            setLoading(true);
            try {
                const journalEntries = await readPendingOrderJournal({
                    tenantId,
                    limit: 500,
                });
                if (!cancelled) {
                    setEntries(journalEntries);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void loadEntries();

        return () => {
            cancelled = true;
        };
    }, [tenantId]);

    const updateEntries = (nextEntries: PendingOrderJournalEntry[]) => {
        setEntries(nextEntries);
    };

    const getErrorMessage = (error: unknown) => {
        if (error instanceof Error && error.message) {
            return error.message;
        }

        if (typeof error === 'string' && error.trim()) {
            return error;
        }

        return t(
            'ORDERS_OrderJournalRetryFailedMessage',
            'The order could not be prepared for sync. Please try again.'
        );
    };

    const onRetrySync = async (entry: PendingOrderJournalEntry) => {
        if (!tenantId) {
            Alert.alert(
                t(
                    'ORDERS_OrderJournalTenantUnavailableTitle',
                    'Tenant not ready'
                ),
                t(
                    'ORDERS_OrderJournalTenantUnavailable',
                    'Tenant context is not ready yet.'
                )
            );
            return;
        }

        if (!employee?.id) {
            Alert.alert(
                t(
                    'ORDERS_OrderJournalEmployeeUnavailableTitle',
                    'Employee required'
                ),
                t(
                    'ORDERS_OrderJournalEmployeeUnavailable',
                    'Sign in as an employee before retrying sync.'
                )
            );
            return;
        }

        setRetryingOrderIds((current) => ({
            ...current,
            [entry.orderId]: true,
        }));

        try {
            const pendingEntries = await markPendingOrderJournalEntry(
                entry.orderId,
                {
                    syncState: 'sync_pending',
                    lastError: undefined,
                },
                { tenantId }
            );
            updateEntries(pendingEntries);

            await retryPendingOrderJournalEntrySync(entry, {
                id: employee.id,
                firstName: employee.firstName,
                lastName: employee.lastName,
            });

            const refreshedEntries = await markPendingOrderJournalEntry(
                entry.orderId,
                {
                    syncState: 'local_only',
                    lastError: undefined,
                },
                { tenantId }
            );
            updateEntries(refreshedEntries);
        } catch (error) {
            const message = getErrorMessage(error);
            const failedEntries = await markPendingOrderJournalEntry(
                entry.orderId,
                {
                    syncState: 'sync_failed',
                    lastError: message,
                },
                { tenantId }
            );
            updateEntries(failedEntries);
            Alert.alert(
                t(
                    'ORDERS_OrderJournalRetryFailedTitle',
                    'Retry sync failed'
                ),
                message
            );
        } finally {
            setRetryingOrderIds((current) => ({
                ...current,
                [entry.orderId]: false,
            }));
        }
    };

    const filteredEntries = useMemo(() => {
        const normalizedSearchTerm = searchTerm.trim().toLowerCase();
        if (!normalizedSearchTerm) {
            return entries;
        }

        return entries.filter((entry) =>
            toSearchText(entry).includes(normalizedSearchTerm)
        );
    }, [entries, searchTerm]);

    return (
        <View style={local.container}>
            <View style={local.headerRow}>
                <View style={local.titleBlock}>
                    <View style={local.titleRow}>
                        <Text style={local.title}>
                            {t('ORDERS_OrderJournal', 'Order Journal')}
                        </Text>
                        <View style={local.countBadge}>
                            <Text style={local.countText}>{filteredEntries.length}</Text>
                        </View>
                    </View>
                    <Text style={local.subtitle}>
                        {t(
                            'ORDERS_OrderJournalSubtitle',
                            'Latest device-saved orders for the current tenant (up to 500).'
                        )}
                    </Text>
                </View>
                <Pressable
                    testID="order-journal-list-close"
                    onPress={onClose}
                    style={local.closeButton}
                >
                    <Text style={local.closeText}>{t('COMMON_Close', 'X')}</Text>
                </Pressable>
            </View>
            {!tenantId ? (
                <View style={local.emptyWrap}>
                    <UIEmptyState
                        text={t(
                            'ORDERS_OrderJournalTenantUnavailable',
                            'Tenant context is not ready yet.'
                        )}
                    />
                </View>
            ) : loading ? (
                <View style={local.loadingWrap}>
                    <ActivityIndicator size="large" color={tokens.colors.accent} />
                    <Text style={local.loadingText}>
                        {t('ORDERS_OrderJournalLoading', 'Loading device journal...')}
                    </Text>
                </View>
            ) : entries.length === 0 ? (
                <View style={local.emptyWrap}>
                    <UIEmptyState
                        text={t(
                            'ORDERS_OrderJournalEmpty',
                            'No device-saved orders found for this tenant.'
                        )}
                    />
                </View>
            ) : (
                <>
                    <UICard tone="muted" padding="sm" radius="md" style={local.searchCard}>
                        <UISearchInput
                            debounceTime={250}
                            value={searchTerm}
                            placeholder={t(
                                'ORDERS_SearchOrderJournal',
                                'Search device journal...'
                            )}
                            onChangeText={setSearchTerm}
                            onSubmit={setSearchTerm}
                        />
                    </UICard>
                    <FlatList
                        data={filteredEntries}
                        keyExtractor={(item) => `${item.tenantId || 'tenantless'}:${item.orderId}`}
                        contentContainerStyle={local.listContent}
                        style={local.list}
                        renderItem={({ item }) => (
                            <View style={local.entryCard}>
                                <View style={local.entryHeader}>
                                    <View style={local.entryHeaderText}>
                                        <Text style={local.orderNumberText}>
                                            {item.orderNo || item.orderId}
                                        </Text>
                                        <Text style={local.orderMetaText}>
                                            {new Date(item.createdAt).toLocaleString()}
                                        </Text>
                                    </View>
                                    <View style={local.badgesColumn}>
                                        <View style={local.targetBadge}>
                                            <Text style={local.targetBadgeText}>
                                                {String(item.statusTarget)}
                                            </Text>
                                        </View>
                                        <View
                                            style={[
                                                local.syncBadge,
                                                item.syncState === 'sync_failed'
                                                    ? local.syncBadgeError
                                                    : item.syncState === 'synced'
                                                      ? local.syncBadgeSuccess
                                                      : null,
                                            ]}
                                        >
                                            <Text style={local.syncBadgeText}>
                                                {item.syncState.replace(/_/g, ' ')}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={local.metaRow}>
                                    <Text style={local.metaLabel}>
                                        {t('ORDERS_OrderJournalEmployee', 'Employee')}
                                    </Text>
                                    <Text style={local.metaValue}>
                                        {getEmployeeName(item)}
                                    </Text>
                                </View>
                                <View style={local.metaRow}>
                                    <Text style={local.metaLabel}>
                                        {t('ORDERS_OrderJournalItems', 'Items')}
                                    </Text>
                                    <Text style={local.metaValue}>{getItemCount(item)}</Text>
                                </View>
                                <View style={local.metaRow}>
                                    <Text style={local.metaLabel}>
                                        {t('ORDERS_OrderJournalTotal', 'Total')}
                                    </Text>
                                    <Text style={local.totalValue}>
                                        {`$ ${getOrderTotal(item).toFixed(2)}`}
                                    </Text>
                                </View>
                                {item.lastError ? (
                                    <Text style={local.errorText}>{item.lastError}</Text>
                                ) : null}
                                {canRetrySync(item) ? (
                                    <Pressable
                                        testID={`order-journal-retry-${item.orderId}`}
                                        style={[
                                            local.retryButton,
                                            retryingOrderIds[item.orderId]
                                                ? local.retryButtonDisabled
                                                : null,
                                        ]}
                                        onPress={() => void onRetrySync(item)}
                                        disabled={!!retryingOrderIds[item.orderId]}
                                    >
                                        <Text style={local.retryButtonText}>
                                            {retryingOrderIds[item.orderId]
                                                ? t(
                                                      'ORDERS_OrderJournalRetrying',
                                                      'Retrying...'
                                                  )
                                                : t(
                                                      'ORDERS_OrderJournalRetry',
                                                      'Retry Sync'
                                                  )}
                                        </Text>
                                    </Pressable>
                                ) : null}
                            </View>
                        )}
                        ListEmptyComponent={
                            <View style={local.emptyWrap}>
                                <UIEmptyState
                                    text={t(
                                        'ORDERS_OrderJournalSearchEmpty',
                                        'No device journal orders match your search.'
                                    )}
                                />
                            </View>
                        }
                    />
                </>
            )}
        </View>
    );
}

const useLocalStyles = (tokens: ReturnType<typeof useDesignTokens>) =>
    StyleSheet.create({
        container: {
            width: 760,
            maxWidth: '100%',
            minHeight: 460,
            maxHeight: 640,
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
        loadingWrap: {
            minHeight: 340,
            alignItems: 'center',
            justifyContent: 'center',
        },
        loadingText: {
            color: tokens.colors.textSecondary,
            fontSize: 14,
            marginTop: tokens.spacing.sm,
        },
        searchCard: {
            marginBottom: tokens.spacing.sm,
        },
        list: {
            minHeight: 320,
            maxHeight: 520,
        },
        listContent: {
            paddingBottom: tokens.spacing.sm,
        },
        entryCard: {
            borderRadius: tokens.radii.md,
            borderWidth: 1,
            borderColor: tokens.colors.border,
            backgroundColor: tokens.colors.surfaceMuted,
            padding: tokens.spacing.md,
            marginBottom: tokens.spacing.sm,
        },
        entryHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: tokens.spacing.sm,
        },
        entryHeaderText: {
            flex: 1,
            paddingRight: tokens.spacing.sm,
        },
        orderNumberText: {
            color: tokens.colors.textPrimary,
            fontSize: 18,
            fontWeight: '700',
        },
        orderMetaText: {
            color: tokens.colors.textMuted,
            fontSize: 12,
            marginTop: 2,
        },
        badgesColumn: {
            alignItems: 'flex-end',
        },
        targetBadge: {
            borderRadius: 999,
            backgroundColor: `${tokens.colors.accent}1f`,
            borderWidth: 1,
            borderColor: `${tokens.colors.accent}66`,
            paddingHorizontal: 10,
            paddingVertical: 4,
            marginBottom: 6,
        },
        targetBadgeText: {
            color: tokens.colors.accent,
            fontSize: 11,
            fontWeight: '700',
        },
        syncBadge: {
            borderRadius: 999,
            backgroundColor: tokens.colors.surface,
            borderWidth: 1,
            borderColor: tokens.colors.border,
            paddingHorizontal: 10,
            paddingVertical: 4,
        },
        syncBadgeSuccess: {
            backgroundColor: `${tokens.colors.success}20`,
            borderColor: `${tokens.colors.success}55`,
        },
        syncBadgeError: {
            backgroundColor: `${tokens.colors.danger}20`,
            borderColor: `${tokens.colors.danger}55`,
        },
        syncBadgeText: {
            color: tokens.colors.textSecondary,
            fontSize: 11,
            fontWeight: '700',
            textTransform: 'capitalize',
        },
        metaRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 4,
        },
        metaLabel: {
            color: tokens.colors.textMuted,
            fontSize: 12,
        },
        metaValue: {
            color: tokens.colors.textPrimary,
            fontSize: 13,
            fontWeight: '600',
        },
        totalValue: {
            color: tokens.colors.textPrimary,
            fontSize: 14,
            fontWeight: '800',
        },
        errorText: {
            marginTop: tokens.spacing.sm,
            color: tokens.colors.danger,
            fontSize: 12,
            lineHeight: 18,
        },
        retryButton: {
            marginTop: tokens.spacing.sm,
            borderRadius: tokens.radii.md,
            backgroundColor: tokens.colors.accent,
            paddingVertical: tokens.spacing.sm,
            alignItems: 'center',
            justifyContent: 'center',
        },
        retryButtonDisabled: {
            opacity: 0.6,
        },
        retryButtonText: {
            color: tokens.colors.textPrimary,
            fontSize: 13,
            fontWeight: '800',
        },
        emptyWrap: {
            minHeight: 340,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: tokens.spacing.xl,
        },
    });

export default OrderJournalList;
