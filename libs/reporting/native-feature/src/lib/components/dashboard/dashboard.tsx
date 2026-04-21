import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Order,
    OrderRefund,
    OrderRefundLine,
    OrderStatus,
    PaymentType,
    SalesSummary,
} from '@pos/shared/models';
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

import {
    Animated,
    InteractionManager,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { LineChartComponent } from '../line-chart/line-chart';
import ListWidget from '../list-widget/list-widget';
import PieChart from '../pie-chart/pie-chart';
import Widget from '../widget/widget';

import {
    getOrdersForStatuses,
    getRefundLinesForRefundIds,
    getRefundsForRange,
} from '@pos/reporting/data-access';
import { sortDescListBy } from '@pos/shared/utils';
import { EACH } from '@pos/unit-of-measures/data-access';
import i18next from 'i18next';
import { useSelector } from 'react-redux';
import { selectAllCategories } from '@pos/categories/data-access';
import { selectProductsEntities } from '@pos/products/data-access';

/* eslint-disable-next-line */
export interface DashboardProps {}

interface DashboardSupplemental {
    topCategories: { name: string; value: string }[];
    paymentMix: { name: string; value: number }[];
    paymentMixBreakdown: { name: string; value: string }[];
    paymentMixPercentages: { name: string; amount: string; percent: string; ratio: number }[];
    totalDiscounts: number;
    discountedOrders: number;
    estimatedGrossProfit: number;
    missingCostLineCount: number;
    missingCostProductCount: number;
    excludedSalesAmount: number;
    refundAmountTotal: number;
    refundedGrossProfitOffset: number;
}

export const areDashboardRangesEqual = (left: DateRange, right: DateRange) =>
    left.startDate.isSame(right.startDate) && left.endDate.isSame(right.endDate);

const getDashboardLineAmount = (line: NonNullable<Order['lines']>[number]) =>
    Number(line?.lineTotalBeforeTax ?? Number(line?.price || 0) * Number(line?.quantity || 0));
const roundMoney = (value: number) => Math.round(value * 100) / 100;

const allocateRefundAcrossOrderPayments = (
    order: Order | undefined,
    refundAmount: number
) => {
    const payments = (order?.paymentInfo?.payments || [])
        .map((payment) => ({
            type: String(payment?.type || '').toUpperCase(),
            amount: roundMoney(Math.max(0, Number(payment?.amount || 0))),
        }))
        .filter((payment) => payment.amount > 0);

    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    if (refundAmount <= 0 || totalPaid <= 0) {
        return [] as Array<{ type: string; amount: number }>;
    }

    let remaining = Math.min(roundMoney(refundAmount), roundMoney(totalPaid));

    return payments
        .map((payment, index) => {
            if (remaining <= 0) {
                return { ...payment, amount: 0 };
            }

            const allocated =
                index === payments.length - 1
                    ? remaining
                    : roundMoney((payment.amount / totalPaid) * refundAmount);
            const capped = Math.min(payment.amount, allocated, remaining);
            remaining = roundMoney(remaining - capped);
            return {
                type: payment.type,
                amount: capped,
            };
        })
        .filter((payment) => payment.amount > 0);
};

const buildRefundAmountByOrderId = (refunds: OrderRefund[] = []) =>
    refunds.reduce<Record<string, number>>((acc, refund) => {
        const orderId = String(refund?.orderId || '').trim();
        if (!orderId) {
            return acc;
        }

        acc[orderId] = (acc[orderId] || 0) + Number(refund.refundAmount || 0);
        return acc;
    }, {});

const buildRefundLineTotalsByOrderProduct = (refundLines: OrderRefundLine[] = []) =>
    refundLines.reduce<
        Record<string, { amount: number; quantity: number; categoryId?: string | null }>
    >((acc, line) => {
        const orderId = String(line?.orderId || '').trim();
        const productId = String(line?.productId || '').trim();
        if (!orderId || !productId) {
            return acc;
        }

        const key = `${orderId}:${productId}`;
        acc[key] = acc[key] || {
            amount: 0,
            quantity: 0,
            categoryId: line?.categoryId,
        };
        acc[key].amount += Number(line?.lineRefundAmount || 0);
        acc[key].quantity += Number(line?.quantityRefunded || 0);
        if (!acc[key].categoryId && line?.categoryId) {
            acc[key].categoryId = line.categoryId;
        }
        return acc;
    }, {});

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

export const getDashboardRefundTotal = (refunds: OrderRefund[] = []) =>
    refunds.reduce((sum, refund) => sum + Number(refund.refundAmount || 0), 0);

export const getDashboardNetGrossIncome = (
    summary?: SalesSummary,
    _refunds: OrderRefund[] = []
) => Number(summary?.totalAmount || 0);

export const getDashboardNetAverageTicket = (
    summary?: SalesSummary,
    _refunds: OrderRefund[] = []
) => {
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

    return Number(summary?.totalAmount || 0) / totalOrders;
};

export const buildDashboardSupplemental = (
    orders: Order[],
    categoriesById: Record<string, string>,
    productsById: Record<string, { cost?: number | null } | undefined>,
    refundLines: OrderRefundLine[] = [],
    refunds: OrderRefund[] = []
): DashboardSupplemental => {
    const categoryTotals: Record<string, number> = {};
    const ordersById = new Map<string, Order>();
    const paymentTotals: Record<string, number> = {
        [PaymentType.CASH]: 0,
        [PaymentType.CC]: 0,
        [PaymentType.CHECK]: 0,
        [PaymentType.EBT]: 0,
    };

    let totalDiscounts = 0;
    let discountedOrders = 0;
    let estimatedGrossProfit = 0;
    let missingCostLineCount = 0;
    let excludedSalesAmount = 0;
    const missingCostProductIds = new Set<string>();
    let refundedGrossProfitOffset = 0;
    const refundedCategoryTotals: Record<string, number> = {};

    orders.forEach((order) => {
        ordersById.set(String(order.id || ''), order);
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

            const productId = String(line?.productId || '').trim();
            if (!productId) {
                return;
            }

            const rawCost = productsById[productId]?.cost;
            const resolvedCost =
                rawCost === null || rawCost === undefined ? null : Number(rawCost);

            if (resolvedCost === null || Number.isNaN(resolvedCost)) {
                missingCostLineCount += 1;
                excludedSalesAmount += amount;
                missingCostProductIds.add(productId);
                return;
            }

            estimatedGrossProfit += amount - resolvedCost * Number(line?.quantity || 0);
        });
    });

    refunds.forEach((refund) => {
        const capturedRefundPayments = (refund.refundPayments || [])
            .map((payment) => ({
                type: String(payment?.type || '').toUpperCase(),
                amount: roundMoney(Math.max(0, Number(payment?.amount || 0))),
            }))
            .filter((payment) => payment.amount > 0);
        const paymentsToSubtract = capturedRefundPayments.length
            ? capturedRefundPayments
            : allocateRefundAcrossOrderPayments(
                  ordersById.get(String(refund.orderId || '')),
                  Number(refund.refundAmount || 0)
              );

        paymentsToSubtract.forEach((payment) => {
            if (!payment.type) return;
            paymentTotals[payment.type] = roundMoney(
                (paymentTotals[payment.type] || 0) - payment.amount
            );
        });
    });

    refundLines.forEach((line) => {
        const productId = String(line?.productId || '').trim();
        if (!productId) {
            return;
        }

        const categoryId = String(line?.categoryId || '').trim();
        if (categoryId) {
            refundedCategoryTotals[categoryId] =
                (refundedCategoryTotals[categoryId] || 0) +
                Number(line?.lineRefundAmount || 0);
        }

        const rawCost = productsById[productId]?.cost;
        const resolvedCost =
            rawCost === null || rawCost === undefined ? null : Number(rawCost);

        if (resolvedCost === null || Number.isNaN(resolvedCost)) {
            return;
        }

        const refundedQuantity = Number(line?.quantityRefunded || 0);
        const refundedAmount = Number(line?.lineRefundAmount || 0);
        refundedGrossProfitOffset +=
            refundedAmount - resolvedCost * refundedQuantity;
    });

    const topCategories = Object.entries(categoryTotals)
        .map(([categoryId, amount]) => [
            categoryId,
            Math.max(0, amount - Number(refundedCategoryTotals[categoryId] || 0)),
        ] as const)
        .filter(([, amount]) => amount > 0)
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
        estimatedGrossProfit,
        missingCostLineCount,
        missingCostProductCount: missingCostProductIds.size,
        excludedSalesAmount,
        refundAmountTotal: getDashboardRefundTotal(refunds),
        refundedGrossProfitOffset,
    };
};

