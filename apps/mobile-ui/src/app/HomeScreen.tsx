import { useSharedStyles } from '@pos/theme/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme, Button, Card, CheckBox } from '@rneui/themed';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';

import emptyCart from '../../assets/empty-cart.png';
import payment from '../../assets/payment.png';
import chart from '../../assets/chart.png';

import { useDispatch, useSelector } from 'react-redux';
import { Role, selectEmployee, selectUser } from '@pos/auth/data-access';
import { UIKeyPad } from '@pos/shared/ui-native';
import { employeesActions, EmployeeService, selectLoginEmployee } from '@pos/employees/data-access';

interface PathDetails {
    title: string;
    path: string;
    icon?: string;
    image?: any;
    role: string;
    params?: object;
    action?: () => void;
}

interface HomeScreenProps {
    navigation: NativeStackNavigationProp<any>;
}

export const HomeScreen = (props: HomeScreenProps) => {
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const theme = useTheme();
    const sharedStyles = useSharedStyles();
    const styles = useStyles();
    const employee = useSelector(selectLoginEmployee);
    const [pin, setPin] = useState<string>();
    const paths: PathDetails[] = [
        {
            title: 'Sales',
            path: 'Sales',
            image: emptyCart,
            role: Role.Sales,
            params: { mode: 'order' },
        },
        {
            title: 'Payments',
            path: 'Payments',
            image: payment,
            role: Role.Payments,
        },
        {
            title: 'Back Office',
            path: 'BackOffice',
            image: chart,
            role: Role.Admin,
        },
    ];
    const goto = (details: PathDetails) =>
        props.navigation.navigate(details.path, details.params);

    const onPinUpdated = (pin) => {
        console.log(pin);

        if (pin.length === 4) {
            setPin(pin);
            return '';
        }

        return pin;
    }

    useEffect(() => {
        if (!pin) return;

        EmployeeService.getEmployee(pin).then(emp => {
            if (!emp) return;
            console.log(`Employee found`, emp);
            dispatch(employeesActions.loginEmployee(emp));
        })
    }, [pin]);

    useEffect(() => {
        setPin('');
    }, [employee]);

    return (
        <View style={[sharedStyles.page, sharedStyles.centered, { position: 'relative' }]}>

            { !employee &&
            <View>
                <UIKeyPad initialValue={''} onChange={onPinUpdated} />
            </View>
            }

            { employee &&
            <View style={{ flexDirection: 'row' }}>
                {paths.map((p) => {
                    if (!employee.roles?.includes(p.role)) return null;

                    return (
                        <TouchableOpacity onPress={() => goto(p)} key={p.title}>
                            <View
                                style={[
                                    styles.bigButton,
                                    sharedStyles.centered,
                                ]}
                            >
                                {p.image && (
                                    <Image
                                        source={p.image}
                                        style={{ width: 150, height: 150 }}
                                    />
                                )}
                                <Text
                                    style={{ color: theme.theme.colors.black }}
                                >
                                    {p.title}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
            }
        </View>
    );
};

const useStyles = () => {
    const theme = useTheme();
    const sharedStyles = useSharedStyles();

    return StyleSheet.create({
        ...sharedStyles,
        icon: {
            color: theme.theme.colors.white,
        },
        bigButton: {
            backgroundColor: `${theme.theme.colors.grey5}33`,
            borderRadius: 10,
            margin: 15,
            padding: 20,
            minWidth: 150,
            minHeight: 150,
        },
    });
};
