import React from 'react';
import { theme, useSharedStyles } from '@pos/theme/native';

import { View, Text, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Sidebar from '../sidebar/sidebar';
import { ScrollView } from 'react-native-gesture-handler';
import { Button, useTheme } from '@rneui/themed';

import {
    createNativeStackNavigator,
    NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { Categories } from '@pos/categories/native-feature';

import Logo from '../../assets/logo.png';
import { Products } from '@pos/products/native-feature';

const Stack = createNativeStackNavigator();

/* eslint-disable-next-line */
export interface BackOfficeProps {
    navigation: NativeStackNavigationProp<any>;
}

export function BackOffice({ navigation }: BackOfficeProps) {
    const theme = useTheme();
    const styles = useStyles();

    return (
        <SafeAreaView style={styles.page}>
            <Button
                icon={{
                    name: 'arrow-left-circle',
                    type: 'material-community',
                    color: theme.theme.colors.grey3,
                }}
                style={{ alignSelf: 'flex-start', position: 'relative' }}
                type="clear"
                onPress={() => navigation.replace('Home')}
            />
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
                                Orlando Quero
                            </Text>
                        </View>
                        <View style={{ marginLeft: 10 }}>
                            <Sidebar navigation={navigation} />
                        </View>
                    </ScrollView>
                </View>
                {/* <Divider color={theme.theme.colors.grey5} style={{ marginBottom: 20 }} orientation='vertical' /> */}

                <View style={styles.rightSide}>
                    <Stack.Navigator screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="Products" component={Products} />
                        <Stack.Screen
                            name="Categories"
                            component={Categories}
                        />
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
                flex: 2,
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
