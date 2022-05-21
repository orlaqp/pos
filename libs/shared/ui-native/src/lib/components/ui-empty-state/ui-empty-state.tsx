import { theme, useSharedStyles } from '@pos/theme/native';
import { Button, useTheme } from '@rneui/themed';
import React from 'react';

import { View, Text, StyleSheet, Image } from 'react-native';

import EmptyBox from '../../assets/empty-box.png';

/* eslint-disable-next-line */
export interface EmptyStateProps {
    imageSize?: number;
    text: string;
    actionText?: string;
    action?: () => unknown;
    picture?: any;
    backgroundColor?: string;
    icon?: string;
}

export function UIEmptyState({
    imageSize,
    text,
    actionText,
    action,
    picture,
    backgroundColor,
    icon,
}: EmptyStateProps) {
    const theme = useTheme();
    const styles = useStyles();
    const size = imageSize || 200;

    return (
        <View
            style={[
                {
                    flex: 1,
                    backgroundColor:
                        backgroundColor || theme.theme.colors.background,
                },
                styles.centered,
            ]}
        >
            <View style={[styles.centered, { width: '60%', marginTop: -100 }]}>
                <Image
                    source={picture || EmptyBox}
                    style={{ width: size, height: size }}
                />
                <Text style={styles.text}>{text}</Text>
                {actionText && (
                    <Button
                        type="outline"
                        title={actionText}
                        onPress={action}
                        buttonStyle={{ paddingRight: 20 }}
                        titleStyle={{ fontSize: 14 }}
                        icon={{
                            name: icon || 'plus',
                            type: 'material-community',
                            color: theme.theme.colors.primary,
                        }}
                    />
                )}
            </View>
        </View>
    );
}

const useStyles = () => {
    const theme = useTheme();
    const sharedStyles = useSharedStyles();

    return {
        ...sharedStyles,
        ...StyleSheet.create({
            image: {
                width: 75,
                height: 75,
            },
            text: {
                color: theme.theme.colors.grey3,
                fontSize: 18,
                textAlign: 'center',
                marginBottom: 25,
            },
        }),
    };
};

export default UIEmptyState;
