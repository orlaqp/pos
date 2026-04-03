import React, { useEffect, useMemo, useState } from 'react';
import { Order, PaymentType, SalesSummary } from '@pos/shared/models';
import {
    DateRange,
    UICard,
    UIDateRange,
    UIScreen,
    UISpinner,
    UIStack,
} from '@pos/shared/ui-native';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import moment from 'moment';

import { Animated, InteractionManager, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LineChartComponent } from '../line-chart/line-chart';
import ListWidget from '../list-widget/list-widget';
import PieChart from '../pie-chart/pie-chart';
import Widget from '../widget/widget';

import {
    getSalesForRange,
    getSalesSummaryForRange,
} from '@pos/reporting/data-access';
import { sortDescListBy } from '@pos/shared/utils';
import { EACH } from '@pos/unit-of-measures/data-access';
import i18next from 'i18next';
import { useSelector } from 'react-redux';
import { selectAllCategories } from '@pos/categories/data-access';

/* eslint-disable-next-line */
export interface DashboardProps {}

interface DashboardSupplemental {
    topCategories: { name: string; value: string }[];
    paymentMix: { name: string; value: number }[];
    paymentMixBreakdown: { name: string; value: string }[];
    paymentMixPercentages: { name: string; amount: string; percent: string; ratio: number }[];
    totalDiscounts: number;
    discountedOrders: number;
}

const getDashboardLineAmount = (line: NonNullable<Order['lines']>[number]) =>
    Number(line?.lineTotalBeforeTax ?? Number(line?.price || 0) * Number(line?.quantity || 0));

export const hasSalesData = (summary?: SalesSummary) =>
    !!summary && summary.totalAmount > 0;

export const buildTopProductItems = (summary?: SalesSummary) =>
    !summary?.products
        ? []
        : summary.products
              .slice(0, 5)
              .filter((p) => p && p?.amount > 0)
              .map((p) => ({
                  name: `${p.unitOfMeasure} - ${p?.productName}`,
                  value:
                      p.unitOfMeasure === EACH
                          ? p.quantity
                          : +p.quantity.toFixed(2),
              }));

export const buildTopEmployeeItems = (summary?: SalesSummary) =>
    !summary?.employees
        ? []
        : summary.employees.slice(0, 5).map((e) => ({
              name: e?.employeeName,
              value: `$${e?.amount.toFixed(2)}`,
          }));

export const getDashboardAverageTicket = (summary?: SalesSummary) => {
    const totalAmount = Number(summary?.totalAmount || 0);
    const totalOrders =
        Number(summary?.totalOrders || 0) ||
        Number(
            (summary?.employees || []).reduce(
                (sum, employee) => sum + Number(employee?.orders || 0),
                0
            )
        );
    if (!totalOrders) {
        return 0;
    }

    return totalAmount / totalOrders;
};

export const getDashboardItemsSold = (summary?: SalesSummary) =>
    Number(
        (summary?.products || []).reduce(
            (sum, item) =>
                sum + (Number(item?.amount || 0) > 0 ? Number(item?.quantity || 0) : 0),
            0
        )
    );

