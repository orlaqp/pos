import { useSharedStyles } from '@pos/theme/native';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import React, { useEffect, useRef, useState } from 'react';
import DropDownPicker, { ItemType } from 'react-native-dropdown-picker';

import {
    Animated,
    InteractionManager,
    View,
    Text,
    FlatList,
    StyleSheet,
} from 'react-native';
import { useSelector } from 'react-redux';
import { selectAllEmployees } from '@pos/employees/data-access';
import { selectAllProducts } from '@pos/products/data-access';
import {
    buildEndOfDayReferenceSummary,
    buildOrderPaymentDetailRows,
    filterOrders,
    getEmployeeItems,
    getProductItems,
    PaymentMethodsSummary,
} from './end-of-day.service';
import { Button } from '@rneui/themed';
import {
    getRefundLinesForRefundIds,
    getRefundsForRange,
    getSalesForRange,
} from '@pos/reporting/data-access';
import moment from 'moment';
import {
    Order,
    OrderRefund,
    OrderRefundLine,
    OrderStatus,
} from '@pos/shared/models';
import { UIDatePickerModal, UISpinner } from '@pos/shared/ui-native';
import OrderDetails from './order-details';
import Widget from '../widget/widget';
import i18next from 'i18next';

/* eslint-disable-next-line */
export interface EndOfDayProps {}

export interface EndOfDayWidget {
    text: string;
    value: string;
    backgroundColor: string;
    flex?: number;
}

export interface EndOfDayLoadedData {
    orders: Order[];
    refunds: OrderRefund[];
    refundLines: OrderRefundLine[];
}

export interface EndOfDayFilterConfig {
    label: string;
    open: boolean;
    value: any;
    items: ItemType<string>[];
    setOpen: (value: any) => void;
    setValue: (value: any) => void;
    setItems: (items: any) => void;
    searchable?: boolean;
    leftPadding?: boolean;
}

export const buildDayRange = (date: Date) => ({
    startDate: moment(date).startOf('day'),
    endDate: moment(date).endOf('day'),
});

export const getPaymentMethodsTotal = (summary: PaymentMethodsSummary) =>
    summary.CASH + summary.CC + summary.CHECK + summary.EBT;

