import React, { useEffect, useState } from 'react';

import { useSharedStyles } from '@pos/theme/native';
import { useTheme } from '@rneui/themed';

import { View, StyleSheet } from 'react-native';
import { CategorySelection } from '@pos/categories/native-feature';
import Totals from '../../components/totals/totals';

import { Storage } from 'aws-amplify';
import { CategoryEntity } from '@pos/categories/data-access';
import { useSelector } from 'react-redux';
import { ProductSelection } from '@pos/products/native-feature';

/* eslint-disable-next-line */
export interface SalesScreenProps {}

export function SalesScreen(props: SalesScreenProps) {
    const styles = useStyles();
    const [category, setCategory] = useState<CategoryEntity>();
    
    return (
        <View style={[styles.page, styles.row]}>
            <View style={styles.categories}>
                <CategorySelection onSelected={setCategory}/>
            </View>
            <View style={styles.products}>
                <ProductSelection category={category} />
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
                justifyContent: 'center'
            },
            products: {
                flex: 5,
            },
            cart: {
                flex: 2,
            },
        }),
    };
};

export default SalesScreen;