export const buildDashboardSupplemental = (
    orders: Order[],
    categoriesById: Record<string, string>
): DashboardSupplemental => {
    const categoryTotals: Record<string, number> = {};
    const paymentTotals: Record<string, number> = {
        [PaymentType.CASH]: 0,
        [PaymentType.CC]: 0,
        [PaymentType.CHECK]: 0,
        [PaymentType.EBT]: 0,
    };

    let totalDiscounts = 0;
    let discountedOrders = 0;

    orders.forEach((order) => {
        const discountTotal = Number(order.discountTotal || 0);
        if (discountTotal > 0) {
            totalDiscounts += discountTotal;
            discountedOrders += 1;
        }

        (order.paymentInfo?.payments || []).forEach((payment) => {
            const type = String(payment?.type || '').toUpperCase();
            if (!type) return;
            paymentTotals[type] = (paymentTotals[type] || 0) + Number(payment?.amount || 0);
        });

        (order.lines || []).forEach((line) => {
            const categoryId = line?.categoryId;
            if (!categoryId) return;
            const amount = getDashboardLineAmount(line);
            categoryTotals[categoryId] = (categoryTotals[categoryId] || 0) + amount;
        });
    });

    const topCategories = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([categoryId, amount]) => ({
            name: categoriesById[categoryId] || 'Unknown',
            value: `$${amount.toFixed(2)}`,
        }));

    const paymentMix = [
        { name: 'Cards', value: paymentTotals[PaymentType.CC] || 0 },
        { name: 'Cash', value: paymentTotals[PaymentType.CASH] || 0 },
        { name: 'EBT', value: paymentTotals[PaymentType.EBT] || 0 },
        { name: 'Checks', value: paymentTotals[PaymentType.CHECK] || 0 },
    ]
        .filter((item) => item.value > 0)
        .sort((a, b) => b.value - a.value);

    const paymentMixBreakdown = paymentMix.map((item) => ({
        name: item.name,
        value: `$${item.value.toFixed(2)}`,
    }));
    const paymentMixTotal = paymentMix.reduce((sum, item) => sum + item.value, 0);
    const paymentMixPercentages = paymentMix.map((item) => ({
        name: item.name,
        amount: `$${item.value.toFixed(2)}`,
        percent: paymentMixTotal
            ? `${Math.round((item.value / paymentMixTotal) * 100)}%`
            : '0%',
        ratio: paymentMixTotal ? item.value / paymentMixTotal : 0,
    }));

    return {
        topCategories,
        paymentMix,
        paymentMixBreakdown,
        paymentMixPercentages,
        totalDiscounts,
        discountedOrders,
    };
};

export const buildRevenueOverTime = (summary?: SalesSummary) =>
    summary?.dates?.map((i) => ({
        label: i?.datePart.substring(5),
        values: [i?.amount],
    }));

export const normalizeDashboardRange = (range?: DateRange): DateRange => {
    const resolved = range || {
        startDate: moment().startOf('day'),
        endDate: moment().endOf('day'),
    };

    return {
        startDate: resolved.startDate.clone().startOf('day'),
        endDate: resolved.endDate.clone().endOf('day'),
    };
};

export const sortDashboardSummary = (summary?: SalesSummary) => {
    sortDescListBy(summary?.employees as any, 'amount');
    sortDescListBy(summary?.products as any, 'quantity');
    return summary;
};

export const formatDashboardDateRange = (range: DateRange) => {
    const start = range.startDate.format('MMM D, YYYY');
    const end = range.endDate.format('MMM D, YYYY');
    if (start === end) {
        return start;
    }

    return `${start} - ${end}`;
};

export const loadDashboardSummary = async (range?: DateRange) => {
    const normalizedRange = normalizeDashboardRange(range);
    const summary = await getSalesSummaryForRange('PAID', normalizedRange);
    return sortDashboardSummary(summary);
};

