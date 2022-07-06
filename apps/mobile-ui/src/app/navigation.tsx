import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from './HomeScreen';
import { LoginScreen, SignUpScreen } from '@pos/auth/native-feature';
import { SalesScreen } from '@pos/sales/native-feature';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@pos/store';
import { BackOffice } from '@pos/back-office/native-feature';
import { Auth, DataStore } from 'aws-amplify';
import { CompactOrderList, OrderList, Orders } from '@pos/orders/native-feature';
import { Button, Dialog, useTheme } from '@rneui/themed';
import { Alert, Text } from 'react-native';
import { cartActions, selectCart } from '@pos/sales/data-access';
import { getDefaultPrinter, printReceipt } from '@pos/printings/data-access';
import { selectStore } from '@pos/store-info/data-access';
import { useSharedStyles } from '@pos/theme/native';
import { authActions } from '@pos/auth/data-access';
import { employeesActions, selectLoginEmployee } from '@pos/employees/data-access';

/* eslint-disable-next-line */
export interface NavigationParamList {
    [key: string]: object | undefined;
    Sales: {
        mode: 'order' | 'payment';
    };
}

const Stack = createNativeStackNavigator<NavigationParamList>();

export function Navigation() {
    const theme = useTheme();
    const styles = useSharedStyles();
    const user = useSelector((state: RootState) => state.auth.user);
    const employee = useSelector(selectLoginEmployee);
    const dispatch = useDispatch();
    const cart = useSelector(selectCart);
    const defaultPrinter = useSelector(getDefaultPrinter);
    const store = useSelector(selectStore);

    const [showOtherOrders, setShowOtherOrders] = useState<boolean>(false);

    const print = () => {
        printReceipt(store, defaultPrinter, cart);
    };

    const confirmResetCart = () => {
        Alert.alert('Are you sure?', 'Press yes to confirm', [
            { text: 'No' },
            { text: 'Yes', onPress: () => dispatch(cartActions.reset()) },
        ]);
    };

    const confirmLogoff = () => {
        Alert.alert('Are you sure?', 'Press yes to confirm', [
            { text: 'No' },
            { text: 'Yes', onPress: () => {
                // Auth.signOut();
                dispatch(employeesActions.logoffEmployee());
            }},
        ]);
    };

    return (
        <>
            <Dialog
                isVisible={showOtherOrders}
                onBackdropPress={() => setShowOtherOrders(false)}
                overlayStyle={[styles.overlay, { width: 700 }]}
            >
                <CompactOrderList onSelect={() => setShowOtherOrders(false)} />
            </Dialog>
            <Stack.Navigator
                screenOptions={{
                    headerStyle: {
                        backgroundColor: theme.theme.colors.background,
                    },
                    headerTitleStyle: {
                        color: theme.theme.colors.grey0,
                    },
                }}
            >
                {user ? (
                    <>
                        <Stack.Screen
                            name="Home"
                            component={HomeScreen}
                            options={{
                                headerShown: true,
                                headerTitle: 'Home',
                                headerRight: () => (
                                    <Button
                                        type="clear"
                                        title="Logoff"
                                        style={{ marginRight: 20 }}
                                        onPress={confirmLogoff}
                                    />
                                )
                            }}
                        />
                        <Stack.Screen
                            name="Sales"
                            component={SalesScreen}
                            options={{
                                headerTitle: employee ? `${employee.firstName} ${employee.lastName}` : user.name,
                                headerRight: () => (
                                    <>
                                        <Button
                                            type="clear"
                                            title="View Others"
                                            style={{ marginRight: 20 }}
                                            onPress={() => setShowOtherOrders(true)}
                                        />
                                        <Button
                                            type="clear"
                                            title="Print"
                                            style={{ marginRight: 20 }}
                                            onPress={print}
                                            disabled={cart.items?.length === 0}
                                            // icon={{
                                            //     name: 'printer-outline',
                                            //     type: 'material-community',
                                            //     color: cart.items?.length === 0 ? theme.theme.colors.disabled : theme.theme.colors.primary
                                            // }}
                                        />
                                        <Button
                                            type="clear"
                                            title="Reset"
                                            onPress={confirmResetCart}
                                            disabled={cart.items?.length === 0}
                                        />
                                    </>
                                ),
                            }}
                        />
                        <Stack.Screen name="Payments" component={Orders} />
                        <Stack.Screen
                            name="BackOffice"
                            component={BackOffice}
                        />
                    </>
                ) : (
                    <>
                        <Stack.Screen
                            name="Login"
                            component={LoginScreen}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="Signup"
                            component={SignUpScreen}
                            options={{ headerShown: false }}
                        />
                    </>
                )}
            </Stack.Navigator>
        </>
    );
}

export default Navigation;
