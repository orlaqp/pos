import { useSharedStyles } from '@pos/theme/native';
import React, { useEffect, useState } from 'react';
import DropDownPicker, { ItemType } from 'react-native-dropdown-picker';


import { View, Text, FlatList } from 'react-native';
import { useSelector } from 'react-redux';
import { selectAllEmployees } from '@pos/employees/data-access';
import { selectAllProducts } from '@pos/products/data-access';
import { filterOrders, getEmployeeItems, getProductItems, PaymentMethodsSummary } from './end-of-day.service';
import DatePicker from 'react-native-date-picker';
import { Button } from '@rneui/themed';
import { getSalesForRange } from '@pos/reporting/data-access';
import moment from 'moment';
import { Order } from '@pos/shared/models';
import { UISpinner } from '@pos/shared/ui-native';
import OrderDetails from './order-details';
import Widget from '../widget/widget';

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
    setOpen: (value: boolean) => void;
    setValue: (value: any) => void;
    setItems: (items: ItemType<string>[]) => void;
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
    defaultBackgroundColor: string
): EndOfDayWidget[] => [
    {
        text: 'Sales',
        value: `${ordersCount}`,
        backgroundColor: defaultBackgroundColor,
        flex: 0.7,
    },
    {
        text: 'Total',
        value: formatPaymentAmount(getPaymentMethodsTotal(summary)),
        backgroundColor: defaultBackgroundColor,
        flex: 1,
    },
    {
        text: 'Credit Card',
        value: formatPaymentAmount(summary.CC),
        backgroundColor: '#1976d2',
        flex: 1,
    },
    {
        text: 'Cash',
        value: formatPaymentAmount(summary.CASH),
        backgroundColor: '#e91e63',
        flex: 1,
    },
    {
        text: 'Checks',
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
    setEmployeeItems: (items: ItemType<string>[]) => void;
    closedByOpen: boolean;
    closedByValue: any;
    setClosedByOpen: (value: boolean) => void;
    setClosedByValue: (value: any) => void;
    productsOpen: boolean;
    productValue: string | null;
    productItems: ItemType<string>[];
    setProductsOpen: (value: boolean) => void;
    setProductValue: (value: string | null) => void;
    setProductItems: (items: ItemType<string>[]) => void;
}): EndOfDayFilterConfig[] => [
    {
        label: 'Opened by',
        open: params.employeesOpen,
        value: params.employeeValue,
        items: params.employeeItems,
        setOpen: params.setEmployeesOpen,
        setValue: params.setEmployeeValue,
        setItems: params.setEmployeeItems,
    },
    {
        label: 'Closed by',
        open: params.closedByOpen,
        value: params.closedByValue,
        items: params.employeeItems,
        setOpen: params.setClosedByOpen,
        setValue: params.setClosedByValue,
        setItems: params.setEmployeeItems,
        leftPadding: true,
    },
    {
        label: 'Product(s)',
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
    });
    const widgets = buildEndOfDayWidgets(
        filteredOrders.length,
        paymentMethodsSummary,
        styles.dataRow.backgroundColor
    );
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

    return (
        <View style={styles.page}>
            <View style={[styles.box, { height: '100%' }]}>
                <View style={[styles.row, { zIndex: 1000 }]}>
                    <View style={{ flex: .5, paddingRight: 10, flexDirection: 'column' }}>
                        <Text style={[styles.secondaryText, { marginBottom: 5 }]}>Date</Text>
                        <Button title={date.toLocaleDateString()} onPress={() => setDrOpen(true)} />
                        <DatePicker
                            modal
                            mode='date'
                            open={drOpen}
                            date={date}
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
                        <UISpinner size="small" message="Loading..." />
                    </View>
                }

                {!loading &&
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
                }
            </View>
        </View>
    );
}

export default EndOfDay;
