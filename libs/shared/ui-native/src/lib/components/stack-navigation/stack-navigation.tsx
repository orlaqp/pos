import React from 'react';

import { useSharedStyles } from '@pos/theme/native';
import { useTheme } from '@rneui/themed';

import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface StackNavigationProps {
    Stack: any;
    children: any;
    initialRouteName?: string;
}

/* eslint-disable-next-line */
export function StackNavigation({
    Stack,
    children,
    initialRouteName,
}: StackNavigationProps) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const styles = useStyles();

    return (
        <SafeAreaView style={styles.page}>
            <Stack.Navigator
                initialRouteName={initialRouteName}
                screenOptions={{
                    freezeOnBlur: true,
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
    const colors = theme?.theme?.colors || {
        background: '#000000',
        grey3: '#8491a2',
    };
    const sharedStyles = useSharedStyles();

    return {
        ...sharedStyles,
        ...StyleSheet.create({
            navHeader: {
                backgroundColor: colors.background,
                color: colors.grey3,
            },
            headerTitle: {
                color: colors.grey3,
            },
        }),
    };
};

export default StackNavigation;
