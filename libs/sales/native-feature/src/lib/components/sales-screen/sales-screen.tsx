import React, { useCallback, useEffect, useState } from 'react';

import { useSharedStyles } from '@pos/theme/native';
import { Dialog, useTheme } from '@rneui/themed';

import { View, StyleSheet, SafeAreaView, Alert } from 'react-native';

import { CategoryEntity } from '@pos/categories/data-access';
import CategorySelection from '../category-selection/category-selection';
import ProductSelection from '../product-selection/product-selection';
import { useDispatch, useSelector } from 'react-redux';
import {
    cartActions,
    CartItem,
    selectActiveProduct,
} from '@pos/sales/data-access';
import ProductDetails from '../product-details/product-details';
import Cart from '../cart/cart';
import { ProductEntity, productsActions, selectFilteredList } from '@pos/products/data-access';
import ProductSearch from '../product-search/product-search';
import { Button } from '@rneui/base';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ButtonItemType } from '@pos/shared/ui-native';
import { RootState } from '@pos/store';
import { Dictionary } from '@reduxjs/toolkit';
import { EACH } from '@pos/unit-of-measures/data-access';

export interface NavigationParamList {
    [key: string]: object | undefined;
    'Sales': {
        mode: 'order' | 'payment';
    }
}

/* eslint-disable-next-line */
export function SalesScreen({ navigation, route }: NativeStackScreenProps<NavigationParamList, 'Sales'>) {
    const styles = useStyles();
    const dispatch = useDispatch();
    const [category, setCategory] = useState<CategoryEntity>();
    const [filter, setFilter] = useState<string>();
    const product = useSelector(selectActiveProduct);
    const products = useSelector<RootState, Dictionary<ProductEntity> | undefined>(selectFilteredList);
    const deselectProduct = () => dispatch(cartActions.select(undefined));

    const upsertCart = (item: CartItem) => {
        dispatch(cartActions.upsert(item));
        deselectProduct();
    };

    const onCategoryChange = (c: CategoryEntity) => {
        setFilter(undefined);
        setCategory(c);
    };

    const onFilterChange = (filter: string) => {
        console.log(`Filter: ${filter}`);

        setFilter(filter);
        setCategory(undefined);
    };

    const onProductSelected = useCallback((p: ButtonItemType) => {
        const product = p as ProductEntity;
        dispatch(cartActions.select({ product, quantity: product.unitOfMeasure === EACH ? 1 : 0 }));
    }, [dispatch]);

    const confirmGoBack = () => {
        Alert.alert(
            'Are you sure?',
            'Press yes to confirm',
            [
                { text: 'No' },
                { text: 'Yes', onPress: () => navigation.goBack() },
            ]
        );
    }


    useEffect(() => {
        dispatch(productsActions.filter({ filter, categoryId: category?.id }));
    }, [dispatch, category, filter]);

    useEffect(() => {
        if (!products) return;
        
        const productIds = Object.keys(products || {});
        if (productIds.length === 1) {
            onProductSelected(products[productIds[0]] as any)
        }
    }, [onProductSelected, products]);

    return (
        <SafeAreaView style={[styles.page, styles.row]}>
            <View style={styles.categories}>
                <View>
                    <Button
                        icon={{
                            name: 'arrow-left',
                            type: 'material-community',
                            color: styles.primaryText.color,
                        }}
                        onPress={confirmGoBack}
                    />
                </View>
                <CategorySelection onSelected={onCategoryChange} />
            </View>
            <View style={styles.products}>
                <ProductSearch
                    onFilterChange={onFilterChange}
                    filter={filter}
                />
                <ProductSelection products={products} onSelected={onProductSelected} />
            </View>
            <View style={styles.cart}>
                <Cart mode={route.params.mode} />
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
                justifyContent: 'flex-start',
                flexDirection: 'column',
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
