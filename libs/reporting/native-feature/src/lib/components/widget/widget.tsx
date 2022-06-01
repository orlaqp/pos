import { useSharedStyles } from '@pos/theme/native';
import { Icon, useTheme } from '@rneui/themed';
import React from 'react';

import { View, Text } from 'react-native';

export interface WidgetProps {
    icon: string;
    text: string;
    value: string;
    primaryTextColor?: string;
    secondaryTextColor?: string;
    backgroundColor?: string;
}

export function Widget({
    icon,
    text,
    value,
    primaryTextColor,
    backgroundColor,
}: WidgetProps) {
    const theme = useTheme();
    const styles = useSharedStyles();

    const primaryColor =
        primaryTextColor ||
        (theme.theme.mode === 'dark'
            ? theme.theme.colors.black
            : theme.theme.colors.grey5);
    const backgroundC = backgroundColor || styles.dataRow.backgroundColor;

    return (
        <View
            style={{
                ...styles.smallMargin,
                backgroundColor: backgroundC,
                borderRadius: 5,
                height: 130,
                flexDirection: 'column',
                padding: 20,
            }}
        >
            <View style={{ alignSelf: 'flex-end' }}>
                <Icon
                    name={icon}
                    type="material-community"
                    size={28}
                    color={primaryColor}
                />
            </View>
            <View style={{ alignSelf: 'center', marginLeft: 10 }}>
                <Text style={{ fontSize: 28, color: primaryColor }}>
                    {value}
                </Text>
            </View>
            <View style={{ alignSelf: 'center', marginLeft: 10 }}>
                <Text
                    style={[
                        styles.secondaryText,
                        { fontSize: 14, color: `${primaryColor}aa` },
                    ]}
                >
                    {text}
                </Text>
            </View>
        </View>
    );
}

export default Widget;