export function Dashboard(_props: DashboardProps) {
    const tokens = useDesignTokens();
    const styles = useStyles(tokens);
    const [loading, setLoading] = useState<boolean>(true);
    const [dateRange, setDateRange] = useState<DateRange>({
        startDate: moment().startOf('day'),
        endDate: moment().endOf('day'),
    });
    const [salesSummary, setSalesSummary] = useState<SalesSummary>();
    const [supplemental, setSupplemental] = useState<DashboardSupplemental>();
    const [emptyOpacity] = useState(() => new Animated.Value(0));
    const [emptyTranslateY] = useState(() => new Animated.Value(12));
    const categories = useSelector(selectAllCategories);
    const t = (key: string, fallback: string) =>
        i18next.isInitialized && i18next.exists(key)
            ? String(i18next.t(key))
            : fallback;
    const formattedRange = formatDashboardDateRange(dateRange);
    const categoriesById = useMemo(
        () =>
            Object.fromEntries(
                (categories || []).map((category) => [category.id, category.name || 'Unknown'])
            ),
        [categories]
    );

    const updateDateRange = (range: DateRange) => {
        setDateRange(range);
    };

    useEffect(() => {
        let cancelled = false;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSupplemental(undefined);

        const interactionHandle = InteractionManager.runAfterInteractions(() => {
            (async () => {
                try {
                    const normalizedRange = normalizeDashboardRange(dateRange);
                    const summary = await loadDashboardSummary(normalizedRange);

                    if (cancelled) {
                        return;
                    }

                    setSalesSummary(summary);
                    setLoading(false);

                    getSalesForRange('PAID', normalizedRange)
                        .then((orders) => {
                            if (!cancelled) {
                                setSupplemental(
                                    buildDashboardSupplemental(orders || [], categoriesById)
                                );
                            }
                        })
                        .catch(() => {
                            if (!cancelled) {
                                setSupplemental(undefined);
                            }
                        });
                } catch {
                    if (!cancelled) {
                        setSalesSummary(undefined);
                        setSupplemental(undefined);
                        setLoading(false);
                    }
                }
            })();
        });

        return () => {
            cancelled = true;
            interactionHandle?.cancel?.();
        };
    }, [categoriesById, dateRange]);

    useEffect(() => {
        if (loading || hasSalesData(salesSummary)) return;

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
    }, [emptyOpacity, emptyTranslateY, loading, salesSummary]);

    return (
        <UIScreen padded>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.container}>
                    <UIStack spacing="lg">
                        <View style={styles.heroCard}>
                            <View style={styles.heroCopy}>
                                <Text style={styles.eyebrow}>
                                    {t('DASHBOARD_Overview', 'Overview')}
                                </Text>
                                <Text style={styles.title}>
                                    {t('DASHBOARD_Title', 'Dashboard')}
                                </Text>
                                <Text style={styles.subtitle}>
                                    {t(
                                        'DASHBOARD_Subtitle',
                                        'Sales performance and trends across the selected period.'
                                    )}
                                </Text>
                                <View style={styles.heroMetaRow}>
                                    <View style={styles.heroMetaPill}>
                                        <Text style={styles.heroMetaLabel}>
                                            {t('DASHBOARD_Status', 'Status')}
                                        </Text>
                                        <Text style={styles.heroMetaValue}>
                                            {t('DASHBOARD_PaidSales', 'Paid sales')}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.heroRangePanel}>
                                <View style={styles.rangeSummaryCard}>
                                    <Text style={styles.rangeSummaryLabel}>
                                        {t('DASHBOARD_SelectedRange', 'Selected range')}
                                    </Text>
                                    <Text style={styles.rangeSummaryValue}>
                                        {formattedRange}
                                    </Text>
                                </View>
                                <UIDateRange
                                    initialRange={dateRange}
                                    onRangeChange={updateDateRange}
                                    showSummary={false}
                                />
                            </View>
                        </View>

                        {loading && (
                            <UICard style={styles.centerBlock}>
                                <UISpinner
                                    size="small"
                                    message={t('COMMON_Loading', 'Loading...')}
                                />
                            </UICard>
                        )}

                        {!loading && !hasSalesData(salesSummary) && (
                            <UICard tone="muted" style={styles.centerBlock}>
                                <Animated.View
                                    style={[
                                        styles.emptyWrap,
                                        {
                                            opacity: emptyOpacity,
                                            transform: [{ translateY: emptyTranslateY }],
                                        },
                                    ]}
                                >
                                    <Text style={styles.emptyTitle}>
                                        {t(
                                            'DASHBOARD_NoDataForRange',
                                            'No data found for this date range'
                                        )}
                                    </Text>
                                    <Text style={styles.emptySubtitle}>
                                        {t(
                                            'DASHBOARD_NoDataForRangeHelp',
                                            'Completed sales in the selected period will appear here.'
                                        )}
                                    </Text>
                                </Animated.View>
                            </UICard>
                        )}

                        {!loading && hasSalesData(salesSummary) && (
                            <>
                                <View style={styles.metricsRow}>
                                    <View style={styles.metricColumn}>
                                        <View style={styles.metricShell}>
                                            <Widget
                                                backgroundColor="#0E2233"
                                                icon="trending-up"
                                                text={t('DASHBOARD_GrossIncome', 'Gross Income')}
                                                value={`$ ${salesSummary.totalAmount.toFixed(
                                                    2
                                                )}`}
                                                primaryTextColor="#EAF4FF"
                                                primaryTextSize={24}
                                            />
                                        </View>
                                    </View>
                                    <View style={styles.metricColumnSpaced}>
                                        <View style={styles.metricShell}>
                                            <Widget
                                                backgroundColor="#241A0F"
                                                icon="sigma"
                                                text={t('DASHBOARD_Orders', 'Orders')}
                                                value={salesSummary.totalOrders.toString()}
                                                primaryTextColor="#FFF4D7"
                                                primaryTextSize={24}
                                            />
                                        </View>
                                    </View>
                                    <View style={styles.metricColumnSpaced}>
                                        <View style={styles.metricShell}>
                                            <Widget
                                                backgroundColor="#11201A"
                                                icon="calculator-variant-outline"
                                                text={t(
                                                    'DASHBOARD_AverageTicket',
                                                    'Average Ticket'
                                                )}
                                                value={`$ ${getDashboardAverageTicket(
                                                    salesSummary
                                                ).toFixed(2)}`}
                                                primaryTextColor="#E9FFF3"
                                                primaryTextSize={24}
                                            />
                                        </View>
                                    </View>
                                    <View style={styles.metricColumnSpaced}>
                                        <View style={styles.metricShell}>
                                            <Widget
                                                backgroundColor="#22132A"
                                                icon="package-variant-closed"
                                                text={t(
                                                    'DASHBOARD_ItemsSold',
                                                    'Items Sold'
                                                )}
                                                value={getDashboardItemsSold(
                                                    salesSummary
                                                ).toLocaleString()}
                                                primaryTextColor="#F5E9FF"
                                                primaryTextSize={24}
                                            />
                                        </View>
                                    </View>
                                </View>

                                <UICard style={styles.analyticsCard}>
                                    <View style={styles.insightsRow}>
                                        <View style={styles.insightsPrimary}>
                                            <PieChart
                                                header={t(
                                                    'DASHBOARD_TopProducts',
                                                    'Top 5 Products'
                                                )}
                                                items={buildTopProductItems(salesSummary)}
                                            />
                                        </View>
                                        <View style={styles.insightsSecondary}>
                                            <ListWidget
                                                header={t(
                                                    'DASHBOARD_TopEmployees',
                                                    'Top 5 Employees'
                                                )}
                                                items={buildTopEmployeeItems(salesSummary)}
                                            />
                                        </View>
                                    </View>
                                </UICard>

                                <View style={styles.secondaryInsightsRow}>
                                    <View style={styles.metricColumn}>
                                        <UICard style={styles.analyticsCard}>
                                            <ListWidget
                                                header={t(
                                                    'DASHBOARD_TopCategories',
                                                    'Top 5 Categories'
                                                )}
                                                items={supplemental?.topCategories || []}
                                            />
                                        </UICard>
                                    </View>
                                    <View style={styles.metricColumnSpaced}>
                                        <UICard style={styles.analyticsCard}>
                                            <View style={styles.paymentMixList}>
                                                <Text style={styles.paymentMixHeader}>
                                                    {t(
                                                        'DASHBOARD_PaymentMix',
                                                        'How Customers Paid'
                                                    )}
                                                </Text>
                                                <Text style={styles.paymentMixSubheader}>
                                                    {t(
                                                        'DASHBOARD_PaymentMixHelp',
                                                        'A breakdown of completed payments for the selected range.'
                                                    )}
                                                </Text>
                                                {(
                                                    supplemental?.paymentMixPercentages || []
                                                ).map((item) => (
                                                    <View
                                                        key={item.name}
                                                        style={styles.paymentMixListRow}
                                                    >
                                                        <View
                                                            style={
                                                                styles.paymentMixListHeaderRow
                                                            }
                                                        >
                                                            <Text
                                                                style={
                                                                    styles.paymentMixListLabel
                                                                }
                                                            >
                                                                {item.name}
                                                            </Text>
                                                            <View
                                                                style={
                                                                    styles.paymentMixListValues
                                                                }
                                                            >
                                                                <Text
                                                                    style={
                                                                        styles.paymentMixListAmount
                                                                    }
                                                                >
                                                                    {item.amount}
                                                                </Text>
                                                                <Text
                                                                    style={
                                                                        styles.paymentMixListPercent
                                                                    }
                                                                >
                                                                    {item.percent}
                                                                </Text>
                                                            </View>
                                                        </View>
                                                        <View
                                                            style={
                                                                styles.paymentMixBarTrack
                                                            }
                                                        >
                                                            <View
                                                                style={[
                                                                    styles.paymentMixBarFill,
                                                                    {
                                                                        width: `${Math.max(
                                                                            item.ratio * 100,
                                                                            item.ratio > 0
                                                                                ? 8
                                                                                : 0
                                                                        )}%`,
                                                                    },
                                                                ]}
                                                            />
                                                        </View>
                                                    </View>
                                                ))}
                                            </View>
                                        </UICard>
                                    </View>
                                    <View style={styles.metricColumnSpaced}>
                                        <View style={styles.discountInsightsShell}>
                                            <Text style={styles.discountInsightsEyebrow}>
                                                {t('DASHBOARD_Discounts', 'Discounts')}
                                            </Text>
                                            <Text style={styles.discountInsightsValue}>
                                                ${Number(supplemental?.totalDiscounts || 0).toFixed(2)}
                                            </Text>
                                            <Text style={styles.discountInsightsLabel}>
                                                {t(
                                                    'DASHBOARD_TotalDiscountsGiven',
                                                    'Total discounts given'
                                                )}
                                            </Text>
                                            <View style={styles.discountInsightsDivider} />
                                            <Text style={styles.discountInsightsMeta}>
                                                {`${Number(
                                                    supplemental?.discountedOrders || 0
                                                )} ${t(
                                                    'DASHBOARD_DiscountedOrders',
                                                    'discounted orders'
                                                )}`}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                <UICard style={styles.chartCard}>
                                    <LineChartComponent
                                        header={t(
                                            'DASHBOARD_RevenueOverTime',
                                            'Revenue over time'
                                        )}
                                        data={buildRevenueOverTime(salesSummary)}
                                    />
                                </UICard>
                            </>
                        )}
                    </UIStack>
                </View>
            </ScrollView>
        </UIScreen>
    );
}

