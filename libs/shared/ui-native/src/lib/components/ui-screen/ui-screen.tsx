import { useDesignTokens } from '@pos/theme/native/design-tokens';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ScrollView,
    StyleSheet,
    StyleProp,
    View,
    ViewStyle,
} from 'react-native';

export interface UIScreenProps {
    children?: React.ReactNode;
    scroll?: boolean;
    padded?: boolean;
    style?: StyleProp<ViewStyle>;
    contentContainerStyle?: StyleProp<ViewStyle>;
    testID?: string;
}

export function UIScreen({
    children,
    scroll = false,
    padded = false,
    style,
    contentContainerStyle,
    testID,
}: UIScreenProps) {
    const tokens = useDesignTokens();
    const paddingStyle = padded ? { padding: tokens.spacing.lg } : undefined;

    if (scroll) {
        return (
            <SafeAreaView
                testID={testID}
                style={[styles.safeArea, { backgroundColor: tokens.colors.canvas }, style]}
            >
                <ScrollView
                    contentContainerStyle={[styles.content, paddingStyle, contentContainerStyle]}
                >
                    {children}
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView
            testID={testID}
            style={[styles.safeArea, { backgroundColor: tokens.colors.canvas }, style]}
        >
            <View style={[styles.content, paddingStyle, contentContainerStyle]}>{children}</View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
});

export default UIScreen;
