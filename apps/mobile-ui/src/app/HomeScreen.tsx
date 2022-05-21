import { useSharedStyles } from '@pos/theme/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme, Button, Card } from '@rneui/themed';
import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';

import emptyCart from '../../assets/empty-cart.png';
import payment from '../../assets/payment.png';
import chart from '../../assets/chart.png';
import { useSelector } from 'react-redux';
import { Role, selectUser } from '@pos/auth/data-access';

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
    const user = useSelector(selectUser);
    const theme = useTheme();
    const sharedStyles = useSharedStyles();
    const styles = useStyles();
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

    return (
        <View style={[sharedStyles.page, sharedStyles.centered]}>
            <View style={{ flexDirection: 'row' }}>
                {paths.map((p) => {
                    if (!user.groups.includes(p.role)) return null;

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
        </View>
    );
};

const useStyles = () => {
    const theme = useTheme();

    return StyleSheet.create({
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
