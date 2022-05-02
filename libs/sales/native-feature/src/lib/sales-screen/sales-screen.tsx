import { useSharedStyles } from '@pos/theme/native';
import { Divider, useTheme } from '@rneui/themed';
import React from 'react';

import { View, Text, StyleSheet } from 'react-native';
import { CategorySelection } from '@pos/categories/native-feature';
import { ProductSelection } from '@pos/products/native-feature';
import Totals from '../../components/totals/totals';

/* eslint-disable-next-line */
export interface SalesScreenProps {}

export function SalesScreen(props: SalesScreenProps) {
    const styles = useStyles();
  return (
    <View style={[styles.page, styles.row]}>
        <View style={styles.categories}>
            <CategorySelection />
        </View>
        <View style={styles.products}>
            <ProductSelection />
        </View>
        <View style={styles.cart}>
            <Totals />
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
            categories: {
                flex: 1,
                borderRightWidth: 1,
                borderRightColor: theme.theme.colors.divider,
            },
            products: {
                flex: 3
            },
            cart: {
                flex: 1.5
            },
        })
    }
} 

export default SalesScreen;
