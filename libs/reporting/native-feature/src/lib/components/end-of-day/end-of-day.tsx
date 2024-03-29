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
    
    const updateDate = (date) => {
        setDate(date);
        const dateRange = {
            startDate: moment(date).startOf('day'),
            endDate: moment(date).endOf('day'),
        };

        setLoading(true);
        const getSales = async () => {
            const items = await getSalesForRange('PAID', dateRange);
            if (!items) return setOrders([]);
            setOrders(items);
            setFilteredOrders(items);
            setLoading(false);
        };

        getSales();
    }

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
                    <View style={{ flex: 1, paddingRight: 10, flexDirection: 'column' }}>
                        <Text style={[styles.secondaryText, { marginBottom: 5 }]}>Opened by</Text>
                        <DropDownPicker
                            style={[styles.backgroundColor]}
                            dropDownContainerStyle={[styles.backgroundColor]}
                            open={employeesOpen}
                            value={employeeValue}
                            items={employeeItems}
                            setOpen={setEmployeesOpen}
                            setValue={setEmployeeValue}
                            setItems={setEmployeeItems}
                            theme='DARK'
                        />
                    </View>
                    <View style={{ flex: 1, paddingLeft: 10, flexDirection: 'column' }}>
                        <Text style={[styles.secondaryText, { marginBottom: 5 }]}>Closed by</Text>
                        <DropDownPicker
                            style={styles.backgroundColor}
                            dropDownContainerStyle={styles.backgroundColor}
                            open={closedByOpen}
                            value={closedByValue}
                            items={employeeItems}
                            setOpen={setClosedByOpen}
                            setValue={setClosedByValue}
                            setItems={setEmployeeItems}
                            theme='DARK'
                        />
                    </View>
                    <View style={{ flex: 1, paddingLeft: 10, flexDirection: 'column' }}>
                        <Text style={[styles.secondaryText, { marginBottom: 5 }]}>Product(s)</Text>
                        <DropDownPicker
                            style={styles.backgroundColor}
                            dropDownContainerStyle={styles.backgroundColor}
                            searchable={true}
                            open={productsOpen}
                            value={productValue}
                            items={productItems}
                            setOpen={setProductsOpen}
                            setValue={setProductValue}
                            setItems={setProductItems}
                            theme='DARK'
                        />
                    </View>
                </View>

                {loading && 
                    <View style={[styles.centered, { paddingTop: 50 }]}>
                        <UISpinner size="small" message="Loading..." />
                    </View>
                }

                {!loading &&
                <>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ flex: .7 }}>
                            <Widget
                                height={80}
                                backgroundColor={styles.dataRow.backgroundColor}
                                text="Sales"
                                value={`${filteredOrders.length}`}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Widget
                                height={80}
                                backgroundColor={styles.dataRow.backgroundColor}
                                text="Total"
                                value={`$ ${(paymentMethodsSummary.CASH + paymentMethodsSummary.CC + paymentMethodsSummary.CHECK).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
                                primaryTextSize={16}
                                secondaryTextSize={12}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Widget
                                height={80}
                                backgroundColor="#1976d2"
                                text="Credit Card"
                                value={`$${paymentMethodsSummary.CC.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
                                primaryTextSize={16}
                                secondaryTextSize={12}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Widget
                                height={80}
                                backgroundColor="#e91e63"
                                text="Cash"
                                value={`$${paymentMethodsSummary.CASH.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
                                primaryTextSize={16}
                                secondaryTextSize={12}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Widget
                                height={80}
                                backgroundColor="#43a047"
                                text="Checks"
                                value={`$${paymentMethodsSummary.CHECK.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
                                primaryTextSize={16}
                                secondaryTextSize={12}
                            />
                        </View>
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
