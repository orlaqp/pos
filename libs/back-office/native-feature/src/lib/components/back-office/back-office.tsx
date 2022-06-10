import React from 'react';
import { useSharedStyles } from '@pos/theme/native';

import { View, Text, StyleSheet, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Sidebar from '../sidebar/sidebar';
import { ScrollView } from 'react-native-gesture-handler';
import { Button, useTheme } from '@rneui/themed';

import {
    createNativeStackNavigator,
    NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { selectUser } from '@pos/auth/data-access';

import { Brands } from '@pos/brands/native-feature';
import { Categories } from '@pos/categories/native-feature';
import { Employees } from '@pos/employees/native-feature';
import { Products } from '@pos/products/native-feature';
import { UnitOfMeasures } from '@pos/unit-of-measures/native-feature';
import { PrinterList } from '@pos/printings/native-feature';
import { StoreInfoForm } from '@pos/store-info/native-feature';
import { Settings } from '@pos/settings/native-feature';
import { InventoryCounts, InventoryList, InventoryReceives } from '@pos/inventory/native-feature';
import { Dashboard, Sales, SalesByEmployee, SalesByProduct } from '@pos/reporting/native-feature';

import Logo from '../../assets/logo.png';

const Stack = createNativeStackNavigator();

/* eslint-disable-next-line */
export interface BackOfficeProps {
    navigation: NativeStackNavigationProp<any>;
}

export function BackOffice({ navigation }: BackOfficeProps) {
    const theme = useTheme();
    const styles = useStyles();
    const user = useSelector(selectUser);

    const confirmGoBack = () => {
        Alert.alert(
            'Are you sure?',
            'Press yes to confirm',
            [
                { text: 'No' },
                { text: 'Yes', onPress: () => navigation.goBack() },
            ]
        );
    }

    return (
        <SafeAreaView style={styles.page}>
            <View style={[styles.page, styles.row]}>
                <View style={styles.leftSide}>
                    <ScrollView>
                        <View
                            style={{
                                position: 'relative',
                                alignItems: 'flex-start',
                                marginLeft: 60,
                                marginBottom: 20,
                            }}
                        >
                            <Image source={Logo} style={styles.logo} />
                            <Text style={{ color: 'white' }}>
                                {user?.name}
                            </Text>
                        </View>
                        <View style={{ marginLeft: 10 }}>
                            <Sidebar navigation={navigation} />
                        </View>
                    </ScrollView>
                </View>
                
                <View style={styles.rightSide}>
                    <Stack.Navigator screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="Employees" component={Employees} />
                        <Stack.Screen name="Dashboard" component={Dashboard} />
                        <Stack.Screen name="Sale List" component={Sales} />
                        <Stack.Screen name="By Employee" component={SalesByEmployee} />
                        <Stack.Screen name="By Product" component={SalesByProduct} />
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
                    </Stack.Navigator>
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
