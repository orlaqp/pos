import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    buildRefundInsights,
    buildRefundReportRows,
    getOrdersForStatuses,
} from '@pos/reporting/data-access';
import { OrderStatus } from '@pos/shared/models';
import {
    DateRange,
    UICard,
    UIDateRange,
    UIEmptyState,
    UIScreen,
    UISpinner,
    UIStack,
} from '@pos/shared/ui-native';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import { buildReportCsv, ReportHeader } from '../report-viewer/report-viewer';
import { normalizeReportRange } from '../report-utils';
import moment from 'moment';
import * as RNFS from 'react-native-fs';
import { Share } from 'react-native';
import { Icon } from '@rneui/themed';
import i18next from 'i18next';
import {
    Animated,
    FlatList,
    InteractionManager,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

interface RefundRow {
    orderNo: string;
    date: string;
    employee: string;
    amount: number;
    reason: string;
}

const toSafeFileSlug = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

export function RefundReport() {
    const tokens = useDesignTokens();
    const styles = useStyles(tokens);
    const t = (key: string, fallback: string) =>
        i18next.isInitialized && i18next.exists(key) ? String(i18next.t(key)) : fallback;
    const [dateRange, setDateRange] = useState<DateRange>({
        startDate: moment().startOf('day'),
        endDate: moment().endOf('day'),
    });
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState<RefundRow[]>([]);
    const emptyOpacity = useRef(new Animated.Value(0)).current;
    const emptyTranslateY = useRef(new Animated.Value(12)).current;

    const headers: ReportHeader[] = useMemo(
        () => [
            { label: t('REPORT_Header_Date', 'Date'), field: 'date', width: 1.2 },
            { label: t('REPORT_Header_OrderNo', 'Order #'), field: 'orderNo', width: 2.2 },
            { label: t('REPORT_Header_Employee', 'Employee'), field: 'employee', width: 1.8 },
            {
                label: t('REPORT_Header_Amount', 'Amount'),
                field: 'amount',
                width: 1,
                align: 'right',
                format: 'money',
                sum: true,
            },
        ],
        []
    );

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        const task = InteractionManager.runAfterInteractions(() => {
            getOrdersForStatuses({
                statuses: [OrderStatus.REFUNDED],
                range: normalizeReportRange(dateRange),
            })
                .then((orders) => {
                    if (cancelled) return;
                    setRows(buildRefundReportRows(orders));
                })
                .catch(() => {
                    if (!cancelled) {
                        setRows([]);
                    }
                })
                .finally(() => {
                    if (!cancelled) {
                        setLoading(false);
                    }
                });
        });

        return () => {
            cancelled = true;
            task.cancel?.();
        };
    }, [dateRange]);

    useEffect(() => {
        if (loading || rows.length) return;

        emptyOpacity.setValue(0);
        emptyTranslateY.setValue(12);
        Animated.parallel([
            Animated.timing(emptyOpacity, {
                toValue: 1,
                duration: 220,
                useNativeDriver: true,
            }),
            Animated.timing(emptyTranslateY, {
                toValue: 0,
                duration: 220,
                useNativeDriver: true,
            }),
        ]).start();
    }, [emptyOpacity, emptyTranslateY, loading, rows.length]);

    const insights = useMemo(
        () =>
            buildRefundInsights(
                rows.map((row) => ({
                    status: OrderStatus.REFUNDED,
                    total: row.amount,
                    employeeName: row.employee,
                    refundInfo: {
                        employeeName: row.employee,
                        comments: row.reason === '-' ? null : row.reason,
                    },
                    orderNo: row.orderNo,
                    updatedAt: row.date,
                    orderDate: row.date,
                    lines: [],
                })) as any
            ),
        [rows]
    );

    const exportToCsv = async () => {
        const title = t('REPORT_RefundReportTitle', 'Refund Report');
        const filename = `${toSafeFileSlug(title)}-${moment().format('YYYYMMDD-HHmmss')}.csv`;
        const path = `${RNFS.DocumentDirectoryPath}/${filename}`;
        const csv = buildReportCsv(headers, rows as Record<string, unknown>[], {
            amount: insights.totalAmount,
        });

        await RNFS.writeFile(path, csv, 'utf8');
        await Share.share({
            title: filename,
            url: `file://${path}`,
        });
    };

    return (
        <UIScreen padded>
            <View style={styles.screen}>
                <View style={styles.container}>
                    <UIStack spacing="lg">
                        <UICard tone="muted" radius="lg">
                            <Text style={styles.title}>
                                {t('REPORT_RefundReportTitle', 'Refund Report')}
                            </Text>
                            <Text style={styles.subtitle}>
                                {t(
                                    'REPORT_RefundReportSubtitle',
                                    'Track refund volume, who processed it, and what is being refunded.'
                                )}
                            </Text>
                            <UIDateRange
                                initialRange={dateRange}
                                onRangeChange={setDateRange}
                                showSummary={false}
                                rightAction={
                                    <Pressable style={styles.exportButton} onPress={exportToCsv}>
                                        <Icon
                                            name="download-outline"
                                            type="ionicon"
                                            size={14}
                                            color={tokens.colors.accent}
                                        />
                                        <Text style={styles.exportButtonText}>
                                            {t('REPORT_Export', 'Export')}
                                        </Text>
                                    </Pressable>
                                }
                            />
                        </UICard>

                        {loading && (
                            <UICard style={styles.centerBlock}>
                                <UISpinner size="small" message={t('COMMON_Loading', 'Loading...')} />
                            </UICard>
                        )}

                        {!loading && !rows.length && (
                            <UICard tone="muted" style={styles.centerBlock}>
                                <Animated.View
                                    style={{
                                        opacity: emptyOpacity,
                                        transform: [{ translateY: emptyTranslateY }],
                                    }}
                                >
                                    <UIEmptyState
                                        title={t('REPORT_NoRefunds', 'No refunds found')}
                                        text={t(
                                            'REPORT_NoRefundsHelp',
                                            'Refund activity in the selected period will appear here.'
                                        )}
                                    />
                                </Animated.View>
                            </UICard>
                        )}

                        {!loading && !!rows.length && (
                            <>
                                <View style={styles.kpiRow}>
                                    <View style={styles.kpiCard}>
                                        <Text style={styles.kpiLabel}>Refund Total</Text>
                                        <Text style={styles.kpiValue}>
                                            ${insights.totalAmount.toFixed(2)}
                                        </Text>
                                    </View>
                                    <View style={styles.kpiCardSpaced}>
                                        <Text style={styles.kpiLabel}>Refund Count</Text>
                                        <Text style={styles.kpiValue}>{insights.totalOrders}</Text>
                                    </View>
                                    <View style={styles.kpiCardSpaced}>
                                        <Text style={styles.kpiLabel}>Average Refund</Text>
                                        <Text style={styles.kpiValue}>
                                            ${insights.averageAmount.toFixed(2)}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.insightRow}>
                                    <UICard style={styles.insightCard}>
                                        <Text style={styles.insightTitle}>Top Refunding Employees</Text>
                                        {insights.topEmployees.map((item) => (
                                            <View key={item.name} style={styles.rankedRow}>
                                                <Text style={styles.rankedLabel}>{item.name}</Text>
                                                <Text style={styles.rankedValue}>{item.value}</Text>
                                            </View>
                                        ))}
                                    </UICard>
                                    <UICard style={styles.insightCardSpaced}>
                                        <Text style={styles.insightTitle}>Top Refund Reasons</Text>
                                        {!!insights.reasons.length ? (
                                            insights.reasons.map((item) => (
                                                <View key={item.name} style={styles.rankedRow}>
                                                    <Text style={styles.rankedLabel}>{item.name}</Text>
                                                    <Text style={styles.rankedValue}>{item.value}</Text>
                                                </View>
                                            ))
                                        ) : (
                                            <Text style={styles.emptyInline}>
                                                No refund notes captured.
                                            </Text>
                                        )}
                                    </UICard>
                                </View>

                                <UICard>
                                    <Text style={styles.tableTitle}>Recent Refund Activity</Text>
                                    <View style={styles.tableHeader}>
                                        <Text style={[styles.tableHeaderCell, styles.dateCell]}>Date</Text>
                                        <Text style={[styles.tableHeaderCell, styles.orderCell]}>
                                            Order #
                                        </Text>
                                        <Text style={[styles.tableHeaderCell, styles.employeeCell]}>
                                            Employee
                                        </Text>
                                        <Text
                                            style={[
                                                styles.tableHeaderCell,
                                                styles.amountCell,
                                                styles.textRight,
                                            ]}
                                        >
                                            Amount
                                        </Text>
                                    </View>
                                    <FlatList
                                        data={rows}
                                        keyExtractor={(item) => `${item.orderNo}-${item.date}`}
                                        renderItem={({ item }) => (
                                            <View style={styles.tableRow}>
                                                <Text style={[styles.tableValue, styles.dateCell]}>
                                                    {item.date}
                                                </Text>
                                                <Text style={[styles.tableValue, styles.orderCell]}>
                                                    {item.orderNo}
                                                </Text>
                                                <Text
                                                    style={[styles.tableValue, styles.employeeCell]}
                                                >
                                                    {item.employee}
                                                </Text>
                                                <Text
                                                    style={[
                                                        styles.tableValue,
                                                        styles.amountCell,
                                                        styles.textRight,
                                                    ]}
                                                >
                                                    ${item.amount.toFixed(2)}
                                                </Text>
                                            </View>
                                        )}
                                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                                    />
                                </UICard>
                            </>
                        )}
                    </UIStack>
                </View>
            </View>
        </UIScreen>
    );
}

