import { useSharedStyles } from '@pos/theme/native';
import { Icon, useTheme } from '@rneui/themed';
import React from 'react';

import { View, Text, type DimensionValue } from 'react-native';

export interface WidgetProps {
    icon?: string;
    text: string;
    value: string;
    height?: DimensionValue;
    primaryTextColor?: string;
    secondaryTextColor?: string;
    primaryTextSize?: number;
    secondaryTextSize?: number;
    backgroundColor?: string;
}

export function Widget({
    icon,
    text,
    value,
    height,
    primaryTextColor,
    backgroundColor,
    primaryTextSize,
    secondaryTextSize,
}: WidgetProps) {
    const theme = useTheme();
    const styles = useSharedStyles();
    const compact = typeof height === 'number' && height <= 90;

    const primaryColor =
        primaryTextColor ||
        (theme.theme.mode === 'dark'
            ? theme.theme.colors.black
            : theme.theme.colors.grey5);
    const backgroundC = backgroundColor || styles.dataRow.backgroundColor;

    return (
        <View
            style={{
                backgroundColor: backgroundC,
                borderColor: `${primaryColor}22`,
                borderRadius: compact ? 18 : 24,
                borderWidth: 1,
                height: height || 130,
                flexDirection: 'column',
                justifyContent: 'space-between',
                margin: compact ? 6 : 10,
                overflow: 'hidden',
                paddingHorizontal: compact ? 14 : 18,
                paddingVertical: compact ? 12 : 16,
            }}
        >
            <View
                style={{
                    alignSelf: 'flex-end',
                    alignItems: 'center',
                    backgroundColor: icon ? `${primaryColor}12` : 'transparent',
                    borderColor: `${primaryColor}22`,
                    borderRadius: 999,
                    borderWidth: icon ? 1 : 0,
                    height: icon ? (compact ? 28 : 34) : 0,
                    justifyContent: 'center',
                    width: icon ? (compact ? 28 : 34) : 0,
                }}
            >
                { icon &&
                <Icon
                    name={icon}
                    type="material-community"
                    size={compact ? 17 : 21}
                    color={primaryColor}
                />
                }
            </View>
            <View style={{ alignSelf: 'stretch' }}>
                <Text
                    adjustsFontSizeToFit
                    minimumFontScale={0.7}
                    numberOfLines={2}
                    style={{
                        fontSize: primaryTextSize || (compact ? 18 : 28),
                        fontWeight: '700',
                        letterSpacing: compact ? 0 : -0.4,
                        color: primaryColor,
                        textAlign: 'center',
                    }}
                >
                    {value}
                </Text>
            </View>
            <View style={{ alignSelf: 'stretch' }}>
                <Text
                    numberOfLines={1}
                    style={[
                        styles.secondaryText,
                        {
                            fontSize: secondaryTextSize || (compact ? 12 : 14),
                            fontWeight: '700',
                            letterSpacing: compact ? 0.4 : 0.2,
                            color: `${primaryColor}aa`,
                            textAlign: 'center',
                            textTransform: compact ? 'uppercase' : 'none',
                        },
                    ]}
                >
                    {text}
                </Text>
            </View>
        </View>
    );
}

export default Widget;