export const formatPaymentAmount = (amount: number) =>
    `$${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

export const buildRefundedLineAmountsForOrder = (
    orderId: string,
    refundLines: OrderRefundLine[],
) =>
    refundLines.reduce<Record<string, number>>((acc, refundLine) => {
        if (refundLine.orderId !== orderId) {
            return acc;
        }

        const identifier = String(refundLine.orderLineIdentifier || '').trim();
        if (!identifier) {
            return acc;
        }

        acc[identifier] =
            Number(acc[identifier] || 0) +
            Number(refundLine.lineRefundAmount || 0);
        return acc;
    }, {});

export const loadPaidSalesForRange = async (
    dateRange: { startDate: any; endDate: any },
    fetchSales: typeof getSalesForRange = getSalesForRange,
) => {
    const items = await fetchSales(
        [OrderStatus.PAID, OrderStatus.PARTIALLY_REFUNDED],
        dateRange as any,
    );
    return items || [];
};

export const loadEndOfDayDataForRange = async (
    dateRange: { startDate: any; endDate: any },
    fetchSales: typeof getSalesForRange = getSalesForRange,
    fetchRefunds: typeof getRefundsForRange = getRefundsForRange,
    fetchRefundLines: typeof getRefundLinesForRefundIds = getRefundLinesForRefundIds,
): Promise<EndOfDayLoadedData> => {
    const [orders, refunds] = await Promise.all([
        loadPaidSalesForRange(dateRange, fetchSales),
        fetchRefunds({ range: dateRange as any }),
    ]);
    const refundLines = await fetchRefundLines(
        (refunds || []).map((refund) => refund.id).filter(Boolean),
    );

    return {
        orders: orders || [],
        refunds: refunds || [],
        refundLines: refundLines || [],
    };
};

export const buildEndOfDayWidgets = (
    ordersCount: number,
    grossSales: number,
    discounts: number,
    refunds: number,
    netSales: number,
    summary: PaymentMethodsSummary,
    defaultBackgroundColor: string,
    labels: {
        sales: string;
        grossSales: string;
        discounts: string;
        refunds: string;
        netSales: string;
        creditCard: string;
        cash: string;
        checks: string;
        ebt: string;
    } = {
        sales: 'Sales',
        grossSales: 'Gross Sales',
        discounts: 'Discounts',
        refunds: 'Refunds',
        netSales: 'Collected Sales',
        creditCard: 'Credit Card',
        cash: 'Cash',
        checks: 'Checks',
        ebt: 'EBT',
    },
): EndOfDayWidget[] => [
    {
        text: labels.sales,
        value: `${ordersCount}`,
        backgroundColor: defaultBackgroundColor,
        flex: 0.7,
    },
    {
        text: labels.grossSales,
        value: formatPaymentAmount(grossSales),
        backgroundColor: defaultBackgroundColor,
        flex: 1,
    },
    {
        text: labels.discounts,
        value: formatPaymentAmount(discounts),
        backgroundColor: '#5d4037',
        flex: 1,
    },
    {
        text: labels.refunds,
        value: formatPaymentAmount(refunds),
        backgroundColor: '#8e24aa',
        flex: 1,
    },
    {
        text: labels.netSales,
        value: formatPaymentAmount(netSales),
        backgroundColor: defaultBackgroundColor,
        flex: 1,
    },
    {
        text: labels.creditCard,
        value: formatPaymentAmount(summary.CC),
        backgroundColor: '#1976d2',
        flex: 1,
    },
    {
        text: labels.cash,
        value: formatPaymentAmount(summary.CASH),
        backgroundColor: '#e91e63',
        flex: 1,
    },
    {
        text: labels.checks,
        value: formatPaymentAmount(summary.CHECK),
        backgroundColor: '#43a047',
        flex: 1,
    },
    {
        text: labels.ebt,
        value: formatPaymentAmount(summary.EBT),
        backgroundColor: '#8e24aa',
        flex: 1,
    },
];

const chunkWidgets = (widgets: EndOfDayWidget[], size = 5) => {
    const rows: EndOfDayWidget[][] = [];
    for (let index = 0; index < widgets.length; index += size) {
        rows.push(widgets.slice(index, index + size));
    }
    return rows;
};

export const buildEndOfDayFilterConfigs = (params: {
    employeesOpen: boolean;
    employeeValue: any;
    employeeItems: ItemType<string>[];
    setEmployeesOpen: (value: boolean) => void;
    setEmployeeValue: (value: any) => void;
    setEmployeeItems: (items: any) => void;
    closedByOpen: boolean;
    closedByValue: any;
    setClosedByOpen: (value: boolean) => void;
    setClosedByValue: (value: any) => void;
    productsOpen: boolean;
    productValue: string | null;
    productItems: ItemType<string>[];
    setProductsOpen: (value: boolean) => void;
    setProductValue: (value: string | null) => void;
    setProductItems: (items: any) => void;
    labels?: {
        openedBy: string;
        closedBy: string;
        products: string;
    };
}): EndOfDayFilterConfig[] => [
    {
        label: params.labels?.openedBy || 'Opened by',
        open: params.employeesOpen,
        value: params.employeeValue,
        items: params.employeeItems,
        setOpen: params.setEmployeesOpen,
        setValue: params.setEmployeeValue,
        setItems: params.setEmployeeItems,
    },
    {
        label: params.labels?.closedBy || 'Closed by',
        open: params.closedByOpen,
        value: params.closedByValue,
        items: params.employeeItems,
        setOpen: params.setClosedByOpen,
        setValue: params.setClosedByValue,
        setItems: params.setEmployeeItems,
        leftPadding: true,
    },
    {
        label: params.labels?.products || 'Product(s)',
        open: params.productsOpen,
        value: params.productValue,
        items: params.productItems,
        setOpen: params.setProductsOpen,
        setValue: params.setProductValue,
        setItems: params.setProductItems,
        searchable: true,
        leftPadding: true,
    },
];

export const createDateUpdater =
    (
        setDate: (date: Date) => void,
        setLoading: (value: boolean) => void,
        setOrders: (orders: Order[]) => void,
        setFilteredOrders: (orders: Order[]) => void,
        setRefunds?: (refunds: OrderRefund[]) => void,
        setRefundLines?: (lines: OrderRefundLine[]) => void,
        loadForRange: (dateRange: {
            startDate: any;
            endDate: any;
        }) => Promise<EndOfDayLoadedData> = loadEndOfDayDataForRange,
    ) =>
    (date: Date) => {
        setDate(date);
        const dateRange = buildDayRange(date);
        setLoading(true);
        InteractionManager.runAfterInteractions(() => {
            loadForRange(dateRange).then((data) => {
                setOrders(data.orders);
                setFilteredOrders(data.orders);
                setRefunds?.(data.refunds);
                setRefundLines?.(data.refundLines);
                setLoading(false);
            });
        });
    };

export function EndOfDay(props: EndOfDayProps) {
    const styles = useSharedStyles();
    const tokens = useDesignTokens();
    const local = useEndOfDayStyles(tokens);
    const t = (key: string, fallback: string) =>
        i18next.isInitialized && i18next.exists(key)
            ? String(i18next.t(key))
            : fallback;

    const [date, setDate] = useState(new Date());
    const [drOpen, setDrOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [refunds, setRefunds] = useState<OrderRefund[]>([]);
    const [refundLines, setRefundLines] = useState<OrderRefundLine[]>([]);
    const [paymentMethodsSummary, setPaymentMethodsSummary] =
        useState<PaymentMethodsSummary>({
            CC: 0,
            CASH: 0,
            CHECK: 0,
            EBT: 0,
        });
    const [referenceSummary, setReferenceSummary] = useState(() =>
        buildEndOfDayReferenceSummary([], [], [], {}),
    );

    const [employeesOpen, setEmployeesOpen] = useState(false);
    const [employeeValue, setEmployeeValue] = useState(null);
    const employees = useSelector(selectAllEmployees);
    const [employeeItems, setEmployeeItems] = useState<ItemType<string>[]>(
        getEmployeeItems(employees),
    );

    const [productsOpen, setProductsOpen] = useState(false);
    const [productValue, setProductValue] = useState<string | null>(null);
    const products = useSelector(selectAllProducts);
    const [productItems, setProductItems] = useState<ItemType<string>[]>(
        getProductItems(products),
    );

    const [closedByOpen, setClosedByOpen] = useState(false);
    const [closedByValue, setClosedByValue] = useState(null);
    const [filtersCollapsed, setFiltersCollapsed] = useState(false);
    const [summaryCollapsed, setSummaryCollapsed] = useState(false);
    const emptyOpacity = useRef(new Animated.Value(0)).current;
    const emptyTranslateY = useRef(new Animated.Value(12)).current;
    const filterConfigs = buildEndOfDayFilterConfigs({
        employeesOpen,
        employeeValue,
        employeeItems,
        setEmployeesOpen,
        setEmployeeValue,
        setEmployeeItems,
        closedByOpen,
        closedByValue,
        setClosedByOpen,
        setClosedByValue,
        productsOpen,
        productValue,
        productItems,
        setProductsOpen,
        setProductValue,
        setProductItems,
        labels: {
            openedBy: t('EOD_OpenedBy', 'Opened by'),
            closedBy: t('EOD_ClosedBy', 'Closed by'),
            products: t('EOD_Products', 'Product(s)'),
        },
    });
    const widgets = buildEndOfDayWidgets(
        filteredOrders.length,
        referenceSummary.grossSales,
        referenceSummary.discounts,
        referenceSummary.refunds,
        referenceSummary.netSales,
        paymentMethodsSummary,
        styles.dataRow.backgroundColor,
        {
            sales: t('EOD_Sales', 'Sales'),
            grossSales: t('EOD_GrossSales', 'Gross Sales'),
            discounts: t('EOD_Discounts', 'Discounts'),
            refunds: t('EOD_Refunds', 'Refunds'),
            netSales: t('EOD_NetSales', 'Collected Sales'),
            creditCard: t('EOD_CreditCard', 'Credit Card'),
            cash: t('EOD_Cash', 'Cash'),
            checks: t('EOD_Checks', 'Checks'),
            ebt: t('EOD_EBT', 'EBT'),
        },
    );
    const hasFilteredData = filteredOrders.length > 0;
    const updateDate = createDateUpdater(
        setDate,
        setLoading,
        setOrders,
        setFilteredOrders,
        setRefunds,
        setRefundLines,
    );

    useEffect(() => {
        const filterResponse = filterOrders(
            orders,
            {
                openedBy: employeeValue,
                closedBy: closedByValue,
                productId: productValue,
            },
            refunds,
            refundLines,
        );
        setFilteredOrders(filterResponse.orders);
        setPaymentMethodsSummary(filterResponse.summary);
        setReferenceSummary(filterResponse.references);
    }, [
        orders,
        refunds,
        refundLines,
        employeeValue,
        closedByValue,
        productValue,
    ]);

    useEffect(() => {
        setEmployeeItems(getEmployeeItems(employees));
    }, [employees]);

    useEffect(() => {
        setProductItems(getProductItems(products));
    }, [products]);

    useEffect(() => {
        let cancelled = false;
        const dateRange = buildDayRange(date);
        setLoading(true);

        const task = InteractionManager.runAfterInteractions(() => {
            loadEndOfDayDataForRange(dateRange).then((data) => {
                if (cancelled) return;
                setOrders(data.orders);
                setFilteredOrders(data.orders);
                setRefunds(data.refunds);
                setRefundLines(data.refundLines);
                setLoading(false);
            });
        });

        return () => {
            cancelled = true;
            task.cancel?.();
        };
    }, []);

    useEffect(() => {
        if (loading || hasFilteredData) return;

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
    }, [emptyOpacity, emptyTranslateY, hasFilteredData, loading]);

    return (
        <View style={styles.page} testID="end-of-day-screen">
            <View
                style={[styles.box, local.reportShell]}
                testID="end-of-day-shell"
            >
                <View style={local.reportToolbar} testID="end-of-day-toolbar">
                    <Text style={local.reportToolbarTitle}>
                        {t('SIDEBAR_EndOfDay', 'End of Day')}
                    </Text>
                    <View style={local.reportToolbarActions}>
                        <Button
                            testID="end-of-day-toggle-filters-button"
                            type="outline"
                            title={
                                filtersCollapsed
                                    ? t('EOD_ShowFilters', 'Show Filters')
                                    : t('EOD_HideFilters', 'Hide Filters')
                            }
                            onPress={() =>
                                setFiltersCollapsed((value) => !value)
                            }
                            buttonStyle={local.toolbarButton}
                            titleStyle={local.toolbarButtonText}
                        />
                        <Button
                            testID="end-of-day-toggle-summary-button"
                            type="outline"
                            title={
                                summaryCollapsed
                                    ? t('EOD_ShowSummary', 'Show Summary')
                                    : t('EOD_HideSummary', 'Hide Summary')
                            }
                            onPress={() =>
                                setSummaryCollapsed((value) => !value)
                            }
                            buttonStyle={local.toolbarButton}
                            titleStyle={local.toolbarButtonText}
                        />
                    </View>
                </View>

                {!filtersCollapsed && (
                    <View
                        style={local.filterBar}
                        testID="end-of-day-filter-bar"
                    >
                        <View
                            style={[local.filterField, local.dateFilterField]}
                        >
                            <Text style={local.filterLabel}>
                                {t('EOD_Date', 'Date')}
                            </Text>
                            <Button
                                testID="end-of-day-date-button"
                                title={date.toLocaleDateString()}
                                titleProps={{
                                    numberOfLines: 1,
                                    ellipsizeMode: 'clip',
                                }}
                                onPress={() => setDrOpen(true)}
                                buttonStyle={local.dateButton}
                                titleStyle={local.dateButtonText}
                            />
                            <UIDatePickerModal
                                mode="date"
                                open={drOpen}
                                date={date}
                                title={t('EOD_Date', 'Date')}
                                onConfirm={(date) => {
                                    setDrOpen(false);
                                    updateDate(date);
                                }}
                                onCancel={() => {
                                    setDrOpen(false);
                                }}
                            />
                        </View>
                        {filterConfigs.map((config) => (
                            <View key={config.label} style={local.filterField}>
                                <Text style={local.filterLabel}>
                                    {config.label}
                                </Text>
                                <DropDownPicker
                                    testID={`end-of-day-filter-${config.label
                                        .toLowerCase()
                                        .replace(/[^a-z0-9]+/g, '-')}`}
                                    style={local.dropdown}
                                    dropDownContainerStyle={local.dropdownMenu}
                                    textStyle={local.dropdownText}
                                    placeholderStyle={local.dropdownPlaceholder}
                                    labelStyle={local.dropdownText}
                                    listItemLabelStyle={local.dropdownText}
                                    selectedItemLabelStyle={
                                        local.dropdownSelectedText
                                    }
                                    searchTextInputStyle={
                                        local.dropdownSearchInput
                                    }
                                    searchPlaceholderTextColor={
                                        tokens.colors.textMuted
                                    }
                                    searchable={config.searchable}
                                    open={config.open}
                                    value={config.value}
                                    items={config.items}
                                    setOpen={config.setOpen}
                                    setValue={config.setValue}
                                    setItems={config.setItems}
                                    theme="DARK"
                                />
                            </View>
                        ))}
                    </View>
                )}

                {loading && (
                    <View style={[styles.centered, { paddingTop: 50 }]}>
                        <UISpinner
                            size="small"
                            message={t('COMMON_Loading', 'Loading...')}
                        />
                    </View>
                )}

                {!loading && !hasFilteredData && (
                    <Animated.View
                        style={[
                            local.emptyWrap,
                            {
                                opacity: emptyOpacity,
                                transform: [{ translateY: emptyTranslateY }],
                            },
                        ]}
                    >
                        <Text style={local.emptyTitle}>
                            {t(
                                'EOD_NoDataForRange',
                                'No data found for this date range',
                            )}
                        </Text>
                        <Text style={local.emptySubtitle}>
                            {t(
                                'EOD_NoDataForRangeHelp',
                                'Completed sales matching the selected filters will appear here.',
                            )}
                        </Text>
                    </Animated.View>
                )}

                {!loading && hasFilteredData && (
                    <>
                        {!summaryCollapsed && (
                            <View
                                style={local.widgetSection}
                                testID="end-of-day-summary-section"
                            >
                                <View style={{ flex: 1 }}>
                                    {chunkWidgets(widgets).map((row, index) => (
                                        <View
                                            key={`row-${index}`}
                                            style={local.widgetRow}
                                        >
                                            {row.map((widget) => (
                                                <View
                                                    key={widget.text}
                                                    style={{
                                                        flex: widget.flex || 1,
                                                    }}
                                                >
                                                    <Widget
                                                        height={68}
                                                        backgroundColor={
                                                            widget.backgroundColor
                                                        }
                                                        text={widget.text}
                                                        value={widget.value}
                                                        primaryTextSize={14}
                                                        secondaryTextSize={11}
                                                    />
                                                </View>
                                            ))}
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        <FlatList
                            testID="end-of-day-orders-list"
                            style={local.ordersList}
                            data={filteredOrders}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <OrderDetails
                                    order={item}
                                    productId={productValue}
                                    paymentDetails={buildOrderPaymentDetailRows(
                                        item,
                                        refunds.filter(
                                            (refund) =>
                                                refund.orderId === item.id,
                                        ),
                                        refundLines,
                                    )}
                                    refundedAmount={refunds
                                        .filter(
                                            (refund) =>
                                                refund.orderId === item.id,
                                        )
                                        .reduce(
                                            (sum, refund) =>
                                                sum +
                                                Number(
                                                    refund.refundAmount || 0,
                                                ),
                                            0,
                                        )}
                                    refundedLineAmounts={buildRefundedLineAmountsForOrder(
                                        item.id,
                                        refundLines,
                                    )}
                                />
                            )}
                        />
                    </>
                )}
            </View>
        </View>
    );
}

const localStyles = StyleSheet.create({
    emptyWrap: {
        flex: 1,
        minHeight: 320,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    emptyTitle: {
        color: '#f3f7ff',
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 8,
    },
    emptySubtitle: {
        color: '#a3adba',
        fontSize: 15,
        lineHeight: 22,
        textAlign: 'center',
        maxWidth: 440,
    },
});

const useEndOfDayStyles = (tokens: ReturnType<typeof useDesignTokens>) =>
    StyleSheet.create({
        ...localStyles,
        reportShell: {
            height: '100%',
            borderColor: '#C7D0DB22',
            borderRadius: 26,
            backgroundColor: '#05070B',
            paddingHorizontal: tokens.spacing.lg,
            paddingTop: tokens.spacing.lg,
            paddingBottom: tokens.spacing.lg,
        },
        reportToolbar: {
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: tokens.spacing.sm,
            minHeight: 44,
        },
        reportToolbarTitle: {
            color: tokens.colors.textPrimary,
            fontSize: 18,
            fontWeight: '800',
        },
        reportToolbarActions: {
            alignItems: 'center',
            flexDirection: 'row',
            gap: tokens.spacing.sm,
        },
        toolbarButton: {
            borderColor: `${tokens.colors.accent}66`,
            borderRadius: 18,
            minHeight: 36,
            paddingHorizontal: tokens.spacing.md,
        },
        toolbarButtonText: {
            color: tokens.colors.accent,
            fontSize: 12,
            fontWeight: '800',
        },
        filterBar: {
            zIndex: 1000,
            flexDirection: 'row',
            alignItems: 'flex-end',
            gap: tokens.spacing.sm,
            marginBottom: tokens.spacing.sm,
            padding: tokens.spacing.sm,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: '#243145',
            backgroundColor: '#090D14',
        },
        filterField: {
            flex: 1,
            flexDirection: 'column',
        },
        dateFilterField: {
            flex: 0.68,
        },
        filterLabel: {
            color: '#7C8EA5',
            fontSize: 11,
            fontWeight: '800',
            letterSpacing: 1.1,
            marginBottom: tokens.spacing.xs,
            textTransform: 'uppercase',
        },
        dateButton: {
            minHeight: 42,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: `${tokens.colors.accent}66`,
            backgroundColor: `${tokens.colors.accent}33`,
            paddingHorizontal: tokens.spacing.sm,
        },
        dateButtonText: {
            color: tokens.colors.textPrimary,
            fontSize: 14,
            fontWeight: '800',
            letterSpacing: 0.2,
        },
        dropdown: {
            minHeight: 42,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: `${tokens.colors.border}ee`,
            backgroundColor: '#101722',
            paddingHorizontal: tokens.spacing.md,
        },
        dropdownMenu: {
            borderRadius: 16,
            borderWidth: 1,
            borderColor: '#2A3A51',
            backgroundColor: '#101722',
            overflow: 'hidden',
        },
        dropdownText: {
            color: tokens.colors.textPrimary,
            fontSize: 14,
            fontWeight: '600',
        },
        dropdownPlaceholder: {
            color: tokens.colors.textMuted,
            fontSize: 14,
            fontWeight: '600',
        },
        dropdownSelectedText: {
            color: '#D7E8FF',
            fontSize: 14,
            fontWeight: '800',
        },
        dropdownSearchInput: {
            minHeight: 40,
            borderRadius: 12,
            borderColor: '#2A3A51',
            backgroundColor: '#0B1018',
            color: tokens.colors.textPrimary,
            fontSize: 15,
        },
        widgetSection: {
            flexDirection: 'row',
            marginBottom: tokens.spacing.xs,
        },
        widgetRow: {
            flexDirection: 'row',
        },
        ordersList: {
            flex: 1,
            marginTop: tokens.spacing.xs,
        },
    });

export default EndOfDay;
