import React, { useEffect, useState } from 'react';
import { SalesSummary } from '@pos/shared/models';
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
import moment from 'moment';

import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LineChartComponent } from '../line-chart/line-chart';
import ListWidget from '../list-widget/list-widget';
import PieChart from '../pie-chart/pie-chart';
import Widget from '../widget/widget';

import { getSalesSummaryForRange } from '@pos/reporting/data-access';
import { sortDescListBy } from '@pos/shared/utils';
import { EACH } from '@pos/unit-of-measures/data-access';

/* eslint-disable-next-line */
export interface DashboardProps {}

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

export const loadDashboardSummary = async (range?: DateRange) => {
    const normalizedRange = normalizeDashboardRange(range);
    const summary = await getSalesSummaryForRange('PAID', normalizedRange);
    return sortDashboardSummary(summary);
};

const DASHBOARD_LOAD_TIMEOUT_MS = 5000;

export function Dashboard(_props: DashboardProps) {
    const tokens = useDesignTokens();
    const styles = useStyles(tokens);
    const [loading, setLoading] = useState<boolean>(true);
    const [dateRange, setDateRange] = useState<DateRange>({
        startDate: moment().startOf('day'),
        endDate: moment().endOf('day'),
    });
    const [salesSummary, setSalesSummary] = useState<SalesSummary>();

    const updateDateRange = (range: DateRange) => {
        setDateRange(range);
    };

    useEffect(() => {
        let cancelled = false;
        setLoading(true);

        (async () => {
            try {
                const timeoutSummary = new Promise<undefined>((resolve) => {
                    setTimeout(() => resolve(undefined), DASHBOARD_LOAD_TIMEOUT_MS);
                });
                const summary = await Promise.race([
                    loadDashboardSummary(dateRange),
                    timeoutSummary,
                ]);
                if (!cancelled) {
                    setSalesSummary(summary);
                }
            } catch {
                if (!cancelled) {
                    setSalesSummary(undefined);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [dateRange]);

    return (
        <UIScreen padded>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.container}>
                    <UIStack spacing="lg">
                        <UICard tone="muted" radius="lg">
                            <Text style={styles.title}>Dashboard</Text>
                            <Text style={styles.subtitle}>
                                Sales performance and trends across the selected period.
                            </Text>
                            <UIDateRange
                                initialRange={dateRange}
                                onRangeChange={updateDateRange}
                            />
                        </UICard>

                        {loading && (
                            <UICard style={styles.centerBlock}>
                                <UISpinner size="small" message="Loading..." />
                            </UICard>
                        )}

                        {!loading && !hasSalesData(salesSummary) && (
                            <UICard tone="muted" style={styles.centerBlock}>
                                <UIEmptyState text="No data found for this date range" />
                            </UICard>
                        )}

                        {!loading && hasSalesData(salesSummary) && (
                            <>
                                <View style={styles.metricsRow}>
                                    <View style={styles.metricColumn}>
                                        <Widget
                                            backgroundColor={tokens.colors.accent}
                                            icon="trending-up"
                                            text="Gross Income"
                                            value={`$ ${salesSummary.totalAmount.toFixed(
                                                2
                                            )}`}
                                        />
                                    </View>
                                    <View style={styles.metricColumnSpaced}>
                                        <Widget
                                            backgroundColor={tokens.colors.warning}
                                            icon="sigma"
                                            text="Total Sales"
                                            value={salesSummary.totalOrders.toString()}
                                        />
                                    </View>
                                    <View style={styles.metricColumnSpaced}>
                                        <Widget
                                            backgroundColor={tokens.colors.success}
                                            icon="account-multiple-plus-outline"
                                            text="New Customers"
                                            value="N/A"
                                        />
                                    </View>
                                </View>

                                <UICard>
                                    <View style={styles.insightsRow}>
                                        <View style={styles.insightsPrimary}>
                                            <PieChart
                                                header="Top 5 Products"
                                                items={buildTopProductItems(salesSummary)}
                                            />
                                        </View>
                                        <View style={styles.insightsSecondary}>
                                            <ListWidget
                                                header="Top 5 Employees"
                                                items={buildTopEmployeeItems(salesSummary)}
                                            />
                                        </View>
                                    </View>
                                </UICard>

                                <UICard>
                                    <LineChartComponent
                                        header="Revenue over time"
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
        title: {
            color: tokens.colors.textPrimary,
            fontSize: 28,
            fontWeight: '700',
        },
        subtitle: {
            color: tokens.colors.textSecondary,
            marginTop: tokens.spacing.xs,
            marginBottom: tokens.spacing.sm,
            fontSize: 15,
        },
        centerBlock: {
            minHeight: 130,
            justifyContent: 'center',
        },
        metricsRow: {
            flexDirection: 'row',
            marginTop: tokens.spacing.xs,
        },
        metricColumn: {
            flex: 1,
        },
        metricColumnSpaced: {
            flex: 1,
            marginLeft: tokens.spacing.md,
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
