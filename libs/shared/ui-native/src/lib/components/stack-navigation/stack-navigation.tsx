import React from 'react';

import { useSharedStyles } from '@pos/theme/native';
import { TypedNavigator } from '@react-navigation/native';
import { useTheme } from '@rneui/themed';

import { SafeAreaView, StyleSheet } from 'react-native';

export interface StackNavigationProps {
    Stack: TypedNavigator<any, any, any, any, any>
}

/* eslint-disable-next-line */
export function StackNavigation({ Stack, children }: any) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const styles = useStyles();

    return (
        <SafeAreaView style={styles.page}>
            <Stack.Navigator
                screenOptions={{
                    headerStyle: styles.navHeader,
                    headerTitleStyle: styles.headerTitle,
                }}
            >
                {children}
            </Stack.Navigator>
        </SafeAreaView>
    );
}

const useStyles = () => {
    const theme = useTheme();
    const sharedStyles = useSharedStyles();

    return {
        ...sharedStyles,
        ...StyleSheet.create({
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

export default StackNavigation;
