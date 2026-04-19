import React, { useEffect, useMemo, useState } from 'react';
import {
    buildRefundInsights,
    buildRefundReportRows,
    getRefundLinesForRefundIds,
    getRefundsForRange,
} from '@pos/reporting/data-access';
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

const emptyInsights = {
    totalAmount: 0,
    totalOrders: 0,
    averageAmount: 0,
    topEmployees: [] as Array<{ name: string; value: string }>,
    topProducts: [] as Array<{ name: string; value: string }>,
    reasons: [] as Array<{ name: string; value: string }>,
};

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
    const [insights, setInsights] = useState(emptyInsights);
    const [emptyOpacity] = useState(() => new Animated.Value(0));
    const [emptyTranslateY] = useState(() => new Animated.Value(12));

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
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true);
        const task = InteractionManager.runAfterInteractions(() => {
            getRefundsForRange({
                range: normalizeReportRange(dateRange),
            })
                .then(async (refunds) => {
                    if (cancelled) return;
                    const refundLines = await getRefundLinesForRefundIds(
                        refunds.map((refund) => refund.id)
                    );
                    if (cancelled) return;
                    setRows(buildRefundReportRows(refunds));
                    setInsights(buildRefundInsights(refunds, refundLines));
                })
                .catch(() => {
                    if (!cancelled) {
                        setRows([]);
                        setInsights(emptyInsights);
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
                                <View style={styles.sectionIntro}>
                                    <Text style={styles.sectionEyebrow}>Refund Overview</Text>
                                    <Text style={styles.sectionLead}>
                                        A quick view of refund volume, average value, and the team members
                                        processing the most refunds.
                                    </Text>
                                </View>
                                <View style={styles.kpiRow}>
                                    <View style={[styles.kpiCard, styles.kpiCardPrimary]}>
                                        <Text style={styles.kpiLabel}>Refund Total</Text>
                                        <Text style={styles.kpiValue}>
                                            ${insights.totalAmount.toFixed(2)}
                                        </Text>
                                    </View>
                                    <View style={[styles.kpiCardSpaced, styles.kpiCardSecondary]}>
                                        <Text style={styles.kpiLabel}>Refund Count</Text>
                                        <Text style={styles.kpiValue}>{insights.totalOrders}</Text>
                                    </View>
                                    <View style={[styles.kpiCardSpaced, styles.kpiCardTertiary]}>
                                        <Text style={styles.kpiLabel}>Average Refund</Text>
                                        <Text style={styles.kpiValue}>
                                            ${insights.averageAmount.toFixed(2)}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.insightRow}>
                                    <UICard style={[styles.insightCard, styles.insightCardEmphasis]}>
                                        <Text style={styles.insightEyebrow}>Team</Text>
                                        <Text style={styles.insightTitle}>Top Refunding Employees</Text>
                                        {insights.topEmployees.map((item) => (
                                            <View key={item.name} style={styles.rankedRow}>
                                                <Text style={styles.rankedLabel}>{item.name}</Text>
                                                <View style={styles.rankedValueBadge}>
                                                    <Text style={styles.rankedValue}>{item.value}</Text>
                                                </View>
                                            </View>
                                        ))}
                                    </UICard>
                                    <UICard style={[styles.insightCardSpaced, styles.insightCardMuted]}>
                                        <Text style={styles.insightEyebrow}>Trends</Text>
                                        <Text style={styles.insightTitle}>Top Refund Reasons</Text>
                                        {insights.reasons.length ? (
                                            insights.reasons.map((item) => (
                                                <View key={item.name} style={styles.rankedRow}>
                                                    <Text style={styles.rankedLabel}>{item.name}</Text>
                                                    <View style={styles.reasonCountBadge}>
                                                        <Text style={styles.reasonCountText}>{item.value}</Text>
                                                    </View>
                                                </View>
                                            ))
                                        ) : (
                                            <Text style={styles.emptyInline}>
                                                No refund notes captured.
                                            </Text>
                                        )}
                                    </UICard>
                                </View>

                                <UICard style={styles.tableCard}>
                                    <View style={styles.tableHeaderWrap}>
                                        <View>
                                            <Text style={styles.tableEyebrow}>Activity</Text>
                                            <Text style={styles.tableTitle}>Recent Refund Activity</Text>
                                        </View>
                                        <View style={styles.tableBadge}>
                                            <Text style={styles.tableBadgeText}>{rows.length} refunds</Text>
                                        </View>
                                    </View>
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
                                                        styles.tableAmount,
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
        sectionIntro: {
            marginBottom: tokens.spacing.sm,
        },
        sectionEyebrow: {
            color: tokens.colors.accent,
            fontSize: 12,
            fontWeight: '800',
            letterSpacing: 1.1,
            marginBottom: tokens.spacing.xs,
            textTransform: 'uppercase',
        },
        sectionLead: {
            color: tokens.colors.textSecondary,
            fontSize: 15,
            lineHeight: 22,
            maxWidth: 760,
        },
        kpiRow: {
            flexDirection: 'row',
        },
        kpiCard: {
            borderRadius: 24,
            borderWidth: 1,
            flex: 1,
            overflow: 'hidden',
            paddingHorizontal: tokens.spacing.xl,
            paddingVertical: tokens.spacing.xl,
        },
        kpiCardPrimary: {
            backgroundColor: '#101B2A',
            borderColor: '#274365',
        },
        kpiCardSecondary: {
            backgroundColor: '#17152A',
            borderColor: '#39306B',
        },
        kpiCardTertiary: {
            backgroundColor: '#1C1620',
            borderColor: '#5C374B',
        },
        kpiCardSpaced: {
            borderRadius: 22,
            flex: 1,
            marginLeft: tokens.spacing.md,
        },
        kpiLabel: {
            color: '#B7C6DA',
            fontSize: 12,
            fontWeight: '700',
            marginBottom: tokens.spacing.sm,
            opacity: 0.92,
            textTransform: 'uppercase',
        },
        kpiValue: {
            color: tokens.colors.textPrimary,
            fontSize: 32,
            fontWeight: '800',
        },
        insightRow: {
            flexDirection: 'row',
        },
        insightCard: {
            flex: 1,
            minHeight: 220,
            paddingVertical: tokens.spacing.md,
        },
        insightCardSpaced: {
            flex: 1,
            marginLeft: tokens.spacing.md,
            minHeight: 220,
            paddingVertical: tokens.spacing.md,
        },
        insightCardEmphasis: {
            borderColor: '#28425F',
            borderWidth: 1,
        },
        insightCardMuted: {
            borderColor: '#2A3340',
            borderWidth: 1,
        },
        insightEyebrow: {
            color: tokens.colors.accent,
            fontSize: 12,
            fontWeight: '800',
            letterSpacing: 1,
            marginBottom: tokens.spacing.xs,
            textTransform: 'uppercase',
        },
        insightTitle: {
            color: tokens.colors.textPrimary,
            fontSize: 18,
            fontWeight: '700',
            marginBottom: tokens.spacing.lg,
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
        rankedValueBadge: {
            backgroundColor: '#16263A',
            borderColor: '#2E4D73',
            borderRadius: 999,
            borderWidth: 1,
            paddingHorizontal: tokens.spacing.md,
            paddingVertical: tokens.spacing.xs,
        },
        rankedValue: {
            color: tokens.colors.textPrimary,
            fontSize: 14,
            fontWeight: '700',
        },
        reasonCountBadge: {
            alignItems: 'center',
            backgroundColor: '#1B222C',
            borderColor: '#33414F',
            borderRadius: 999,
            borderWidth: 1,
            minWidth: 40,
            paddingHorizontal: tokens.spacing.md,
            paddingVertical: tokens.spacing.xs,
        },
        reasonCountText: {
            color: tokens.colors.textPrimary,
            fontSize: 14,
            fontWeight: '800',
        },
        emptyInline: {
            color: tokens.colors.textSecondary,
            fontSize: 15,
            lineHeight: 22,
        },
        tableCard: {
            borderColor: '#26313E',
            borderRadius: 24,
            borderWidth: 1,
            paddingVertical: tokens.spacing.md,
        },
        tableHeaderWrap: {
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: tokens.spacing.lg,
        },
        tableEyebrow: {
            color: tokens.colors.accent,
            fontSize: 12,
            fontWeight: '800',
            letterSpacing: 1,
            marginBottom: tokens.spacing.xs,
            textTransform: 'uppercase',
        },
        tableTitle: {
            color: tokens.colors.textPrimary,
            fontSize: 18,
            fontWeight: '700',
        },
        tableBadge: {
            backgroundColor: '#16222F',
            borderColor: '#2C445B',
            borderRadius: 999,
            borderWidth: 1,
            paddingHorizontal: tokens.spacing.md,
            paddingVertical: tokens.spacing.xs,
        },
        tableBadgeText: {
            color: tokens.colors.textPrimary,
            fontSize: 13,
            fontWeight: '700',
        },
        tableHeader: {
            backgroundColor: '#121A24',
            borderRadius: 16,
            flexDirection: 'row',
            marginBottom: tokens.spacing.sm,
            paddingHorizontal: tokens.spacing.md,
            paddingVertical: tokens.spacing.sm,
        },
        tableHeaderCell: {
            color: tokens.colors.textSecondary,
            fontSize: 13,
            fontWeight: '700',
            textTransform: 'uppercase',
        },
        tableRow: {
            alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.01)',
            borderRadius: 14,
            flexDirection: 'row',
            paddingHorizontal: tokens.spacing.md,
            paddingVertical: tokens.spacing.md,
        },
        tableValue: {
            color: tokens.colors.textPrimary,
            fontSize: 15,
            lineHeight: 22,
        },
        tableAmount: {
            color: '#F1A9A0',
            fontWeight: '800',
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
            height: tokens.spacing.sm,
        },
    });

export default RefundReport;
