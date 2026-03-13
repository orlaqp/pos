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
    const colors = theme?.theme?.colors || {
        primary: '#4aa3eb',
        black: '#ffffff',
        error: '#ef4444',
        success: '#34c759',
        grey1: '#dddddd',
    };
    switch (type) {
        case 'info':
            return [colors.primary, colors.black]
        case 'error':
            return [colors.error, colors.grey1]
        case 'success':
            return [colors.success, colors.grey1]
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
