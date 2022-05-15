import { useTheme } from '@rneui/themed';
import React from 'react';

import { View, Text } from 'react-native';

export type LabelType = 'info' | 'error' | 'success';

/* eslint-disable-next-line */
export interface UiLabelProps {
    type: LabelType;
    text?: string;
    fontSize?: number;
}

const getColors = (type: LabelType, theme: any) => {
    switch (type) {
        case 'info':
            return [theme.theme.colors.primary, theme.theme.colors.black]
        case 'error':
            return [theme.theme.colors.error, theme.theme.colors.grey1]
        case 'success':
            return [theme.theme.colors.success, theme.theme.colors.grey1]
        default:
            return [];
    }
}

export function UILabel({ type, text, fontSize }: UiLabelProps) {
    const theme = useTheme();
    const [backgroundColor, color] = getColors(type, theme);
    
    return (
        <View style={{ margin: 5, padding: 4, borderRadius: 4, backgroundColor }}>
            <Text style={{ color, fontSize: fontSize || 12 }}>{ text }</Text>
        </View>
    );
}
