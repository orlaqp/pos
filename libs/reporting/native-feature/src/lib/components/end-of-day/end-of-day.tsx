import { useSharedStyles } from '@pos/theme/native';
import React, { useEffect, useState } from 'react';
import DropDownPicker, { ItemType } from 'react-native-dropdown-picker';


import { View, Text, ScrollView, FlatList } from 'react-native';
import { useSelector } from 'react-redux';
import { selectAllEmployees } from '@pos/employees/data-access';
import { selectAllProducts } from '@pos/products/data-access';
import { getCategoryItems, getEmployeeItems, getProductItems } from './end-of-day.service';
import { selectAllCategories } from '@pos/categories/data-access';
import DatePicker from 'react-native-date-picker';
import { Button } from '@rneui/themed';
import { getSalesForRange } from '@pos/reporting/data-access';
import moment from 'moment';
import { Order } from '@pos/shared/models';
import { UISpinner } from '@pos/shared/ui-native';
import OrderDetails from './order-details';

/* eslint-disable-next-line */
export interface EndOfDayProps {}

export function EndOfDay(props: EndOfDayProps) {
    const styles = useSharedStyles();

    const [date, setDate] = useState(new Date())
    const [drOpen, setDrOpen] = useState(true)
    const [loading, setLoading] = useState(true)
    const [orders, setOrders] = useState<Order[]>([])
    
    const [employeesOpen, setEmployeesOpen] = useState(false);
    const [employeeValue, setEmployeeValue] = useState(null);
    const employees = useSelector(selectAllEmployees);
    const [employeeItems, setEmployeeItems] = useState<ItemType<string>[]>(
        getEmployeeItems(employees)
    )
    
    const [productsOpen, setProductsOpen] = useState(false);
    const [productValue, setProductValue] = useState(null);
    const products = useSelector(selectAllProducts);
    const [productItems, setProductItems] = useState<ItemType<string>[]>(
        getProductItems(products)
    )

    const [categoriesOpen, setCategoriesOpen] = useState(false);
    const [categoryValue, setCategoryValue] = useState(null);
    const categories = useSelector(selectAllCategories);
    const [categoryItems, setCategoryItems] = useState<ItemType<string>[]>(
        getCategoryItems(categories)
    )

    const updateDate = (date) => {
        console.log('updating date');
        
        setDate(date);
        const dateRange = {
            startDate: moment(date).startOf('day'),
            endDate: moment(date).endOf('day'),
        };

        setLoading(true);
        const getSales = async () => {
            const items = await getSalesForRange('PAID', dateRange);
            console.log(items);
            if (!items) return setOrders([]);
            setOrders(items);
            setLoading(false);
        };

        getSales();
    }

    return (
        <View style={styles.page}>
            
            <View style={[styles.box, { height: '100%' }]}>
                <View style={styles.row}>
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
                        <Text style={[styles.secondaryText, { marginBottom: 5 }]}>Employee</Text>
                        <DropDownPicker
                            style={styles.backgroundColor}
                            dropDownContainerStyle={[styles.backgroundColor, { zIndex: 1000 }]}
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
                        <Text style={[styles.secondaryText, { marginBottom: 5 }]}>Category(s)</Text>
                        <DropDownPicker
                            style={styles.backgroundColor}
                            dropDownContainerStyle={styles.backgroundColor}
                            searchable={true}
                            open={categoriesOpen}
                            value={categoryValue}
                            items={categoryItems}
                            setOpen={setCategoriesOpen}
                            setValue={setCategoryValue}
                            setItems={setCategoryItems}
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
                <FlatList
                    style={{ marginTop: 10 }}
                    data={orders}
                    renderItem={({ item }) => (
                        <OrderDetails key={item.id} order={item} />
                    )}
                />
                }
            </View>

            {/* <View style={[styles.box, { height: '83%' }]}></View> */}

        </View>
    );
}

export default EndOfDay;
