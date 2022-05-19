import { useSharedStyles } from '@pos/theme/native';
import React from 'react';

import { View, Text } from 'react-native';

/* eslint-disable-next-line */
export interface StoreInfoFormProps {}

export function StoreInfoForm(props: StoreInfoFormProps) {
    const styles = useSharedStyles();
    return (
        <View style={styles.page}>
            <Text style={{ color: 'white' }}>Welcome to store-info-form!</Text>
        </View>
    );
}

export default StoreInfoForm;
