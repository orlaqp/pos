import React, { useCallback, useEffect, useRef, useState } from 'react';
import i18next from 'i18next';

import { useSharedStyles } from '@pos/theme/native';
import { useDesignTokens } from '@pos/theme/native/design-tokens';
import { Button, Dialog } from '@rneui/themed';

import { Animated, View, StyleSheet, Alert, Text, TextInput } from 'react-native';

import {
    CategoryEntity,
    syncCategories,
    subscribeToCategoryChanges,
} from '@pos/categories/data-access';
import CategorySelection from '../category-selection/category-selection';
import ProductSelection from '../product-selection/product-selection';
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
import ProductDetails from '../product-details/product-details';
import Cart from '../cart/cart';
import {
    ProductEntity,
    ProductService,
    selectAllProducts,
    selectProductsEntities,
    syncProducts,
    subscribeToProductChanges,
} from '@pos/products/data-access';
import { ProductSearch } from '../product-search/product-search';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ButtonItemType, UICard, UIScreen } from '@pos/shared/ui-native';
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
    const styles = useStyles();
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
    const t = (key: string, fallback: string) =>
        i18next.isInitialized && i18next.exists(key)
            ? String(i18next.t(key))
            : fallback;
    const hasCatalogProducts = getActiveProducts(allProducts).length > 0;
    const canManageCatalog = !!employee?.roles?.includes(Role.Admin);
    const categoryWidth = useRef(new Animated.Value(showCategories ? 150 : 0)).current;
    const categoryOpacity = useRef(new Animated.Value(showCategories ? 1 : 0)).current;
    const contentOpacity = useRef(new Animated.Value(1)).current;
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
                cartActions.select({
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
                cartActions.select({
                    product,
                    quantity: getSelectedQuantity(product.unitOfMeasure),
                })
            );
        },
        [dispatch, globalSettings]
    );

    const onCartSubmit = (cart: CartState, payments?: CartPayment[]) => {
        Alert.alert(
            t('SALES_ConfirmTitle', 'Are you sure?'),
            t('SALES_ConfirmMessage', 'Press yes to confirm'),
            [
            { text: t('SALES_No', 'No') },
            {
                text: t('SALES_Yes', 'Yes'),
                onPress: () => {
                    if (route.params.mode === 'order') {
                        dispatch(
                            upsertOrder({ cart, defaultPrinter, storeInfo })
                        );
                    } else {
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
                        navigation.goBack();
                    }
                    dispatch(cartActions.reset());
                    return;
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
                <Animated.View
                    style={[
                        styles.categoriesCardWrap,
                        {
                            width: categoryWidth,
                            opacity: categoryOpacity,
                            marginRight: showCategories ? tokens.spacing.sm : 0,
                        },
                    ]}
                >
                    <View style={styles.categoriesCard}>
                        {showCategories ? (
                            <CategorySelection
                                key="categorySelection"
                                onSelected={onCategoryChange}
                            />
                        ) : null}
                    </View>
                </Animated.View>
                <UICard style={styles.productsCard} padding="md" radius="lg">
                    <View style={styles.productsHeader}>
                        <View>
                            <Text style={styles.sectionTitle}>Products</Text>
                            <Text style={styles.sectionSubtitle}>
                                {showCategories
                                    ? 'Browse by category or search the catalog.'
                                    : 'Search the catalog or show categories again.'}
                            </Text>
                        </View>
                        <Button
                            testID="sales-toggle-categories"
                            type="clear"
                            title={showCategories ? 'Hide categories' : 'Show categories'}
                            onPress={() => setShowCategories((current) => !current)}
                            icon={{
                                name: showCategories ? 'dock-right' : 'dock-left',
                                type: 'material-community',
                                color: tokens.colors.accent,
                                size: 18,
                            }}
                            titleStyle={styles.toggleTitle}
                            buttonStyle={styles.toggleButton}
                        />
                    </View>

                    <Animated.View style={{ flex: 1, opacity: contentOpacity }}>
                    {hasCatalogProducts ? (
                        <>
                            <ProductSearch
                                key="productSearch"
                                ref={searchRef}
                                onFilterChange={onFilterChange}
                            />
                            <ProductSelection
                                key="productSelection"
                                products={filteredProducts}
                                onSelected={onProductSelected}
                                onLongPress={onProductLongPress}
                            />
                        </>
                    ) : (
                        <View style={styles.emptyCatalogWrap}>
                            <Text style={styles.emptyTitle}>No products yet</Text>
                            <Text style={styles.emptySubtitle}>
                                Add your first category or product in Back Office before using sales search.
                            </Text>
                            {canManageCatalog ? (
                                <View style={styles.emptyActions}>
                                    <Button
                                        testID="sales-empty-add-category"
                                        title="Add category"
                                        onPress={() =>
                                            openBackOfficeForm('Categories', 'Category Form')
                                        }
                                        buttonStyle={styles.primaryAction}
                                        titleStyle={styles.primaryActionTitle}
                                        icon={{
                                            name: 'shape-outline',
                                            type: 'material-community',
                                            color: '#ffffff',
                                            size: 18,
                                        }}
                                    />
                                    <Button
                                        testID="sales-empty-add-product"
                                        title="Add product"
                                        type="outline"
                                        onPress={() =>
                                            openBackOfficeForm('Products', 'Product Form')
                                        }
                                        buttonStyle={styles.secondaryAction}
                                        titleStyle={styles.secondaryActionTitle}
                                        icon={{
                                            name: 'plus-box-outline',
                                            type: 'material-community',
                                            color: tokens.colors.accent,
                                            size: 18,
                                        }}
                                    />
                                </View>
                            ) : null}
                        </View>
                    )}
                    </Animated.View>
                </UICard>
                <UICard style={styles.cartCard} padding="md" radius="lg" tone="muted">
                    <Cart key='cart' mode={route.params.mode} onSubmit={onCartSubmit} searchRef={searchRef} products={allProducts} />
                </UICard>
            </View>
            <Dialog
                isVisible={!!product}
                onBackdropPress={deselectProduct}
                supportedOrientations={['landscape']}
                presentationStyle="fullScreen"
                overlayStyle={[styles.overlay, { maxWidth: 560, width: '88%' }]}
            >
                {product ? (
                    <ProductDetails
                        item={product}
                        upsertCart={upsertCart}
                        enforceSalesBasedOnInventory={globalSettings?.enforceSalesBasedOnInventory}
                    />
                ) : null}
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
            categoriesCardWrap: {
                overflow: 'hidden',
                flexShrink: 0,
            },
            categoriesCard: {
                flex: 1,
                overflow: 'hidden',
            },
            productsCard: {
                flex: 1,
                minWidth: 0,
                marginRight: tokens.spacing.sm,
            },
            productsHeader: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: tokens.spacing.sm,
            },
            sectionTitle: {
                color: tokens.colors.textPrimary,
                fontSize: 20,
                fontWeight: '700',
                marginBottom: 4,
            },
            sectionSubtitle: {
                color: tokens.colors.textSecondary,
                fontSize: 13,
                maxWidth: 360,
            },
            toggleButton: {
                borderRadius: tokens.radii.xl,
                paddingHorizontal: tokens.spacing.sm,
                minHeight: 36,
            },
            toggleTitle: {
                color: tokens.colors.accent,
                fontSize: 13,
                fontWeight: '700',
                marginLeft: 6,
            },
            emptyCatalogWrap: {
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: tokens.spacing.xl,
                paddingBottom: tokens.spacing.lg,
            },
            emptyTitle: {
                color: tokens.colors.textPrimary,
                fontSize: 24,
                fontWeight: '700',
                marginBottom: tokens.spacing.xs,
            },
            emptySubtitle: {
                color: tokens.colors.textSecondary,
                fontSize: 15,
                lineHeight: 22,
                textAlign: 'center',
                maxWidth: 420,
                marginBottom: tokens.spacing.lg,
            },
            emptyActions: {
                flexDirection: 'row',
                gap: tokens.spacing.sm,
            },
            primaryAction: {
                backgroundColor: tokens.colors.accent,
                borderRadius: tokens.radii.xl,
                paddingHorizontal: tokens.spacing.md,
                minHeight: 46,
            },
            primaryActionTitle: {
                color: '#ffffff',
                fontWeight: '700',
                marginLeft: 8,
            },
            secondaryAction: {
                borderRadius: tokens.radii.xl,
                borderColor: tokens.colors.accent,
                paddingHorizontal: tokens.spacing.md,
                minHeight: 46,
            },
            secondaryActionTitle: {
                color: tokens.colors.accent,
                fontWeight: '700',
                marginLeft: 8,
            },
            cartCard: {
                width: 330,
                minWidth: 300,
            },
        }),
    };
};

export default SalesScreen;
