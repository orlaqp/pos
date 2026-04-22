import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from './HomeScreen';
import { ConfirmSignupScreen, LoginScreen, SignUpScreen } from '@pos/auth/native-feature';
import { SalesScreen } from '@pos/sales/native-feature';

import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '@pos/store';
import { BackOffice } from '@pos/back-office/native-feature';
import {
    CompactOrderList,
    Orders,
} from '@pos/orders/native-feature';
import { OrderService } from '@pos/orders/data-access';
import { Button, Dialog, useTheme } from '@rneui/themed';
import { Alert, View } from 'react-native';
import { cartActions, selectCart } from '@pos/sales/data-access';
import { getDefaultPrinter, printReceipt } from '@pos/printings/data-access';
import { selectStore } from '@pos/store-info/data-access';
import { getThemeColors, useSharedStyles } from '@pos/theme/native';
import { employeesActions, selectLoginEmployee } from '@pos/employees/data-access';
import { Auth } from '@pos/shared/amplify';
import {
    authActions,
    clearCurrentTenantContext,
    tenantSessionActions,
} from '@pos/auth/data-access';
import { DataStore } from '@pos/shared/amplify';
import { markManualSignOut } from './session-signout';

/* eslint-disable-next-line */
export interface NavigationParamList {
    [key: string]: object | undefined;
    Home: undefined;
    Login: {
        email?: string;
    };
    Signup: undefined;
    ConfirmSignup: {
        email?: string;
    };
    Payments: undefined;
    BackOffice:
        | {
              initialScreen?: 'Dashboard' | 'Products' | 'Categories';
              initialScreenParams?: {
                  initialRouteName?: string;
              };
          }
        | undefined;
    Sales: {
        mode: 'order' | 'payment';
    };
}

const Stack = createNativeStackNavigator<NavigationParamList>();

