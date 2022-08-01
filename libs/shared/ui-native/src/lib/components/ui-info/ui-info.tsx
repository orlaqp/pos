import { useSharedStyles } from '@pos/theme/native';
import React from 'react';

import { View, Text } from 'react-native';

/* eslint-disable-next-line */
export interface UIInfoProps {
    secondary?: string;
    primary?: string;
}

export function UIInfo({ secondary, primary }: UIInfoProps) {
    const styles = useSharedStyles();

    return (
        <View style={[styles.column, { flex: 1.30, marginRight: 45 }]}>
            <Text style={styles.secondaryText}>{secondary}</Text>
            <Text style={styles.primaryText}>{primary}</Text>
        </View>
    );
}

export default UIInfo;
