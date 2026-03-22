import React, { useCallback, useEffect, useState } from 'react';
import i18next from 'i18next';

import { useDesignTokens } from '@pos/theme/native/design-tokens';

import { Animated, View, Alert, TextInput } from 'react-native';

import {
    CategoryEntity,
    syncCategories,
    subscribeToCategoryChanges,
} from '@pos/categories/data-access';
import { useSelector } from 'react-redux';
import {
    cartActions,
    CartItem,
    CartItemMapper,
    CartPayment,
    CartState,
    MINIMUM_INVENTORY_FOR_SALE,
    selectActiveProduct,
} from '@pos/sales/data-access';
import Cart from '../cart/cart';
import {
    ProductEntity,
    ProductService,
    selectAllProducts,
    selectProductsEntities,
    syncProducts,
    subscribeToProductChanges,
} from '@pos/products/data-access';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ButtonItemType, UIScreen } from '@pos/shared/ui-native';
import { RootState, useAppDispatch } from '@pos/store';
import { getDefaultPrinter } from '@pos/printings/data-access';
import {
    payOrder,
    upsertOrder,
} from '@pos/orders/data-access';
import { selectStore } from '@pos/store-info/data-access';
import { getGlobalSettings, subscribeToGlobalSettingsChanges } from '@pos/settings/data-access';
import { Role } from '@pos/auth/data-access';
import { selectLoginEmployee } from '@pos/employees/data-access';
import { EACH } from '@pos/unit-of-measures/data-access';
import {
    getActiveProducts,
    getAutoAddQuantity,
    getCategoryFilteredProducts,
    getSelectedQuantity,
    isSameProductList,
    getSingleProductFromDictionary,
    shouldBlockSelectionByInventory,
    shouldSetFilteredProducts,
} from './sales-screen.logic';
import { useSalesScreenStyles } from './sales-screen.styles';
import { SalesCatalogPane } from './sales-catalog-pane';
import { SalesProductDialog } from './sales-product-dialog';

export interface NavigationParamList {
    [key: string]: object | undefined;
    BackOffice: {
        initialScreen?: 'Dashboard' | 'Products' | 'Categories';
        initialScreenParams?: {
            initialRouteName?: string;
        };
    };
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
    const styles = useSalesScreenStyles();
    const tokens = useDesignTokens();
    const dispatch = useAppDispatch();
    const searchRef = React.useRef<TextInput>(null);
    const product = useSelector(selectActiveProduct);
    const products = useSelector<
        RootState,
        Record<string, ProductEntity | undefined> | undefined
    >(selectProductsEntities);
    const storeInfo = useSelector(selectStore);
    const defaultPrinter = useSelector(getDefaultPrinter);
    const allProducts = useSelector(selectAllProducts);
    const globalSettings = useSelector(getGlobalSettings);
    const employee = useSelector(selectLoginEmployee);