export function Navigation() {
    const theme = useTheme();
    const colors = getThemeColors(theme);
    const styles = useSharedStyles();
    const user = useSelector((state: RootState) => state.auth.user);
    const employee = useSelector(selectLoginEmployee);
    const businessName = useSelector(
        (state: RootState) => state.tenantSession.businessName
    );
    const dispatch = useAppDispatch();
    const cart = useSelector(selectCart);
    const defaultPrinter = useSelector(getDefaultPrinter);
    const store = useSelector(selectStore);

    const [showOtherOrders, setShowOtherOrders] = useState<boolean>(false);
    const [showSalesActions, setShowSalesActions] = useState<boolean>(false);

    const print = () => {
        printReceipt(
            store,
            defaultPrinter,
            OrderService.buildPrintTicketPreview(cart)
        );
    };

    const confirmResetCart = () => {
        Alert.alert('Are you sure?', 'Press yes to confirm', [
            { text: 'No' },
            { text: 'Yes', onPress: () => dispatch(cartActions.reset()) },
        ]);
    };

    const switchEmployee = (navigation: any) => {
        setShowOtherOrders(false);
        dispatch(cartActions.reset());
        dispatch(employeesActions.logoffEmployee());
        navigation.navigate('Home');
    };

    const confirmSwitchEmployee = (navigation: any) => {
        const hasCartItems = (cart.items?.length || 0) > 0;

        Alert.alert(
            'Switch employee?',
            hasCartItems
                ? 'This will clear the current sale and return to the PIN screen.'
                : 'This will return to the PIN screen without logging out the business admin.',
            [
                { text: 'Cancel' },
                { text: 'Switch', onPress: () => switchEmployee(navigation) },
            ]
        );
    };

    const renderSwitchEmployeeButton = (navigation: any) =>
        employee ? (
            <Button
                type="clear"
                title="Switch Employee"
                testID="nav-switch-employee-button"
                containerStyle={{ marginRight: 12 }}
                onPress={() => confirmSwitchEmployee(navigation)}
            />
        ) : null;

    const confirmLogoff = () => {
        Alert.alert('Are you sure?', 'Press yes to confirm', [
            { text: 'No' },
            {
                text: 'Yes',
                onPress: async () => {
                    try {
                        await markManualSignOut();
                        await Auth.signOut('local');
                        await DataStore.stop();
                    } finally {
                        clearCurrentTenantContext();
                        dispatch(authActions.logoff());
                        dispatch(tenantSessionActions.clearTenantSession());
                        dispatch(employeesActions.logoffEmployee());
                    }
                },
            },
        ]);
    };

    return (
        <>
            <Dialog
                isVisible={showOtherOrders}
                onBackdropPress={() => setShowOtherOrders(false)}
                supportedOrientations={['landscape']}
                presentationStyle="fullScreen"
                overlayStyle={[
                    styles.overlay,
                    {
                        width: 780,
                        maxWidth: '95%',
                        borderRadius: 16,
                        padding: 20,
                    },
                ]}
            >
                {showOtherOrders ? (
                    <CompactOrderList
                        onSelect={() => setShowOtherOrders(false)}
                        onClose={() => setShowOtherOrders(false)}
                    />
                ) : null}
            </Dialog>
            <Dialog
                isVisible={showSalesActions}
                onBackdropPress={() => setShowSalesActions(false)}
                supportedOrientations={['landscape']}
                presentationStyle="fullScreen"
                overlayStyle={[
                    styles.overlay,
                    {
                        width: 280,
                        maxWidth: '90%',
                        borderRadius: 20,
                        padding: 18,
                    },
                ]}
            >
                <Button
                    testID="nav-actions-open-orders"
                    type="clear"
                    title="Open Orders"
                    onPress={() => {
                        setShowSalesActions(false);
                        setShowOtherOrders(true);
                    }}
                    buttonStyle={{ justifyContent: 'flex-start' }}
                    titleStyle={{ width: '100%', textAlign: 'left' }}
                />
                <Button
                    testID="nav-actions-print"
                    type="clear"
                    title="Print"
                    onPress={() => {
                        setShowSalesActions(false);
                        print();
                    }}
                    disabled={cart.items?.length === 0}
                    buttonStyle={{ justifyContent: 'flex-start' }}
                    titleStyle={{ width: '100%', textAlign: 'left' }}
                />
                <Button
                    testID="nav-actions-reset"
                    type="clear"
                    title="Reset"
                    onPress={() => {
                        setShowSalesActions(false);
                        confirmResetCart();
                    }}
                    disabled={cart.items?.length === 0}
                    buttonStyle={{ justifyContent: 'flex-start' }}
                    titleStyle={{
                        width: '100%',
                        textAlign: 'left',
                        color:
                            cart.items?.length === 0
                                ? theme.theme.colors.disabled
                                : theme.theme.colors.error,
                    }}
                />
            </Dialog>
            <Stack.Navigator
                id="root-navigation"
                screenOptions={{
                    freezeOnBlur: true,
                    headerStyle: {
                        backgroundColor: colors.background,
                    },
                    headerTitleStyle: {
                        color: colors.grey0,
                    },
                }}
            >
                {user ? (
                    <>
                        <Stack.Screen
                            name="Home"
                            component={HomeScreen}
                            options={({ navigation }) => ({
                                headerShown: true,
                                headerTitle: 'Home',
                                headerRight: () => (
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                        }}
                                    >
                                        {renderSwitchEmployeeButton(navigation)}
                                        <Button
                                            type="clear"
                                            title="Logoff"
                                            testID="nav-home-logoff-button"
                                            containerStyle={{ marginRight: 8 }}
                                            onPress={confirmLogoff}
                                        />
                                    </View>
                                )
                            })}
                        />
                        <Stack.Screen
                            name="Sales"
                            component={SalesScreen}
                            options={({ navigation }) => ({
                                headerTitle: employee ? `${employee.firstName} ${employee.lastName}` : user.name,
                                headerRight: () => (
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                        }}
                                    >
                                        {renderSwitchEmployeeButton(navigation)}
                                        <Button
                                            testID="nav-sales-actions-button"
                                            type="clear"
                                            containerStyle={{ marginRight: 8 }}
                                            title="Actions"
                                            onPress={() => setShowSalesActions(true)}
                                            icon={{
                                                name: 'chevron-down',
                                                type: 'material-community',
                                                color: theme.theme.colors.primary,
                                                size: 18,
                                            }}
                                            iconRight
                                        />
                                    </View>
                                ),
                            })}
                        />
                        <Stack.Screen
                            name="Payments"
                            component={Orders}
                            options={({ navigation }) => ({
                                headerShown: false,
                                headerRight: () => renderSwitchEmployeeButton(navigation),
                            })}
                        />
                        <Stack.Screen
                            name="BackOffice"
                            component={BackOffice}
                            options={({ navigation }) => ({
                                headerTitle: businessName || 'Back Office',
                                headerRight: () => renderSwitchEmployeeButton(navigation),
                            })}
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
                        <Stack.Screen
                            name="ConfirmSignup"
                            component={ConfirmSignupScreen}
                            options={{ headerShown: false }}
                        />
                    </>
                )}
            </Stack.Navigator>
        </>
    );
}

export default Navigation;
