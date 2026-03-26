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
    syncProducts,
    subscribeToProductChanges,
} from '@pos/products/data-access';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ButtonItemType, UIScreen } from '@pos/shared/ui-native';
import { useAppDispatch } from '@pos/store';
import { getDefaultPrinter, printReceipt } from '@pos/printings/data-access';
import {
    buildEbtAllocations,
    getLineTotal,
    ordersActions,
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
    getBrowseModeProducts,
    getSelectedQuantity,
    isSameProductList,
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

const getErrorMessage = (reason: unknown) => {
    if (reason instanceof Error && reason.message) {
        return reason.message;
    }

    if (typeof reason === 'string' && reason.trim()) {
        return reason;
    }

    return undefined;
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
    const storeInfo = useSelector(selectStore);
    const defaultPrinter = useSelector(getDefaultPrinter);
    const allProducts = useSelector(selectAllProducts);
    const globalSettings = useSelector(getGlobalSettings);
    const employee = useSelector(selectLoginEmployee);

    const [filteredProducts, setFilteredProducts] = useState<ProductEntity[]>(
        []
    );
    const [browseMode, setBrowseMode] = useState<'idle' | 'all' | 'category'>('idle');
    const [activeCategory, setActiveCategory] = useState<CategoryEntity | undefined>();
    const [isSearchActive, setIsSearchActive] = useState(false);
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
        setIsSearchActive(false);
        setActiveCategory(c);

        if (!c?.id) {
            setBrowseMode('idle');
            setFilteredProducts([]);
            return;
        }

        setBrowseMode('category');
        const res = await ProductService.search(allProducts, {
            categoryId: c.id,
            onlyActive: true
        });
        setFilteredProducts(res.items);
    };

    const onShowAllProducts = useCallback(() => {
        setIsSearchActive(false);
        setActiveCategory(undefined);
        setBrowseMode('all');
        setFilteredProducts(getActiveProducts(allProducts));
    }, [allProducts]);

    const onFilterChange = async (text: string) => {
        if (!text?.trim()) {
            setIsSearchActive(false);
            setFilteredProducts(
                getBrowseModeProducts(allProducts, browseMode, activeCategory)
            );
            return '';
        }

        setIsSearchActive(true);
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
            const shouldFastPrint =
                !!defaultPrinter && !!storeInfo && !!(cart.orderNo || cart.id);

            if (!defaultPrinter || !storeInfo) {
                Alert.alert(
                    t('SALES_PrintRequirementsTitle', 'Printing unavailable'),
                    t(
                        'SALES_PrintRequirementsMessage',
                        'Store and printer should be available in order to print.'
                    )
                );
            }

            if (shouldFastPrint) {
                Promise.resolve(
                    printReceiptSafely(storeInfo, defaultPrinter, cart, {
                        id: cart.id,
                        status: 'OPEN',
                        orderNo: cart.orderNo,
                        copyType: 'CUSTOMER',
                        lines: cartItems.map((item) => ({
                            quantity: item.quantity,
                            productName: item.product.name,
                        })),
                    })
                ).catch((error) => {
                    console.error(
                        'Customer receipt print failed',
                        getErrorMessage(error) ?? error
                    );
                    Alert.alert(
                        t('SALES_PrintFailedTitle', 'Receipt could not be printed'),
                        t(
                            'SALES_OrderSavedPrintFailedMessage',
                            'The order was saved, but the receipt could not be printed.'
                        )
                    );
                });
            }

            Promise.resolve(
                dispatch(
                    upsertOrder({
                        cart,
                        defaultPrinter,
                        storeInfo,
                        skipAutoPrint: shouldFastPrint || !defaultPrinter || !storeInfo,
                    })
                )
            )
                .then((result) => {
                    if (
                        !upsertOrder.fulfilled.match(result)
                    ) {
                        Alert.alert(
                            t(
                                'SALES_OrderSaveFailedTitle',
                                'Order could not be saved'
                            ),
                            shouldFastPrint
                                ? `${t(
                                      'SALES_OrderSaveFailedMessage',
                                      'The order was not saved. Please try again.'
                                  )} ${t(
                                      'SALES_PrintAlreadyStartedMessage',
                                      'The receipt may have already been printed.'
                                  )}`
                                : t(
                                      'SALES_OrderSaveFailedMessage',
                                      'The order was not saved. Please try again.'
                                  )
                        );
                    }
                })
                .catch((error) => {
                    console.error(
                        'Order save failed',
                        getErrorMessage(error) ?? error
                    );
                    Alert.alert(
                        t(
                            'SALES_OrderSaveFailedTitle',
                            'Order could not be saved'
                        ),
                        shouldFastPrint
                            ? `${t(
                                  'SALES_OrderSaveFailedMessage',
                                  'The order was not saved. Please try again.'
                              )} ${t(
                                  'SALES_PrintAlreadyStartedMessage',
                                  'The receipt may have already been printed.'
                              )}`
                            : t(
                                  'SALES_OrderSaveFailedMessage',
                                  'The order was not saved. Please try again.'
                              )
                    );
                });

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

                        const shouldFastPrint = !!defaultPrinter && !!storeInfo;
                        if (cart.id) {
                            dispatch(
                                ordersActions.optimisticMarkPaid({
                                    id: cart.id,
                                    payments,
                                    employeeId: employee?.id,
                                    employeeName: employee
                                        ? `${employee.firstName} ${employee.lastName}`
                                        : undefined,
                                })
                            );
                        }
                        if (!defaultPrinter || !storeInfo) {
                            Alert.alert(
                                t('SALES_PrintRequirementsTitle', 'Printing unavailable'),
                                t(
                                    'SALES_PrintRequirementsMessage',
                                    'Store and printer should be available in order to print.'
                                )
                            );
                        }
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

                        if (shouldFastPrint) {
                            Promise.resolve(
                                printReceiptSafely(
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
                                )
                            ).catch((error) => {
                                console.error(
                                    'Fast merchant print failed',
                                    getErrorMessage(error) ?? error
                                );
                                Alert.alert(
                                    t(
                                        'SALES_PrintFailedTitle',
                                        'Receipt could not be printed'
                                    ),
                                    t(
                                        'SALES_PaymentSavedPrintFailedMessage',
                                        'The payment was saved, but the receipt could not be printed.'
                                    )
                                );
                            });
                        }

                        Promise.resolve(
                            dispatch(
                                payOrder({
                                    cart,
                                    payments,
                                    defaultPrinter,
                                    storeInfo,
                                    skipAutoPrint:
                                        shouldFastPrint || !defaultPrinter || !storeInfo,
                                })
                            )
                        )
                            .then((result) => {
                                if (
                                    !payOrder.fulfilled.match(result) ||
                                    !result.payload
                                ) {
                                    if (cart.id) {
                                        dispatch(
                                            ordersActions.optimisticRestoreOpen({
                                                id: cart.id,
                                            })
                                        );
                                    }
                                    Alert.alert(
                                        t(
                                            'SALES_PaymentFailedTitle',
                                            'Payment could not be completed'
                                        ),
                                        shouldFastPrint
                                            ? `${t(
                                                  'SALES_PaymentFailedMessage',
                                                  'The order is still open. Please try again.'
                                              )} ${t(
                                                  'SALES_PrintAlreadyStartedMessage',
                                                  'The receipt may have already been printed.'
                                              )}`
                                            : t(
                                                  'SALES_PaymentFailedMessage',
                                                  'The order is still open. Please try again.'
                                              )
                                    );
                                }
                            })
                            .catch((error) => {
                                if (cart.id) {
                                    dispatch(
                                        ordersActions.optimisticRestoreOpen({
                                            id: cart.id,
                                        })
                                    );
                                }
                                console.error(
                                    'payOrder dispatch failed',
                                    getErrorMessage(error) ?? error
                                );
                                Alert.alert(
                                    t(
                                        'SALES_PaymentFailedTitle',
                                        'Payment could not be completed'
                                    ),
                                    shouldFastPrint
                                        ? `${t(
                                              'SALES_PaymentFailedMessage',
                                              'The order is still open. Please try again.'
                                          )} ${t(
                                              'SALES_PrintAlreadyStartedMessage',
                                              'The receipt may have already been printed.'
                                          )}`
                                        : t(
                                              'SALES_PaymentFailedMessage',
                                              'The order is still open. Please try again.'
                                          )
                                );
                            });

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
        if (!hasCatalogProducts) return;

        setTimeout(() => {
            searchRef.current?.focus();
        }, 25);
    }, [hasCatalogProducts, filteredProducts, searchRef])

    useEffect(() => {
        if (isSearchActive) {
            return;
        }

        const nextProducts = getBrowseModeProducts(
            allProducts,
            browseMode,
            activeCategory
        );
        // Keep the filtered view aligned with source catalog updates without
        // overwriting active search selections when the list is unchanged.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFilteredProducts((current) =>
            isSameProductList(current, nextProducts) ? current : nextProducts
        );
    }, [activeCategory, allProducts, browseMode, isSearchActive]);

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
                    onShowAllProducts={onShowAllProducts}
                    showAllProducts={browseMode === 'all'}
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