const useStyles = (tokens: ReturnType<typeof useDesignTokens>) =>
    StyleSheet.create({
        scrollContent: {
            paddingBottom: tokens.spacing.xl,
            alignItems: 'center',
        },
        container: {
            width: '100%',
            maxWidth: 1240,
        },
        heroCard: {
            flexDirection: 'row',
            alignItems: 'stretch',
            paddingVertical: tokens.spacing.md,
        },
        title: {
            color: tokens.colors.textPrimary,
            fontSize: 34,
            lineHeight: 40,
            fontWeight: '800',
        },
        subtitle: {
            color: tokens.colors.textSecondary,
            marginTop: tokens.spacing.sm,
            fontSize: 16,
            lineHeight: 24,
        },
        eyebrow: {
            color: '#7DB8FF',
            fontSize: 12,
            fontWeight: '700',
            letterSpacing: 1.4,
            marginBottom: tokens.spacing.sm,
            textTransform: 'uppercase',
        },
        heroCopy: {
            flex: 0.9,
            paddingRight: tokens.spacing.xl,
        },
        heroRangePanel: {
            flex: 1.1,
            backgroundColor: '#0B1018',
            borderColor: '#314155',
            borderRadius: 24,
            borderWidth: 1,
            marginLeft: tokens.spacing.lg,
            paddingHorizontal: tokens.spacing.xl,
            paddingVertical: tokens.spacing.lg,
        },
        rangeSummaryCard: {
            backgroundColor: '#090D14',
            borderColor: '#223044',
            borderRadius: 18,
            borderWidth: 1,
            marginBottom: tokens.spacing.md,
            paddingHorizontal: tokens.spacing.md,
            paddingVertical: tokens.spacing.sm,
        },
        rangeSummaryLabel: {
            color: '#7C8EA5',
            fontSize: 11,
            fontWeight: '700',
            letterSpacing: 1,
            marginBottom: 4,
            textTransform: 'uppercase',
        },
        rangeSummaryValue: {
            color: tokens.colors.textPrimary,
            fontSize: 16,
            fontWeight: '700',
            lineHeight: 22,
        },
        heroMetaRow: {
            flexDirection: 'row',
            marginTop: tokens.spacing.lg,
        },
        heroMetaPill: {
            backgroundColor: '#0A1320',
            borderColor: '#243347',
            borderRadius: 18,
            borderWidth: 1,
            minWidth: 170,
            paddingHorizontal: tokens.spacing.md,
            paddingVertical: tokens.spacing.sm,
            alignSelf: 'flex-start',
        },
        heroMetaLabel: {
            color: '#7C8EA5',
            fontSize: 11,
            fontWeight: '700',
            letterSpacing: 1,
            marginBottom: 4,
            textTransform: 'uppercase',
        },
        heroMetaValue: {
            color: tokens.colors.textPrimary,
            fontSize: 16,
            fontWeight: '700',
        },
        centerBlock: {
            minHeight: 130,
            justifyContent: 'center',
        },
        emptyWrap: {
            minHeight: 300,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: tokens.spacing.xl,
        },
        emptyTitle: {
            color: tokens.colors.textPrimary,
            fontSize: 24,
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: tokens.spacing.xs,
        },
        emptySubtitle: {
            color: tokens.colors.textSecondary,
            fontSize: 15,
            lineHeight: 22,
            textAlign: 'center',
            maxWidth: 420,
        },
        metricsRow: {
            flexDirection: 'row',
            marginTop: tokens.spacing.md,
            marginBottom: tokens.spacing.lg,
            alignItems: 'stretch',
        },
        secondaryInsightsRow: {
            flexDirection: 'row',
            marginTop: tokens.spacing.lg,
            marginBottom: tokens.spacing.lg,
            alignItems: 'stretch',
        },
        metricColumn: {
            flex: 1,
        },
        metricColumnSpaced: {
            flex: 1,
            marginLeft: tokens.spacing.md,
        },
        metricShell: {
            backgroundColor: '#0A0E14',
            borderColor: '#202B3A',
            borderRadius: 26,
            borderWidth: 1,
            padding: 8,
        },
        analyticsCard: {
            overflow: 'hidden',
            minHeight: 220,
        },
        chartCard: {
            overflow: 'hidden',
        },
        paymentMixList: {
            minHeight: 220,
            paddingHorizontal: tokens.spacing.sm,
            paddingVertical: tokens.spacing.sm,
        },
        paymentMixHeader: {
            color: tokens.colors.textPrimary,
            fontSize: 18,
            fontWeight: '700',
            marginBottom: tokens.spacing.xs,
        },
        paymentMixSubheader: {
            color: tokens.colors.textSecondary,
            fontSize: 14,
            lineHeight: 20,
            marginBottom: tokens.spacing.md,
        },
        paymentMixListRow: {
            marginBottom: tokens.spacing.md,
        },
        paymentMixListHeaderRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 8,
        },
        paymentMixListLabel: {
            color: tokens.colors.textPrimary,
            fontSize: 16,
            fontWeight: '700',
        },
        paymentMixListValues: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        paymentMixListAmount: {
            color: '#DDE7F3',
            fontSize: 15,
            fontWeight: '700',
            marginRight: 10,
        },
        paymentMixListPercent: {
            color: '#8AA1BD',
            fontSize: 13,
            fontWeight: '700',
            minWidth: 40,
            textAlign: 'right',
        },
        paymentMixBarTrack: {
            height: 10,
            backgroundColor: '#1A2029',
            borderRadius: 999,
            overflow: 'hidden',
        },
        paymentMixBarFill: {
            height: '100%',
            backgroundColor: '#4DA3FF',
            borderRadius: 999,
        },
        discountInsightsShell: {
            backgroundColor: '#120F19',
            borderColor: '#2D2740',
            borderRadius: 26,
            borderWidth: 1,
            minHeight: 220,
            paddingHorizontal: tokens.spacing.xl,
            paddingVertical: tokens.spacing.lg,
        },
        discountInsightsEyebrow: {
            color: '#BCA6FF',
            fontSize: 12,
            fontWeight: '700',
            letterSpacing: 1.2,
            marginBottom: tokens.spacing.md,
            textTransform: 'uppercase',
        },
        discountInsightsValue: {
            color: '#F7F2FF',
            fontSize: 34,
            fontWeight: '800',
            marginBottom: tokens.spacing.xs,
        },
        discountInsightsLabel: {
            color: '#B4AACF',
            fontSize: 15,
            lineHeight: 22,
        },
        discountInsightsDivider: {
            height: 1,
            backgroundColor: '#2D2740',
            marginVertical: tokens.spacing.lg,
        },
        discountInsightsMeta: {
            color: '#D9D0F4',
            fontSize: 16,
            fontWeight: '700',
        },
        insightsRow: {
            flexDirection: 'row',
        },
        insightsPrimary: {
            flex: 2,
        },
        insightsSecondary: {
            flex: 1,
            marginLeft: tokens.spacing.lg,
        },
    });

export default Dashboard;
