import React, { useState } from 'react';

import { theme, useSharedStyles } from '@pos/theme/native';
import { Dialog, useTheme } from '@rneui/themed';

import { View, StyleSheet, SafeAreaView } from 'react-native';

import { CategoryEntity } from '@pos/categories/data-access';
import CategorySelection from '../category-selection/category-selection';
import ProductSelection from '../product-selection/product-selection';
import { useDispatch, useSelector } from 'react-redux';
import { cartActions, CartItem, selectActiveProduct } from '@pos/sales/data-access';
import ProductDetails from '../product-details/product-details';
import Cart from '../cart/cart';
import { ProductEntity } from '@pos/products/data-access';

/* eslint-disable-next-line */
export interface SalesScreenProps {}

export function SalesScreen(props: SalesScreenProps) {
    const styles = useStyles();
    const dispatch = useDispatch();
    const [category, setCategory] = useState<CategoryEntity>();
    const product = useSelector(selectActiveProduct);
    const deselectProduct = () => dispatch(cartActions.select(undefined));

    const upsertCart = (item: CartItem) => {
        dispatch(cartActions.upsert(item));
        deselectProduct();
    };

    return (
        <SafeAreaView style={[styles.page, styles.row]}>
            <View style={styles.categories}>
                <CategorySelection onSelected={setCategory} />
            </View>
            <View style={styles.products}>
                <ProductSelection category={category} />
            </View>
            <View style={styles.cart}>
                <Cart />
            </View>
            <Dialog
                isVisible={!!product}
                onBackdropPress={deselectProduct}
                overlayStyle={styles.overlay}
            >
                <ProductDetails item={product!} upsertCart={upsertCart} />
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
                maxWidth: 350,
                backgroundColor: theme.theme.colors.searchBg,
                borderRadius: 5,
            },
            categories: {
                flex: 0.7,
                justifyContent: 'center',
                ...sharedStyles.darkBackground,
            },
            products: {
                ...sharedStyles.darkBackground,
                flex: 5,
                flexDirection: 'column',
                marginHorizontal: 10,
            },
            cart: {
                flex: 2,
                flexDirection: 'column',
                // borderColor: 'yellow',
                // borderWidth: 4
            },
        }),
    };
};

export default SalesScreen;