const useStyles = (tokens: ReturnType<typeof useDesignTokens>) =>
    StyleSheet.create({
        screen: {
            flex: 1,
        },
        container: {
            width: '100%',
        },
        title: {
            color: tokens.colors.textPrimary,
            fontSize: 24,
            fontWeight: '800',
            marginBottom: tokens.spacing.xs,
        },
        subtitle: {
            color: tokens.colors.textSecondary,
            fontSize: 15,
            lineHeight: 22,
            marginBottom: tokens.spacing.md,
        },
        exportButton: {
            alignItems: 'center',
            borderColor: tokens.colors.accent,
            borderRadius: 16,
            borderWidth: 1,
            flexDirection: 'row',
            paddingHorizontal: 14,
            paddingVertical: 10,
        },
        exportButtonText: {
            color: tokens.colors.accent,
            fontSize: 14,
            fontWeight: '700',
            marginLeft: 8,
        },
        centerBlock: {
            minHeight: 180,
            justifyContent: 'center',
        },
        kpiRow: {
            flexDirection: 'row',
        },
        kpiCard: {
            backgroundColor: '#101720',
            borderColor: '#243245',
            borderRadius: 22,
            borderWidth: 1,
            flex: 1,
            paddingHorizontal: tokens.spacing.lg,
            paddingVertical: tokens.spacing.lg,
        },
        kpiCardSpaced: {
            backgroundColor: '#101720',
            borderColor: '#243245',
            borderRadius: 22,
            borderWidth: 1,
            flex: 1,
            marginLeft: tokens.spacing.md,
            paddingHorizontal: tokens.spacing.lg,
            paddingVertical: tokens.spacing.lg,
        },
        kpiLabel: {
            color: tokens.colors.textSecondary,
            fontSize: 13,
            fontWeight: '700',
            marginBottom: tokens.spacing.sm,
            textTransform: 'uppercase',
        },
        kpiValue: {
            color: tokens.colors.textPrimary,
            fontSize: 30,
            fontWeight: '800',
        },
        insightRow: {
            flexDirection: 'row',
        },
        insightCard: {
            flex: 1,
            minHeight: 220,
        },
        insightCardSpaced: {
            flex: 1,
            marginLeft: tokens.spacing.md,
            minHeight: 220,
        },
        insightTitle: {
            color: tokens.colors.textPrimary,
            fontSize: 18,
            fontWeight: '700',
            marginBottom: tokens.spacing.md,
        },
        rankedRow: {
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: tokens.spacing.md,
        },
        rankedLabel: {
            color: tokens.colors.textPrimary,
            flex: 1,
            fontSize: 16,
            fontWeight: '600',
            marginRight: tokens.spacing.md,
        },
        rankedValue: {
            color: tokens.colors.textPrimary,
            fontSize: 16,
            fontWeight: '700',
        },
        emptyInline: {
            color: tokens.colors.textSecondary,
            fontSize: 15,
            lineHeight: 22,
        },
        tableTitle: {
            color: tokens.colors.textPrimary,
            fontSize: 18,
            fontWeight: '700',
            marginBottom: tokens.spacing.md,
        },
        tableHeader: {
            flexDirection: 'row',
            marginBottom: tokens.spacing.sm,
            paddingBottom: tokens.spacing.sm,
        },
        tableHeaderCell: {
            color: tokens.colors.textSecondary,
            fontSize: 13,
            fontWeight: '700',
            textTransform: 'uppercase',
        },
        tableRow: {
            alignItems: 'center',
            flexDirection: 'row',
            paddingVertical: tokens.spacing.md,
        },
        tableValue: {
            color: tokens.colors.textPrimary,
            fontSize: 15,
            lineHeight: 22,
        },
        dateCell: {
            flex: 1.1,
            paddingRight: tokens.spacing.md,
        },
        orderCell: {
            flex: 2.3,
            paddingRight: tokens.spacing.md,
        },
        employeeCell: {
            flex: 1.8,
            paddingRight: tokens.spacing.md,
        },
        amountCell: {
            flex: 1,
        },
        textRight: {
            textAlign: 'right',
        },
        separator: {
            backgroundColor: '#1A2432',
            height: 1,
        },
    });

export default RefundReport;
