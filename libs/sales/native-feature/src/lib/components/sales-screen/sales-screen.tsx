import React, { useCallback, useEffect, useState } from 'react';
import i18next from 'i18next';

import { useDesignTokens } from '@pos/theme/native/design-tokens';

import { Animated, View, Alert, InteractionManager, TextInput } from 'react-native';

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
import { getDefaultPrinter, printReceipt } from '@pos/printings/data-access';
import {
    buildEbtAllocations,
    getLineTotal,
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

const printReceiptSafely = (...args: Parameters<typeof printReceipt>) => {
    if (typeof printReceipt !== 'function') {
        return undefined;
    }

    return printReceipt(...args);
};

const buildEbtAllocationsSafely = (
    ...args: Parameters<typeof buildEbtAllocations>
) => {
    if (typeof buildEbtAllocations !== 'function') {
        return {} as ReturnType<typeof buildEbtAllocations>;
    }

    return buildEbtAllocations(...args);
};

const getLineTotalSafely = (quantity: number, price: number) => {
    if (typeof getLineTotal !== 'function') {
        return +(quantity * price).toFixed(2);
    }

    return getLineTotal(quantity, price);
};

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
        if (!text?.trim()) {
            setFilteredProducts(getActiveProducts(allProducts));
            return '';
        }

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
        const cartItems = cart.items ?? [];

        if (route.params.mode === 'order') {
            if (defaultPrinter && storeInfo && (cart.orderNo || cart.id)) {
                void printReceiptSafely(storeInfo, defaultPrinter, cart, {
                    id: cart.id,
                    status: 'OPEN',
                    orderNo: cart.orderNo,
                    copyType: 'CUSTOMER',
                    lines: cartItems.map((item) => ({
                        quantity: item.quantity,
                        productName: item.product.name,
                    })),
                });
                dispatch(
                    upsertOrder({
                        cart,
                        defaultPrinter,
                        storeInfo,
                        skipAutoPrint: true,
                    })
                );
            } else {
                dispatch(upsertOrder({ cart, defaultPrinter, storeInfo }));
            }
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
                    onPress: async () => {
                        if (!payments) {
                            Alert.alert(
                                t(
                                    'SALES_PaymentRequiredMessage',
                                    'An order cannot be marked as paid without payment information'
                                )
                            );
                            return;
                        }

                        let didStartFastPrint = false;

                        if (defaultPrinter && storeInfo) {
                            try {
                                const allocations = buildEbtAllocationsSafely(
                                    cartItems.map((item) => ({
                                        identifier: item.identifier,
                                        quantity: item.quantity,
                                        price: item.product.price,
                                        isEBTEligible:
                                            item.product.isEBTEligible ?? false,
                                    })),
                                    payments
                                );

                                await printReceiptSafely(
                                    storeInfo,
                                    defaultPrinter,
                                    cart,
                                    {
                                        id: cart.id,
                                        status: 'PAID',
                                        orderNo: cart.orderNo,
                                        copyType: 'MERCHANT',
                                        paymentInfo: {
                                            payments: payments.map((payment) => ({
                                                type: payment.type,
                                                amount: payment.amount,
                                            })),
                                        },
                                        lines: cartItems.map((item) => {
                                            const identifier = item.identifier;
                                            const lineTotal = getLineTotalSafely(
                                                item.quantity,
                                                item.product.price
                                            );
                                            const allocation = identifier
                                                ? allocations[identifier]
                                                : undefined;

                                            return {
                                                quantity: item.quantity,
                                                productName: item.product.name,
                                                ebtPaidAmount:
                                                    allocation?.ebtPaidAmount ?? 0,
                                                nonEbtPaidAmount:
                                                    allocation?.nonEbtPaidAmount ??
                                                    lineTotal,
                                            };
                                        }),
                                    }
                                );
                                didStartFastPrint = true;
                            } catch (error) {
                                console.error(
                                    'Fast merchant print failed',
                                    error
                                );
                                didStartFastPrint = false;
                            }
                        }

                        const result = await dispatch(
                            payOrder({
                                cart,
                                payments,
                                defaultPrinter,
                                storeInfo,
                                skipAutoPrint: didStartFastPrint,
                            })
                        );

                        if (!payOrder.fulfilled.match(result) || !result.payload) {
                            Alert.alert(
                                t(
                                    'SALES_PaymentFailedTitle',
                                    'Payment could not be completed'
                                ),
                                t(
                                    'SALES_PaymentFailedMessage',
                                    'The order is still open. Please try again.'
                                )
                            );
                            return;
                        }

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
        let active = true;
        let categoriesSub: { unsubscribe: () => void } | undefined;
        let productsSub: { unsubscribe: () => void } | undefined;
        let globalSettingsSub: { unsubscribe: () => void } | undefined;
        const interaction = InteractionManager.runAfterInteractions(() => {
            if (!active) {
                return;
            }

            syncCategories(dispatch);
            syncProducts(dispatch);
            categoriesSub = subscribeToCategoryChanges(dispatch);
            productsSub = subscribeToProductChanges(dispatch);
            globalSettingsSub = subscribeToGlobalSettingsChanges(dispatch);
        });
        
        return () => {
            active = false;
            interaction.cancel?.();
            categoriesSub?.unsubscribe();
            productsSub?.unsubscribe();
            globalSettingsSub?.unsubscribe();
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