export const buildRevenueOverTime = (summary?: SalesSummary) =>
    summary?.dates?.map((i) => ({
        label: i?.datePart.substring(5),
        values: [i?.amount],
    }));

export const buildDashboardSummaryFromOrders = (
    orders: Order[] = [],
    refunds: OrderRefund[] = [],
    refundLines: OrderRefundLine[] = []
): SalesSummary => {
    const byEmployee: Record<
        string,
        { employeeId: string; employeeName: string; orders: number; amount: number }
    > = {};
    const byProduct: Record<
        string,
        {
            productId: string;
            productName: string;
            unitOfMeasure: string;
            quantity: number;
            amount: number;
        }
    > = {};
    const byDate: Record<string, { datePart: string; orders: number; amount: number }> =
        {};
    const refundAmountByOrderId = buildRefundAmountByOrderId(refunds);
    const refundLineTotalsByOrderProduct = buildRefundLineTotalsByOrderProduct(refundLines);

    orders.forEach((order) => {
        const employeeId = order.createdBy?.id || order.employeeId || 'unknown';
        const employeeName = order.createdBy?.name || order.employeeName || 'Unknown';
        const orderId = String(order.id || '').trim();
        const total = Math.max(
            0,
            Number(order.total || 0) - Number(refundAmountByOrderId[orderId] || 0)
        );
        const datePart = String(order.orderDate || '').substring(0, 10);

        if (datePart) {
            byDate[datePart] = byDate[datePart] || {
                datePart,
                orders: 0,
                amount: 0,
            };
            byDate[datePart].orders += 1;
            byDate[datePart].amount += total;
        }

        byEmployee[employeeId] = byEmployee[employeeId] || {
            employeeId,
            employeeName,
            orders: 0,
            amount: 0,
        };
        byEmployee[employeeId].orders += 1;
        byEmployee[employeeId].amount += total;

        (order.lines || []).forEach((line) => {
            if (!line?.productId) return;
            const refundEntry =
                refundLineTotalsByOrderProduct[`${orderId}:${line.productId}`] || null;
            const lineAmount = Math.max(
                0,
                getDashboardLineAmount(line) - Number(refundEntry?.amount || 0)
            );
            const lineQuantity = Math.max(
                0,
                Number(line.quantity || 0) - Number(refundEntry?.quantity || 0)
            );
            if (lineAmount <= 0 && lineQuantity <= 0) {
                return;
            }

            byProduct[line.productId] = byProduct[line.productId] || {
                productId: line.productId,
                productName: line.productName || 'Unknown',
                unitOfMeasure: line.unitOfMeasure || '',
                quantity: 0,
                amount: 0,
            };
            byProduct[line.productId].quantity += lineQuantity;
            byProduct[line.productId].amount += lineAmount;
        });
    });

    return {
        employees: Object.values(byEmployee) as unknown as SalesSummary['employees'],
        products: Object.values(byProduct) as unknown as SalesSummary['products'],
        dates: Object.values(byDate)
            .sort((a, b) =>
                a.datePart > b.datePart ? 1 : a.datePart < b.datePart ? -1 : 0
            ) as unknown as SalesSummary['dates'],
        totalAmount: Object.values(byEmployee).reduce(
            (sum, employee) => sum + employee.amount,
            0
        ),
        totalOrders: Object.values(byEmployee).reduce(
            (sum, employee) => sum + employee.orders,
            0
        ),
    };
};

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
    const [orders, refunds] = await Promise.all([
        getOrdersForStatuses({
            statuses: [OrderStatus.PAID, OrderStatus.PARTIALLY_REFUNDED],
            range: normalizedRange,
        }),
        getRefundsForRange({ range: normalizedRange }),
    ]);
    const refundLines = await getRefundLinesForRefundIds(
        refunds.map((refund) => refund.id).filter(Boolean)
    );
    return sortDashboardSummary(buildDashboardSummaryFromOrders(orders, refunds, refundLines));
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
    const [orders, setOrders] = useState<Order[]>([]);
    const [refunds, setRefunds] = useState<OrderRefund[]>([]);
    const [refundLines, setRefundLines] = useState<OrderRefundLine[]>([]);
    const [refreshNonce, setRefreshNonce] = useState(0);
    const [emptyOpacity] = useState(() => new Animated.Value(0));
    const [emptyTranslateY] = useState(() => new Animated.Value(12));
    const categories = useSelector(selectAllCategories);
    const productsById =
        useSelector(selectProductsEntities) as Record<
            string,
            { cost?: number | null } | undefined
        >;
    const t = (key: string, fallback: string) =>
        i18next.isInitialized && i18next.exists(key)
            ? String(i18next.t(key))
            : fallback;
    const tMissingCostNote = (count: number) =>
        i18next.isInitialized && i18next.exists('DASHBOARD_MissingCostNote')
            ? String(i18next.t('DASHBOARD_MissingCostNote', { count }))
            : `Estimated profit excludes ${count} sold lines with missing cost.`;
    const formattedRange = formatDashboardDateRange(dateRange);
    const categoriesById = useMemo(
        () =>
            Object.fromEntries(
                (categories || []).map((category) => [category.id, category.name || 'Unknown'])
            ),
        [categories]
    );
    const supplemental = useMemo(
        () =>
            buildDashboardSupplemental(
                orders,
                categoriesById,
                productsById || {},
                refundLines,
                refunds
            ),
        [categoriesById, orders, productsById, refundLines, refunds]
    );
    const netGrossIncome = useMemo(
        () => getDashboardNetGrossIncome(salesSummary, refunds),
        [salesSummary, refunds]
    );
    const netAverageTicket = useMemo(
        () => getDashboardNetAverageTicket(salesSummary, refunds),
        [salesSummary, refunds]
    );
    const netEstimatedGrossProfit = useMemo(
        () =>
            Number(supplemental?.estimatedGrossProfit || 0) -
            Number(supplemental?.refundedGrossProfitOffset || 0),
        [supplemental]
    );

    const updateDateRange = (range: DateRange) => {
        const normalizedRange = normalizeDashboardRange(range);
        setDateRange((currentRange) =>
            areDashboardRangesEqual(currentRange, normalizedRange)
                ? currentRange
                : normalizedRange
        );
    };

    const refreshDashboard = useCallback(() => {
        if (loading) {
            return;
        }

        setRefreshNonce((current) => current + 1);
    }, [loading]);

    useEffect(() => {
        let cancelled = false;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setOrders([]);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setRefunds([]);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setRefundLines([]);

        const interactionHandle = InteractionManager.runAfterInteractions(() => {
            (async () => {
                try {
                    const normalizedRange = normalizeDashboardRange(dateRange);
                    const [salesOrders, refundsForRange] = await Promise.all([
                        getOrdersForStatuses({
                            statuses: [
                                OrderStatus.PAID,
                                OrderStatus.PARTIALLY_REFUNDED,
                            ],
                            range: normalizedRange,
                        }),
                        getRefundsForRange({ range: normalizedRange }),
                    ]);
                    const refundLinesForRange = await getRefundLinesForRefundIds(
                        refundsForRange.map((refund) => refund.id).filter(Boolean)
                    );
                    const summary = sortDashboardSummary(
                        buildDashboardSummaryFromOrders(
                            salesOrders || [],
                            refundsForRange || [],
                            refundLinesForRange || []
                        )
                    );

                    if (cancelled) {
                        return;
                    }

                    setSalesSummary(summary);
                    setOrders(salesOrders || []);
                    setRefunds(refundsForRange || []);
                    setRefundLines(refundLinesForRange || []);
                    setLoading(false);
                } catch {
                    if (!cancelled) {
                        setSalesSummary(undefined);
                        setOrders([]);
                        setRefunds([]);
                        setRefundLines([]);
                        setLoading(false);
                    }
                }
            })();
        });

        return () => {
            cancelled = true;
            interactionHandle?.cancel?.();
        };
    }, [dateRange, refreshNonce]);

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
                                    <Pressable
                                        accessibilityRole="button"
                                        disabled={loading}
                                        onPress={refreshDashboard}
                                        style={({ pressed }) => [
                                            styles.heroMetaPill,
                                            styles.refreshButton,
                                            pressed && !loading
                                                ? styles.refreshButtonPressed
                                                : null,
                                            loading
                                                ? styles.refreshButtonDisabled
                                                : null,
                                        ]}
                                        testID="dashboard-refresh-button"
                                    >
                                        <Text style={styles.heroMetaLabel}>
                                            {t('DASHBOARD_Refresh', 'Refresh')}
                                        </Text>
                                        <Text style={styles.heroMetaValue}>
                                            {loading
                                                ? t(
                                                      'DASHBOARD_Refreshing',
                                                      'Refreshing...'
                                                  )
                                                : t(
                                                      'DASHBOARD_RefreshData',
                                                      'Reload data'
                                                  )}
                                        </Text>
                                    </Pressable>
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
                                                value={`$ ${netGrossIncome.toFixed(2)}`}
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
                                                value={`$ ${netAverageTicket.toFixed(2)}`}
                                                primaryTextColor="#E9FFF3"
                                                primaryTextSize={24}
                                            />
                                        </View>
                                    </View>
                                    <View style={styles.metricColumnSpaced}>
                                        <View style={styles.metricShell}>
                                            <Widget
                                                backgroundColor="#22132A"
                                                icon="cash-multiple"
                                                text={t(
                                                    'DASHBOARD_EstGrossProfit',
                                                    'Est. Gross Profit'
                                                )}
                                                value={`$ ${netEstimatedGrossProfit.toFixed(2)}`}
                                                primaryTextColor="#F5E9FF"
                                                primaryTextSize={24}
                                            />
                                        </View>
                                    </View>
                                </View>
                                {!!supplemental?.missingCostLineCount && (
                                    <Text style={styles.metricsHelperText}>
                                        {tMissingCostNote(
                                            supplemental.missingCostLineCount
                                        )}
                                    </Text>
                                )}

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
        refreshButton: {
            minWidth: 190,
        },
        refreshButtonPressed: {
            backgroundColor: '#102036',
            borderColor: '#35506F',
        },
        refreshButtonDisabled: {
            opacity: 0.72,
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
        metricsHelperText: {
            color: '#7B8A97',
            fontSize: 13,
            lineHeight: 18,
            marginTop: -4,
            marginBottom: tokens.spacing.sm,
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
