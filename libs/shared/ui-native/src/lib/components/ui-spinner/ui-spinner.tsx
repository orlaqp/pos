import React from 'react';
import { useDesignTokens } from '@pos/theme/native/design-tokens';

import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';

export interface UISpinnerProps {
    size?: 'large' | 'small';
    message?: string;
    subtitle?: string;
}

export function UISpinner({ size, message, subtitle }: UISpinnerProps) {
    const tokens = useDesignTokens();
    const styles = useStyles(tokens);
    const spinnerSize = size || 'small';
    const label = message || 'Loading';

    return (
        <View
            accessibilityLabel={label}
            accessibilityRole="progressbar"
            style={styles.centered}
        >
            <View style={styles.panel}>
                <ActivityIndicator
                    size={spinnerSize}
                    color={tokens.colors.accent}
                />
                <View style={styles.copy}>
                    <Text style={styles.text}>{label}</Text>
                    <Text style={styles.subtext}>
                        {subtitle || 'Fetching the latest data'}
                    </Text>
                </View>
            </View>
        </View>
    );
}

const useStyles = (tokens: ReturnType<typeof useDesignTokens>) =>
    StyleSheet.create({
        centered: {
            alignItems: 'center',
            justifyContent: 'center',
        },
        panel: {
            minWidth: 220,
            maxWidth: 320,
            paddingHorizontal: tokens.spacing.md,
            paddingVertical: tokens.spacing.md,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
        },
        copy: {
            marginTop: tokens.spacing.md,
            alignItems: 'center',
        },
        text: {
            color: tokens.colors.textPrimary,
            fontSize: 18,
            fontWeight: '700',
            lineHeight: 22,
            textAlign: 'center',
        },
        subtext: {
            color: tokens.colors.textSecondary,
            fontSize: 13,
            lineHeight: 18,
            marginTop: tokens.spacing.xs,
            textAlign: 'center',
        },
    });

export default UISpinner;
