import React from 'react';
import { useSharedStyles } from '@pos/theme/native';

import { View, Text, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Sidebar from '../sidebar/sidebar';
import { ScrollView } from 'react-native-gesture-handler';
import { useTheme } from '@rneui/themed';

import {
    createNativeStackNavigator,
    NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import {
    createNavigationContainerRef,
    NavigationContainer,
    NavigationIndependentTree,
    StackActions,
} from '@react-navigation/native';
import { useSelector } from 'react-redux';

import { Brands } from '@pos/brands/native-feature';
import { Categories } from '@pos/categories/native-feature';
import { Employees } from '@pos/employees/native-feature';
import { Products } from '@pos/products/native-feature';
import { UnitOfMeasures } from '@pos/unit-of-measures/native-feature';
import { PrinterList } from '@pos/printings/native-feature';
import { StationForm, StoreInfoForm } from '@pos/store-info/native-feature';
import { LogList, Settings } from '@pos/settings/native-feature';
import { InventoryCounts, InventoryList, InventoryReceives } from '@pos/inventory/native-feature';
import { Dashboard, EndOfDay, Sales, SalesByEmployee, SalesByProduct } from '@pos/reporting/native-feature';

import Logo from '../../assets/logo.png';
import { selectLoginEmployee } from '@pos/employees/data-access';

const Stack = createNativeStackNavigator();
const backOfficeNavigationRef = createNavigationContainerRef();

/* eslint-disable-next-line */
export interface BackOfficeProps {
    navigation: NativeStackNavigationProp<any>;
}

export function BackOffice({ navigation }: BackOfficeProps) {
    const styles = useStyles();
    const employee = useSelector(selectLoginEmployee);
    const sidebarNavigation = {
        replace: (name: string, params?: object) => {
            if (!backOfficeNavigationRef.isReady()) return;
            backOfficeNavigationRef.dispatch(StackActions.replace(name, params));
        },
    };

    return (
        <SafeAreaView style={styles.page}>
            <View style={[styles.page, styles.row]}>
                <View style={styles.leftSide}>
                    <ScrollView contentContainerStyle={styles.leftScrollContent}>
                        <View style={styles.sidebarHeader}>
                            <Image source={Logo} style={styles.logo} />
                            <Text style={styles.employeeName}>
                                {`${employee?.firstName} ${employee?.lastName}`}
                            </Text>
                        </View>
                        <View style={styles.sidebarNavContainer}>
                            <Sidebar navigation={sidebarNavigation as any} />
                        </View>
                    </ScrollView>
                </View>
                
                <View style={styles.rightSide}>
                    <NavigationIndependentTree>
                        <NavigationContainer ref={backOfficeNavigationRef}>
                            <Stack.Navigator screenOptions={{ headerShown: false }}>
                                <Stack.Screen name="Dashboard" component={Dashboard} />
                                <Stack.Screen name="Sale List" component={Sales} />
                                <Stack.Screen name="Station" component={StationForm} />
                                <Stack.Screen name="By Employee" component={SalesByEmployee} />
                                <Stack.Screen name="By Product" component={SalesByProduct} />
                                <Stack.Screen name="End of Day" component={EndOfDay} />
                                <Stack.Screen name="In Stock" component={InventoryList} />
                                <Stack.Screen name="Counts" component={InventoryCounts} />
                                <Stack.Screen name="Receives" component={InventoryReceives} />
                                <Stack.Screen name="Products" component={Products} />
                                <Stack.Screen name="Brands" component={Brands} />
                                <Stack.Screen name="U/M" component={UnitOfMeasures} />
                                <Stack.Screen name="Categories" component={Categories} />
                                <Stack.Screen name="Printers" component={PrinterList} />
                                <Stack.Screen name="Store" component={StoreInfoForm} />
                                <Stack.Screen name="General" component={Settings} />
                                <Stack.Screen name="Employees" component={Employees} />
                                <Stack.Screen name="Logs" component={LogList} />
                            </Stack.Navigator>
                        </NavigationContainer>
                    </NavigationIndependentTree>
                </View>
            </View>
        </SafeAreaView>
    );
}

const useStyles = () => {
    const theme = useTheme();
    const sharedStyles = useSharedStyles();

    return {
        ...sharedStyles,
        ...StyleSheet.create({
            leftSide: {
                flex: 2.3,
                flexDirection: 'column',
                paddingHorizontal: 12,
            },
            rightSide: {
                ...sharedStyles.darkerGrayBackground,
                ...sharedStyles.rounded,
                flex: 9,
                marginLeft: 10,
                height: '100%',
                marginBottom: 10,
            },
            logo: {
                width: 100,
                height: 100,
            },
            leftScrollContent: {
                paddingTop: 8,
                paddingBottom: 16,
            },
            sidebarHeader: {
                position: 'relative',
                alignItems: 'center',
                marginBottom: 14,
            },
            employeeName: {
                color: theme.theme.colors.grey1,
                fontWeight: '600',
                marginTop: 2,
            },
            sidebarNavContainer: {
                ...sharedStyles.darkBackground,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: `${theme.theme.colors.grey4}55`,
                paddingVertical: 8,
            },
            navHeader: {
                backgroundColor: theme.theme.colors.background,
                color: theme.theme.colors.grey3,
            },
            headerTitle: {
                color: theme.theme.colors.grey3,
            },
        }),
    };
};

export default BackOffice;
