import React, { useCallback, useEffect, useState } from 'react';

import { useSharedStyles } from '@pos/theme/native';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import { Dialog } from '@rneui/themed';

import { View, StyleSheet, Alert, TextInput } from 'react-native';

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
    MINIMUM_INVENTORY_FOR_SALE,
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
import { ButtonItemType, UICard, UIScreen } from '@pos/shared/ui-native';
import { RootState } from '@pos/store';
import { Dictionary } from '@reduxjs/toolkit';
import { getDefaultPrinter } from '@pos/printings/data-access';
import {
    payOrder,
    upsertOrder,
} from '@pos/orders/data-access';
import { selectStore } from '@pos/store-info/data-access';
import { getGlobalSettings, subscribeToGlobalSettingsChanges } from '@pos/settings/data-access';
import {
    getActiveProducts,
    getAutoAddQuantity,
    getCategoryFilteredProducts,
    getSelectedQuantity,
    getSingleProductFromDictionary,
    shouldBlockSelectionByInventory,
    shouldSetFilteredProducts,
} from './sales-screen.logic';

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
    const searchRef = React.useRef<TextInput>(null);
    const product = useSelector(selectActiveProduct);
    const products = useSelector<
        RootState,
        Dictionary<ProductEntity> | undefined
    >(selectFilteredList);
    const storeInfo = useSelector(selectStore);
    const defaultPrinter = useSelector(getDefaultPrinter);
    const allProducts = useSelector(selectAllProducts);
    const globalSettings = useSelector(getGlobalSettings);

    const [filteredProducts, setFilteredProducts] = useState<ProductEntity[]>(
        []
    );
    const deselectProduct = () => dispatch(cartActions.select(undefined));

    const upsertCart = (item: CartItem) => {
        dispatch(cartActions.upsert(item));
        deselectProduct();
    };

    const onCategoryChange = async (c?: CategoryEntity) => {
        if (!c?.id) {
            setFilteredProducts(getCategoryFilteredProducts(allProducts, c));
            return;
        }

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

        if (shouldSetFilteredProducts(text, res.allNumbers)) {
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
                        getAutoAddQuantity(p, res.quantity)
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

            if (
                shouldBlockSelectionByInventory(
                    globalSettings?.enforceSalesBasedOnInventory,
                    product.quantity,
                    MINIMUM_INVENTORY_FOR_SALE
                )
            ) {
                Alert.alert('Not Available', 'We do not have this product in inventory at the moment');
                return;
            }

            dispatch(
                cartActions.select({
                    product,
                    quantity: getSelectedQuantity(product.unitOfMeasure),
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
        const categoriesSub = subscribeToCategoryChanges(dispatch);
        const productsSub = subscribeToProductChanges(dispatch);
        const globalSettingsSub = subscribeToGlobalSettingsChanges(dispatch);
        
        return () => {
            console.log('Closing sales subscriptions');
            categoriesSub.unsubscribe();
            productsSub.unsubscribe();
            globalSettingsSub.unsubscribe();
        };
    }, [dispatch]);

    useEffect(() => {
        const selectedProduct = getSingleProductFromDictionary(products);
        if (selectedProduct) onProductSelected(selectedProduct as any);
    }, [onProductSelected, products]);

    useEffect(() => {
        setTimeout(() => {
            searchRef.current?.focus();
        }, 25);
    }, [onProductSelected, filteredProducts, allProducts, products, searchRef])

    useEffect(() => {
        setFilteredProducts(getActiveProducts(allProducts));
    }, [allProducts]);

    return (
        <UIScreen padded>
            <View style={styles.salesLayout}>
                <UICard style={styles.categoriesCard} padding="md" radius="lg" tone="muted">
                    <CategorySelection key='categorySelection' onSelected={onCategoryChange} />
                </UICard>
                <UICard style={styles.productsCard} padding="md" radius="lg">
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
                </UICard>
                <UICard style={styles.cartCard} padding="md" radius="lg" tone="muted">
                    <Cart key='cart' mode={route.params.mode} onSubmit={onCartSubmit} searchRef={searchRef} products={allProducts} />
                </UICard>
            </View>
            <Dialog
                isVisible={!!product}
                onBackdropPress={deselectProduct}
                overlayStyle={[styles.overlay, { maxWidth: 350 }]}
            >
                <ProductDetails
                    item={product!}
                    upsertCart={upsertCart}
                    enforceSalesBasedOnInventory={globalSettings?.enforceSalesBasedOnInventory} />
            </Dialog>
        </UIScreen>
    );
}

const useStyles = () => {
    const sharedStyles = useSharedStyles();
    const tokens = useDesignTokens();

    return {
        ...sharedStyles,
        ...StyleSheet.create({
            salesLayout: {
                flex: 1,
                flexDirection: 'row',
                alignItems: 'stretch',
            },
            categoriesCard: {
                width: 150,
                minWidth: 140,
                marginRight: tokens.spacing.sm,
                paddingRight: tokens.spacing.sm,
            },
            productsCard: {
                flex: 1,
                minWidth: 0,
                marginRight: tokens.spacing.sm,
            },
            cartCard: {
                width: 330,
                minWidth: 300,
            },
        }),
    };
};

export default SalesScreen;
