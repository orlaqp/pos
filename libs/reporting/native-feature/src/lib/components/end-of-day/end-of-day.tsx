import { useSharedStyles } from '@pos/theme/native';
import React, { useEffect, useRef, useState } from 'react';
import DropDownPicker, { ItemType } from 'react-native-dropdown-picker';


import { Animated, View, Text, FlatList, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { selectAllEmployees } from '@pos/employees/data-access';
import { selectAllProducts } from '@pos/products/data-access';
import { filterOrders, getEmployeeItems, getProductItems, PaymentMethodsSummary } from './end-of-day.service';
import { Button } from '@rneui/themed';
import { getSalesForRange } from '@pos/reporting/data-access';
import moment from 'moment';
import { Order } from '@pos/shared/models';
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
    summary.CASH + summary.CC + summary.CHECK;

export const formatPaymentAmount = (amount: number) =>
    `$${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

export const loadPaidSalesForRange = async (
    dateRange: { startDate: any; endDate: any },
    fetchSales: typeof getSalesForRange = getSalesForRange
) => {
    const items = await fetchSales('PAID', dateRange as any);
    return items || [];
};

export const buildEndOfDayWidgets = (
    ordersCount: number,
    summary: PaymentMethodsSummary,
    defaultBackgroundColor: string,
    labels: {
        sales: string;
        total: string;
        creditCard: string;
        cash: string;
        checks: string;
    } = {
        sales: 'Sales',
        total: 'Total',
        creditCard: 'Credit Card',
        cash: 'Cash',
        checks: 'Checks',
    }
): EndOfDayWidget[] => [
    {
        text: labels.sales,
        value: `${ordersCount}`,
        backgroundColor: defaultBackgroundColor,
        flex: 0.7,
    },
    {
        text: labels.total,
        value: formatPaymentAmount(getPaymentMethodsTotal(summary)),
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
];

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

export const createDateUpdater = (
    setDate: (date: Date) => void,
    setLoading: (value: boolean) => void,
    setOrders: (orders: Order[]) => void,
    setFilteredOrders: (orders: Order[]) => void,
    loadForRange: (
        dateRange: { startDate: any; endDate: any },
        fetchSales?: typeof getSalesForRange
    ) => Promise<Order[]> = loadPaidSalesForRange
) => (date: Date) => {
    setDate(date);
    const dateRange = buildDayRange(date);
    setLoading(true);
    loadForRange(dateRange).then((items) => {
        setOrders(items);
        setFilteredOrders(items);
        setLoading(false);
    });
};

export function EndOfDay(props: EndOfDayProps) {
    const styles = useSharedStyles();
    const local = localStyles;
    const t = (key: string, fallback: string) =>
        i18next.isInitialized && i18next.exists(key)
            ? String(i18next.t(key))
            : fallback;

    const [date, setDate] = useState(new Date());
    const [drOpen, setDrOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [paymentMethodsSummary, setPaymentMethodsSummary] = useState<PaymentMethodsSummary>({
        CC: 0, CASH: 0, CHECK: 0
    });
    
    const [employeesOpen, setEmployeesOpen] = useState(false);
    const [employeeValue, setEmployeeValue] = useState(null);
    const employees = useSelector(selectAllEmployees);
    const [employeeItems, setEmployeeItems] = useState<ItemType<string>[]>(
        getEmployeeItems(employees)
    )
    
    const [productsOpen, setProductsOpen] = useState(false);
    const [productValue, setProductValue] = useState<string | null>(null);
    const products = useSelector(selectAllProducts);
    const [productItems, setProductItems] = useState<ItemType<string>[]>(
        getProductItems(products)
    )

    const [closedByOpen, setClosedByOpen] = useState(false);
    const [closedByValue, setClosedByValue] = useState(null);
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
        paymentMethodsSummary,
        styles.dataRow.backgroundColor,
        {
            sales: t('EOD_Sales', 'Sales'),
            total: t('EOD_Total', 'Total'),
            creditCard: t('EOD_CreditCard', 'Credit Card'),
            cash: t('EOD_Cash', 'Cash'),
            checks: t('EOD_Checks', 'Checks'),
        }
    );
    const hasFilteredData = filteredOrders.length > 0;
    const updateDate = createDateUpdater(
        setDate,
        setLoading,
        setOrders,
        setFilteredOrders
    );

    useEffect(() => {
        const filterResponse = filterOrders(orders, {
            openedBy: employeeValue,
            closedBy: closedByValue,
            productId: productValue
        });
        setFilteredOrders(prev => filterResponse.orders);
        setPaymentMethodsSummary(prev => filterResponse.summary);
        
    }, [orders, employeeValue, closedByValue, productValue])

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
        <View style={styles.page}>
            <View style={[styles.box, { height: '100%' }]}>
                <View style={[styles.row, { zIndex: 1000 }]}>
                    <View style={{ flex: .5, paddingRight: 10, flexDirection: 'column' }}>
                        <Text style={[styles.secondaryText, { marginBottom: 5 }]}>
                            {t('EOD_Date', 'Date')}
                        </Text>
                        <Button title={date.toLocaleDateString()} onPress={() => setDrOpen(true)} />
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
                                setDrOpen(false)
                            }}
                        />
                    </View>
                    {filterConfigs.map((config) => (
                        <View
                            key={config.label}
                            style={{
                                flex: 1,
                                paddingLeft: config.leftPadding ? 10 : 0,
                                paddingRight: config.leftPadding ? 0 : 10,
                                flexDirection: 'column',
                            }}
                        >
                            <Text style={[styles.secondaryText, { marginBottom: 5 }]}>
                                {config.label}
                            </Text>
                            <DropDownPicker
                                style={styles.backgroundColor}
                                dropDownContainerStyle={styles.backgroundColor}
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

                {loading && 
                    <View style={[styles.centered, { paddingTop: 50 }]}>
                        <UISpinner
                            size="small"
                            message={t('COMMON_Loading', 'Loading...')}
                        />
                    </View>
                }

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
                            {t('EOD_NoDataForRange', 'No data found for this date range')}
                        </Text>
                        <Text style={local.emptySubtitle}>
                            {t(
                                'EOD_NoDataForRangeHelp',
                                'Completed sales matching the selected filters will appear here.'
                            )}
                        </Text>
                    </Animated.View>
                )}

                {!loading && hasFilteredData && (
                    <>
                        <View style={{ flexDirection: 'row' }}>
                            {widgets.map((widget) => (
                                <View key={widget.text} style={{ flex: widget.flex || 1 }}>
                                    <Widget
                                        height={80}
                                        backgroundColor={widget.backgroundColor}
                                        text={widget.text}
                                        value={widget.value}
                                        primaryTextSize={16}
                                        secondaryTextSize={12}
                                    />
                                </View>
                            ))}
                        </View>  

                        <FlatList
                            style={{ marginTop: 10 }}
                            data={filteredOrders}
                            renderItem={({ item }) => (
                                <OrderDetails key={item.id} order={item} productId={productValue} />
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

export default EndOfDay;