    const [filteredProducts, setFilteredProducts] = useState<ProductEntity[]>(
        []
    );
    const [showCategories, setShowCategories] = useState(true);
    const [categoryWidth] = useState(() => new Animated.Value(150));
    const [categoryOpacity] = useState(() => new Animated.Value(1));
    const [contentOpacity] = useState(() => new Animated.Value(1));
    const t = (key: string, fallback: string) =>
        i18next.isInitialized && i18next.exists(key)
            ? String(i18next.t(key))
            : fallback;
    const hasCatalogProducts = getActiveProducts(allProducts).length > 0;
    const canManageCatalog = !!employee?.roles?.includes(Role.Admin);
    const deselectProduct = () => dispatch(cartActions.setActiveProduct(undefined));
    const shouldReturnToOrderList = () =>
        navigation.getState?.()?.routeNames?.includes('Order List');

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
                Alert.alert(
                    t('SALES_NotAvailableTitle', 'Not Available'),
                    t(
                        'SALES_NotAvailableMessage',
                        'We do not have this product in inventory at the moment'
                    )
                );
                return;
            }

            if (product.unitOfMeasure?.toLowerCase() === EACH) {
                dispatch(cartActions.upsert(CartItemMapper.fromProduct(product, 1)));
                return;
            }

            dispatch(
                cartActions.setActiveProduct({
                    product,
                    quantity: getSelectedQuantity(product.unitOfMeasure),
                })
            );
        },
        [dispatch, globalSettings]
    );

    const onProductLongPress = useCallback(
        (p: ButtonItemType) => {
            const product = p as ProductEntity;

            if (
                shouldBlockSelectionByInventory(
                    globalSettings?.enforceSalesBasedOnInventory,
                    product.quantity,
                    MINIMUM_INVENTORY_FOR_SALE
                )
            ) {
                Alert.alert(
                    t('SALES_NotAvailableTitle', 'Not Available'),
                    t(
                        'SALES_NotAvailableMessage',
                        'We do not have this product in inventory at the moment'
                    )
                );
                return;
            }

            dispatch(
                cartActions.setActiveProduct({
                    product,
                    quantity: getSelectedQuantity(product.unitOfMeasure),
                })
            );
        },
        [dispatch, globalSettings]
    );

    const onCartSubmit = (cart: CartState, payments?: CartPayment[]) => {
        if (route.params.mode === 'order') {
            dispatch(upsertOrder({ cart, defaultPrinter, storeInfo }));
            dispatch(cartActions.reset());
            return;
        }

        Alert.alert(
            t('SALES_ConfirmTitle', 'Are you sure?'),
            t('SALES_ConfirmMessage', 'Press yes to confirm'),
            [
                { text: t('SALES_No', 'No') },
                {
                    text: t('SALES_Yes', 'Yes'),
                    onPress: () => {
                        if (!payments) {
                            Alert.alert(
                                t(
                                    'SALES_PaymentRequiredMessage',
                                    'An order cannot be marked as paid without payment information'
                                )
                            );
                            return;
                        }

                        dispatch(payOrder({ cart, payments, defaultPrinter, storeInfo }));
                        if (shouldReturnToOrderList()) {
                            navigation.navigate('Order List' as never);
                        } else {
                            navigation.goBack();
                        }
                        dispatch(cartActions.reset());
                    },
                },
            ]
        );
    };

    useEffect(() => {
        syncCategories(dispatch);
        syncProducts(dispatch);
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
        if (selectedProduct) onProductSelected(selectedProduct);
    }, [onProductSelected, products]);

    useEffect(() => {
        if (!hasCatalogProducts) return;

        setTimeout(() => {
            searchRef.current?.focus();
        }, 25);
    }, [hasCatalogProducts, onProductSelected, filteredProducts, allProducts, products, searchRef])

    useEffect(() => {
        const nextProducts = getActiveProducts(allProducts);
        // Keep the filtered view aligned with source catalog updates without
        // overwriting active search/category selections when the list is unchanged.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFilteredProducts((current) =>
            isSameProductList(current, nextProducts) ? current : nextProducts
        );
    }, [allProducts]);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(categoryWidth, {
                toValue: showCategories ? 150 : 0,
                duration: 220,
                useNativeDriver: false,
            }),
            Animated.timing(categoryOpacity, {
                toValue: showCategories ? 1 : 0,
                duration: 180,
                useNativeDriver: false,
            }),
        ]).start();
    }, [categoryOpacity, categoryWidth, showCategories]);

    useEffect(() => {
        contentOpacity.setValue(0.6);
        Animated.timing(contentOpacity, {
            toValue: 1,
            duration: 180,
            useNativeDriver: true,
        }).start();
    }, [contentOpacity, filteredProducts.length, hasCatalogProducts, showCategories]);

    const openBackOfficeForm = useCallback(
        (screen: 'Products' | 'Categories', initialRouteName: string) => {
            navigation.navigate('BackOffice', {
                initialScreen: screen,
                initialScreenParams: {
                    initialRouteName,
                },
            });
        },
        [navigation]
    );

    return (
        <UIScreen padded>
            <View style={styles.salesLayout}>
                <SalesCatalogPane
                    styles={styles}
                    accentColor={tokens.colors.accent}
                    showCategories={showCategories}
                    hasCatalogProducts={hasCatalogProducts}
                    canManageCatalog={canManageCatalog}
                    filteredProducts={filteredProducts}
                    categoryWidth={categoryWidth}
                    categoryOpacity={categoryOpacity}
                    contentOpacity={contentOpacity}
                    searchRef={searchRef}
                    onCategoryChange={onCategoryChange}
                    onToggleCategories={() => setShowCategories((current) => !current)}
                    onFilterChange={onFilterChange}
                    onProductSelected={onProductSelected}
                    onProductLongPress={onProductLongPress}
                    onOpenBackOfficeForm={openBackOfficeForm}
                />
                <View style={styles.cartPanel}>
                    <Cart
                        key="cart"
                        mode={route.params.mode}
                        onSubmit={onCartSubmit}
                        searchRef={searchRef}
                        products={allProducts}
                    />
                </View>
            </View>
            <SalesProductDialog
                product={product}
                overlayStyle={[styles.overlay, { maxWidth: 560, width: '88%' }]}
                enforceSalesBasedOnInventory={globalSettings?.enforceSalesBasedOnInventory}
                onClose={deselectProduct}
                onUpsertCart={upsertCart}
            />
        </UIScreen>
    );
}

export default SalesScreen;
