import React, { useState } from 'react';

import { theme, useSharedStyles } from '@pos/theme/native';
import { Dialog, useTheme } from '@rneui/themed';

import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import Totals from '../totals/totals';

import { CategoryEntity } from '@pos/categories/data-access';
import CategorySelection from '../category-selection/category-selection';
import ProductSelection from '../product-selection/product-selection';
import { useDispatch, useSelector } from 'react-redux';
import { cartActions, selectActiveProduct } from '@pos/sales/data-access';
import ProductDetails from '../product-details/product-details';

/* eslint-disable-next-line */
export interface SalesScreenProps {}

export function SalesScreen(props: SalesScreenProps) {
    const styles = useStyles();
    const dispatch = useDispatch();
    const [category, setCategory] = useState<CategoryEntity>();
    const product = useSelector(selectActiveProduct);
    const deselectProduct = () => dispatch(cartActions.select(undefined));

    return (
        <SafeAreaView style={[styles.page, styles.row]}>
            <View style={styles.categories}>
                <CategorySelection onSelected={setCategory} />
            </View>
            <View style={styles.products}>
                <ProductSelection category={category} />
            </View>
            <View style={styles.cart}>
                <Totals />
            </View>
            <Dialog
                isVisible={!!product}
                onBackdropPress={deselectProduct}
                overlayStyle={styles.overlay}
            >
                <ProductDetails product={product!} />
            </Dialog>
        </SafeAreaView>
    );
}

const useStyles = () => {
    const theme = useTheme();
    const sharedStyles = useSharedStyles();

    return {
        ...sharedStyles,
        ...StyleSheet.create({
            overlay: {
                maxWidth: 500,
                backgroundColor: theme.theme.colors.searchBg,
            },
            categories: {
                flex: 0.7,
                justifyContent: 'center',
            },
            products: {
                flex: 5,
                flexDirection: 'column',
            },
            cart: {
                flex: 2,
            },
        }),
    };
};

export default SalesScreen;
