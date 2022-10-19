import React, { useCallback, useEffect, useState } from 'react';

import { useSharedStyles } from '@pos/theme/native';
import { Dialog } from '@rneui/themed';

import { View, StyleSheet, SafeAreaView, Alert, TextInput } from 'react-native';

import {
    CategoryEntity,
    subscribeToCategoryChanges,
} from '@pos/categories/data-access';
import CategorySelection from '../category-selection/category-selection';
import ProductSelection from '../product-selection/product-selection';
import { useDispatch, useSelector } from 'react-redux';
import {
    cartActions,
    CartItem,
    CartItemMapper,
    CartPayment,
    CartState,
    selectActiveProduct,
} from '@pos/sales/data-access';
import ProductDetails from '../product-details/product-details';
import Cart from '../cart/cart';
import {
    ProductEntity,
    ProductService,
    selectAllProducts,
    selectFilteredList,
    subscribeToProductChanges,
} from '@pos/products/data-access';
import { ProductSearch } from '../product-search/product-search';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ButtonItemType } from '@pos/shared/ui-native';
import { RootState } from '@pos/store';
import { Dictionary } from '@reduxjs/toolkit';
import { EACH } from '@pos/unit-of-measures/data-access';
import { getDefaultPrinter } from '@pos/printings/data-access';
import {
    payOrder,
    upsertOrder,
} from '@pos/orders/data-access';
import { selectStore } from '@pos/store-info/data-access';

export interface NavigationParamList {
    [key: string]: object | undefined;
    Sales: {
        mode: 'order' | 'payment';
    };
    'Inventory Count Form': {
        readOnly: boolean;
    };
    'Inventory Receive Form': {
        readOnly: boolean;
    };
}

/* eslint-disable-next-line */
export function SalesScreen({
    navigation,
    route,
}: NativeStackScreenProps<NavigationParamList, 'Sales'>) {
    const styles = useStyles();
    const dispatch = useDispatch();
    const searchRef = React.createRef<TextInput>();
    const product = useSelector(selectActiveProduct);
    const products = useSelector<
        RootState,
        Dictionary<ProductEntity> | undefined
    >(selectFilteredList);
    const storeInfo = useSelector(selectStore);
    const defaultPrinter = useSelector(getDefaultPrinter);
    const allProducts = useSelector(selectAllProducts);
    const [filteredProducts, setFilteredProducts] = useState<ProductEntity[]>(
        []
    );
    const deselectProduct = () => dispatch(cartActions.select(undefined));

    const upsertCart = (item: CartItem) => {
        dispatch(cartActions.upsert(item));
        deselectProduct();
    };

    const onCategoryChange = async (c: CategoryEntity) => {
        const res = await ProductService.search(allProducts, {
            categoryId: c.id,
            onlyActive: true
        });
        setFilteredProducts(res.items);
    };

    const onFilterChange = async (text: string) => {
        if (!text) return;

        searchRef.current?.focus();
        const res = await ProductService.search(allProducts, { text, onlyActive: true });

        if (!res.allNumbers || (res.allNumbers && text.length < 4)) {
            setFilteredProducts(res.items);
            // return text;
        }

        if (res.items.length === 1 && res.allNumbers) {
            // searchRef.current?.clear();

            const p = res.items[0];
            // add product to cart directly
            dispatch(
                cartActions.upsert(
                    CartItemMapper.fromProduct(
                        p,
                        res.quantity || (p.unitOfMeasure === EACH ? 1 : 0)
                    )
                )
            );
        }

        searchRef.current?.clear();
        return '';
    };

    const onProductSelected = useCallback(
        (p: ButtonItemType) => {
            const product = p as ProductEntity;
            dispatch(
                cartActions.select({
                    product,
                    quantity: product.unitOfMeasure === EACH ? 1 : 0,
                })
            );
        },
        [dispatch]
    );

    const onCartSubmit = (cart: CartState, payments?: CartPayment[]) => {
        Alert.alert('Are you sure?', 'Press yes to confirm', [
            { text: 'No' },
            {
                text: 'Yes',
                onPress: () => {
                    if (route.params.mode === 'order') {
                        dispatch(
                            upsertOrder({ cart, defaultPrinter, storeInfo })
                        );
                    } else {
                        if (!payments) {
                            Alert.alert('An order cannot be marked as paid without payment information');
                            return;
                        }
                        
                        dispatch(payOrder({ cart, payments, defaultPrinter, storeInfo }));
                        navigation.goBack();
                    }
                    dispatch(cartActions.reset());
                    return;
                },
            },
        ]);
    };

    useEffect(() => {
        searchRef.current?.focus();
    });

    useEffect(() => {
        const categoriesSub = subscribeToCategoryChanges(dispatch);
        const productsSub = subscribeToProductChanges(dispatch);
        // const ordersSub = subscribeToOrderChanges(dispatch);
        return () => {
            console.log('Closing sales subscriptions');
            categoriesSub.unsubscribe();
            productsSub.unsubscribe();
            // ordersSub.unsubscribe();
        };
    }, [dispatch]);

    useEffect(() => {
        if (!products) return;

        const productIds = Object.keys(products || {});
        if (productIds.length === 1) {
            onProductSelected(products[productIds[0]] as any);
        }
    }, [onProductSelected, products]);

    useEffect(() => {
        setTimeout(() => {
            searchRef.current?.focus();
        }, 25);
    }, [onProductSelected, filteredProducts, allProducts, products, searchRef])

    return (
        <SafeAreaView style={[styles.page, styles.row]}>
            <View style={styles.categories}>
                <CategorySelection key='categorySelection' onSelected={onCategoryChange} />
            </View>
            <View style={styles.products}>
                <ProductSearch
                    key='productSearch'
                    ref={searchRef}
                    onFilterChange={onFilterChange}
                />
                <ProductSelection
                    key='productSelection'
                    products={filteredProducts}
                    onSelected={onProductSelected}
                />
            </View>
            <View style={styles.cart}>
                <Cart key='cart' mode={route.params.mode} onSubmit={onCartSubmit} searchRef={searchRef} />
            </View>
            <Dialog
                isVisible={!!product}
                onBackdropPress={deselectProduct}
                overlayStyle={[styles.overlay, { maxWidth: 350 }]}
            >
                <ProductDetails item={product!} upsertCart={upsertCart} />
            </Dialog>
        </SafeAreaView>
    );
}

const useStyles = () => {
    const sharedStyles = useSharedStyles();

    return {
        ...sharedStyles,
        ...StyleSheet.create({
            categories: {
                flex: 0.7,
                justifyContent: 'flex-start',
                flexDirection: 'column',
            },
            products: {
                ...sharedStyles.darkBackground,
                flex: 5,
                height: '96%',
                flexDirection: 'column',
                marginHorizontal: 10,
            },
            cart: {
                flex: 2,
                flexDirection: 'column',
                ...sharedStyles.darkBackground,
            },
        }),
    };
};

export default SalesScreen;
