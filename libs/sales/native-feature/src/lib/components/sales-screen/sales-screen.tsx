import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import i18next from 'i18next';

import { useDesignTokens } from '@pos/theme/native/design-tokens';

import { Animated, View, Alert, InteractionManager, TextInput } from 'react-native';

import {
    CategoryEntity,
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
} from '@pos/products/data-access';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ButtonItemType, UIScreen } from '@pos/shared/ui-native';
import { RootState, useAppDispatch } from '@pos/store';
import {
    getDefaultPrinter,
    printReceipt,
    PrinterService,
} from '@pos/printings/data-access';
import {
    ordersActions,
    payOrder,
    submitOrderAndPay,
    upsertOrder,
} from '@pos/orders/data-access';
import {
    selectPreferredStore,
    selectStore,
    StoreInfoService,
} from '@pos/store-info/data-access';
import {
    getGlobalSettings,
    selectPayFromSalesScreen,
    selectStation,
    stationActions,
    StationService,
} from '@pos/settings/data-access';
import { Role } from '@pos/auth/data-access';
import { selectLoginEmployee } from '@pos/employees/data-access';
import { EACH } from '@pos/unit-of-measures/data-access';
import uuid from 'react-native-uuid';
import {
    getActiveProducts,
    getAutoAddQuantity,
    getBrowseModeProducts,
    getVisibleProducts,
    getSelectedQuantity,
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

const getErrorMessage = (reason: unknown) => {
    if (reason instanceof Error && reason.message) {
        return reason.message;
    }

    if (typeof reason === 'string' && reason.trim()) {
        return reason;
    }

    return undefined;
};

const logSaleFlow = (step: string, details?: Record<string, unknown>) => {
    void step;
    void details;
};

const SALES_SEARCH_REFOCUS_DELAY_MS = 200;

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
    const productsEntities = useSelector(selectProductsEntities);
    const globalSettings = useSelector(getGlobalSettings);
    const payFromSalesScreen = useSelector(selectPayFromSalesScreen);
    const employee = useSelector(selectLoginEmployee);
    const tenantId = useSelector(
        (state: RootState) =>
            (state.tenantSession?.currentTenantId ??
                (state.tenantSession as { tenantId?: string } | undefined)?.tenantId) as
                | string
                | undefined
    );
    const station = useSelector(selectStation);

    const [browseMode, setBrowseMode] = useState<'idle' | 'all' | 'category'>('idle');
    const [activeCategory, setActiveCategory] = useState<CategoryEntity | undefined>();
    const [searchText, setSearchText] = useState<string>();
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [showCategories, setShowCategories] = useState(true);
    const [categoryRefreshToken, setCategoryRefreshToken] = useState(0);
    const [categoryWidth] = useState(() => new Animated.Value(150));
    const [categoryOpacity] = useState(() => new Animated.Value(1));
    const [contentOpacity] = useState(() => new Animated.Value(1));
    const browseModeRef = useRef(browseMode);
    const activeCategoryRef = useRef(activeCategory);
    const searchTextRef = useRef(searchText);
    const isSearchActiveRef = useRef(isSearchActive);
    const showCategoriesRef = useRef(showCategories);
    const isScreenFocusedRef = useRef(false);
    const isProductDialogOpenRef = useRef(Boolean(product));
    const searchFocusInteractionRef = useRef<{ cancel?: () => void } | null>(
        null
    );
    const searchFocusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
        null
    );
    const t = (key: string, fallback: string) =>
        i18next.isInitialized && i18next.exists(key)
            ? String(i18next.t(key))
            : fallback;
    const hasCatalogProducts = getActiveProducts(allProducts).length > 0;
    const canManageCatalog = !!employee?.roles?.includes(Role.Admin);
    const filteredProducts = useMemo(
        () =>
            getVisibleProducts(
                allProducts,
                browseMode,
                activeCategory,
                isSearchActive ? searchText : undefined
            ),
        [activeCategory, allProducts, browseMode, isSearchActive, searchText]
    );

    useEffect(() => {
        browseModeRef.current = browseMode;
        activeCategoryRef.current = activeCategory;
        searchTextRef.current = searchText;
        isSearchActiveRef.current = isSearchActive;
        showCategoriesRef.current = showCategories;
    }, [activeCategory, browseMode, isSearchActive, searchText, showCategories]);
    const cancelPendingSearchFocus = useCallback(() => {
        searchFocusInteractionRef.current?.cancel?.();
        searchFocusInteractionRef.current = null;
        if (searchFocusTimeoutRef.current) {
            clearTimeout(searchFocusTimeoutRef.current);
            searchFocusTimeoutRef.current = null;
        }
    }, []);
    useEffect(() => {
        isProductDialogOpenRef.current = Boolean(product);

        if (product) {
            cancelPendingSearchFocus();
        }
    }, [cancelPendingSearchFocus, product]);
    const restoreSearchFocus = useCallback(() => {
        if (!isScreenFocusedRef.current) {
            return;
        }

        if (isProductDialogOpenRef.current) {
            return;
        }

        if (searchFocusInteractionRef.current || searchFocusTimeoutRef.current) {
            return;
        }

        searchFocusInteractionRef.current = InteractionManager.runAfterInteractions(
            () => {
                searchFocusInteractionRef.current = null;
                if (!isScreenFocusedRef.current || isProductDialogOpenRef.current) {
                    return;
                }

                const input = searchRef.current as
                    | (TextInput & { isFocused?: () => boolean })
                    | null;

                if (input?.isFocused?.()) {
                    return;
                }

                input?.focus?.();
            }
        );
    }, []);
    const blurSearchFocus = useCallback(() => {
        const input = searchRef.current as
            | (TextInput & { blur?: () => void })
            | null;
        input?.blur?.();
    }, []);
    const scheduleSearchFocusRestore = useCallback(
        ({
            blurFirst = false,
            delayMs = SALES_SEARCH_REFOCUS_DELAY_MS,
        }: {
            blurFirst?: boolean;
            delayMs?: number;
        } = {}) => {
            cancelPendingSearchFocus();

            if (!isScreenFocusedRef.current || isProductDialogOpenRef.current) {
                return;
            }

            if (blurFirst) {
                blurSearchFocus();
            }

            searchFocusTimeoutRef.current = setTimeout(() => {
                searchFocusTimeoutRef.current = null;
                restoreSearchFocus();
            }, delayMs);
        },
        [blurSearchFocus, cancelPendingSearchFocus, restoreSearchFocus]
    );
    const deselectProduct = useCallback(() => {
        dispatch(cartActions.setActiveProduct(undefined));
    }, [dispatch]);
    const closeProductDialog = useCallback(() => {
        isProductDialogOpenRef.current = false;
        deselectProduct();
        scheduleSearchFocusRestore();
    }, [deselectProduct, scheduleSearchFocusRestore]);
    const shouldReturnToOrderList = () =>
        navigation.getState?.()?.routeNames?.includes('Order List');
    const ensureCheckoutContext = useCallback(
        (mode: 'order' | 'payment', cart: CartState) => {
            if (!tenantId) {
                Alert.alert(
                    t('SALES_TenantUnavailableTitle', 'Tenant not ready'),
                    t(
                        'SALES_TenantUnavailableMessage',
                        'Tenant context is not ready yet. Please try again in a moment.'
                    )
                );
                return false;
            }

            if (!employee?.id) {
                Alert.alert(
                    t('SALES_EmployeeUnavailableTitle', 'Employee required'),
                    t(
                        'SALES_EmployeeUnavailableMessage',
                        'Sign in as an employee before creating sales.'
                    )
                );
                return false;
            }

            if (
                mode === 'order' &&
                !cart.orderNo &&
                !station?.stationNumber?.trim()
            ) {
                Alert.alert(
                    t('SALES_StationUnavailableTitle', 'Station setup required'),
                    t(
                        'SALES_StationUnavailableMessage',
                        'Configure the station code before creating sales.'
                    )
                );
                return false;
            }

            return true;
        },
        [employee?.id, station?.stationNumber, t, tenantId]
    );

    const upsertCart = useCallback((item: CartItem) => {
        isProductDialogOpenRef.current = false;
        dispatch(cartActions.upsert(item));
        deselectProduct();
        scheduleSearchFocusRestore();
    }, [deselectProduct, dispatch, scheduleSearchFocusRestore]);
    const getLatestProduct = useCallback(
        (product: ProductEntity) =>
            productsEntities[product.id] ?? product,
        [productsEntities]
    );

    const preparePrintableOrderCart = useCallback(
        async (cart: CartState) => {
            if (cart.id && cart.orderNo) {
                return cart;
            }

            if (!employee) {
                throw new Error('Employee context is not available');
            }

            let orderNo = cart.orderNo;
            if (!orderNo && station?.stationNumber) {
                const reservation = StationService.reserveNextOrderNumber(
                    station,
                    employee
                );
                orderNo = reservation.orderNo;
                dispatch(stationActions.set(reservation.config));
                void StationService.saveConfig(reservation.config).catch((error) => {
                    console.error(
                        'Unable to persist reserved station order number',
                        getErrorMessage(error) ?? error
                    );
                });
            }

            return {
                ...cart,
                id: cart.id ?? String(uuid.v4()),
                orderNo: orderNo ?? (await StationService.getNextOrderNumber(employee)),
            };
        },
        [dispatch, employee, station]
    );

    const onCategoryChange = useCallback((c?: CategoryEntity) => {
        setIsSearchActive(false);
        setSearchText(undefined);
        setActiveCategory(c);

        if (!c?.id) {
            setBrowseMode('idle');
            scheduleSearchFocusRestore({ blurFirst: true });
            return;
        }

        setBrowseMode('category');
        scheduleSearchFocusRestore({ blurFirst: true });
    }, [scheduleSearchFocusRestore]);

    const onShowAllProducts = useCallback(() => {
        setIsSearchActive(false);
        setSearchText(undefined);
        setActiveCategory(undefined);
        setBrowseMode('all');
        scheduleSearchFocusRestore({ blurFirst: true });
    }, [scheduleSearchFocusRestore]);

    const resetCatalogUi = useCallback(() => {
        const shouldResetCatalogState =
            browseModeRef.current !== 'idle' ||
            !!activeCategoryRef.current ||
            searchTextRef.current !== undefined ||
            isSearchActiveRef.current ||
            !showCategoriesRef.current;

        if (!shouldResetCatalogState) {
            return;
        }

        setActiveCategory(undefined);
        setSearchText(undefined);
        setIsSearchActive(false);
        setBrowseMode('idle');
        setShowCategories(true);
        setCategoryRefreshToken((current) => current + 1);
        searchRef.current?.clear?.();
    }, []);

    const onFilterChange = async (text: string) => {
        if (!text?.trim()) {
            setIsSearchActive(false);
            setSearchText(undefined);
            return '';
        }

        const normalizedText = text.trim();
        setIsSearchActive(true);
        setSearchText(normalizedText);
        const res = await ProductService.search(allProducts, {
            text: normalizedText,
            onlyActive: true,
        });

        if (shouldSetFilteredProducts(text, res.allNumbers)) {
            return '';
        }

        if (res.items.length === 1 && res.allNumbers) {
            // searchRef.current?.clear();

            const p = getLatestProduct(res.items[0]);
            // add product to cart directly
            dispatch(
                cartActions.upsert(
                    CartItemMapper.fromProduct(
                        p,
                        getAutoAddQuantity(p, res.quantity)
                    )
                )
            );
            setIsSearchActive(false);
            setSearchText(undefined);
        }
        return '';
    };

    const onProductSelected = useCallback(
        (p: ButtonItemType) => {
            cancelPendingSearchFocus();
            blurSearchFocus();
            const product = getLatestProduct(p as ProductEntity);

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
                scheduleSearchFocusRestore({ blurFirst: true });
                return;
            }

            dispatch(
                cartActions.setActiveProduct({
                    product,
                    quantity: getSelectedQuantity(product.unitOfMeasure),
                })
            );
        },
        [
            blurSearchFocus,
            cancelPendingSearchFocus,
            dispatch,
            getLatestProduct,
            globalSettings,
            scheduleSearchFocusRestore,
        ]
    );

    const onProductLongPress = useCallback(
        (p: ButtonItemType) => {
            cancelPendingSearchFocus();
            blurSearchFocus();
            const product = getLatestProduct(p as ProductEntity);

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
        [blurSearchFocus, cancelPendingSearchFocus, dispatch, getLatestProduct, globalSettings]
    );

    const onCartSubmit = (
        cart: CartState,
        payments?: CartPayment[],
        options?: {
            intent?: 'save_open_order' | 'receive_payment';
        }
    ) => {
        const cartItems = cart.items ?? [];
        const intent =
            options?.intent ||
            (route.params.mode === 'payment'
                ? 'receive_payment'
                : 'save_open_order');

        if (route.params.mode === 'order' && intent === 'save_open_order') {
            if (!ensureCheckoutContext('order', cart)) {
                logSaleFlow('checkout-blocked', {
                    mode: 'order',
                    hasTenantId: !!tenantId,
                    hasEmployeeId: !!employee?.id,
                    hasStationNumber: !!station?.stationNumber,
                });
                return;
            }

            void (async () => {
                try {
                    logSaleFlow('order-submit-start', {
                        cartItemCount: cartItems.length,
                        hasPrinter: !!defaultPrinter,
                        hasStoreInfo: !!storeInfo,
                    });

                    const cartForOrder = await preparePrintableOrderCart(cart);
                    const resolvedStoreInfo =
                        storeInfo ??
                        selectPreferredStore(await StoreInfoService.getStore());
                    const resolvedDefaultPrinter =
                        defaultPrinter ?? (await PrinterService.getDefaultPrinter());

                    const result = await dispatch(
                        upsertOrder({
                            cart: cartForOrder,
                            defaultPrinter: resolvedDefaultPrinter,
                            storeInfo: resolvedStoreInfo,
                            skipAutoPrint: !resolvedStoreInfo,
                        })
                    );

                    if (!upsertOrder.fulfilled.match(result)) {
                        const message = t(
                            'SALES_OrderSaveFailedMessage',
                            'The order was not saved. Please try again.'
                        );
                        Alert.alert(
                            t(
                                'SALES_OrderSaveFailedTitle',
                                'Order could not be saved'
                            ),
                            message
                        );
                        return;
                    }

                    logSaleFlow('order-submit-succeeded', {
                        orderId: result.payload.order.id,
                    });
                    dispatch(cartActions.reset());
                } catch (error) {
                    const message =
                        getErrorMessage(error) ??
                        t(
                            'SALES_OrderSaveFailedMessage',
                            'The order was not saved. Please try again.'
                        );
                    logSaleFlow('order-submit-failed', {
                        message,
                    });
                    Alert.alert(
                        t(
                            'SALES_OrderSaveFailedTitle',
                            'Order could not be saved'
                        ),
                        message
                    );
                }
            })();
            return;
        }

        if (route.params.mode === 'order' && intent === 'receive_payment') {
            if (!payments?.length) {
                Alert.alert(
                    t(
                        'SALES_PaymentRequiredMessage',
                        'An order cannot be marked as paid without payment information'
                    )
                );
                return;
            }

            if (!ensureCheckoutContext('order', cart)) {
                logSaleFlow('checkout-blocked', {
                    mode: 'order-pay-now',
                    hasTenantId: !!tenantId,
                    hasEmployeeId: !!employee?.id,
                    hasStationNumber: !!station?.stationNumber,
                });
                return;
            }

            void (async () => {
                try {
                    logSaleFlow('one-step-submit-start', {
                        cartItemCount: cartItems.length,
                        hasPrinter: !!defaultPrinter,
                        hasStoreInfo: !!storeInfo,
                    });

                    const cartForOrder = await preparePrintableOrderCart(cart);

                    const submitResult = await dispatch(
                        submitOrderAndPay({
                            cart: cartForOrder,
                            payments,
                            defaultPrinter,
                            storeInfo,
                            skipAutoPrint: true,
                        })
                    );

                    if (
                        !submitOrderAndPay.fulfilled.match(submitResult) ||
                        !submitResult.payload
                    ) {
                        Alert.alert(
                            t(
                                'SALES_PaymentFailedTitle',
                                'Payment could not be completed'
                            ),
                            t(
                                'SALES_OneStepPaymentFailedOpenOrderMessage',
                                'The order was saved as open. Please complete payment from Open Orders.'
                            )
                        );
                        return;
                    }

                    const cartForPayment: CartState = {
                        ...cartForOrder,
                        id: submitResult.payload.order.id,
                        orderNo:
                            submitResult.payload.order.orderNo ?? cartForOrder.orderNo,
                    };

                    if (storeInfo) {
                        await printReceipt(
                            storeInfo,
                            defaultPrinter,
                            cartForPayment,
                            {
                                ...submitResult.payload.order,
                                copyType: 'CUSTOMER',
                            }
                        );
                        await printReceipt(
                            storeInfo,
                            defaultPrinter,
                            cartForPayment,
                            {
                                ...submitResult.payload.order,
                                copyType: 'MERCHANT',
                            }
                        );
                    }

                    logSaleFlow('one-step-submit-succeeded', {
                        orderId: submitResult.payload.order.id,
                    });
                    dispatch(cartActions.reset());
                } catch (error) {
                    const message =
                        getErrorMessage(error) ??
                        t(
                            'SALES_PaymentFailedMessage',
                            'The order is still open. Please try again.'
                        );
                    logSaleFlow('one-step-submit-failed', {
                        message,
                    });
                    Alert.alert(
                        t(
                            'SALES_PaymentFailedTitle',
                            'Payment could not be completed'
                        ),
                        message
                    );
                }
            })();
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

                        const orderId = cart.id ?? String(uuid.v4());
                        const cartForPayment: CartState = {
                            ...cart,
                            id: orderId,
                        };
                        if (!ensureCheckoutContext('payment', cartForPayment)) {
                            logSaleFlow('checkout-blocked', {
                                mode: 'payment',
                                hasTenantId: !!tenantId,
                                hasEmployeeId: !!employee?.id,
                                orderId,
                            });
                            return;
                        }

                        logSaleFlow('payment-submit-start', {
                            orderId,
                            cartItemCount: cartItems.length,
                            hasPrinter: !!defaultPrinter,
                            hasStoreInfo: !!storeInfo,
                            submittedAt: new Date().toISOString(),
                        });
                        const paymentSubmitStartedAt = Date.now();
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
                        Promise.resolve(
                            dispatch(
                                payOrder({
                                    cart: cartForPayment,
                                    payments,
                                    defaultPrinter,
                                    storeInfo,
                                    skipAutoPrint: !storeInfo,
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
                                        t(
                                            'SALES_PaymentFailedMessage',
                                            'The order is still open. Please try again.'
                                        )
                                    );
                                    return;
                                }

                                logSaleFlow('payment-close-order-complete', {
                                    orderId: result.payload.order.id,
                                    durationMs: Date.now() - paymentSubmitStartedAt,
                                });
                                logSaleFlow('payment-submit-succeeded', {
                                    orderId: result.payload.order.id,
                                    durationMs: Date.now() - paymentSubmitStartedAt,
                                });

                                if (shouldReturnToOrderList()) {
                                    navigation.navigate('Order List' as never);
                                } else {
                                    navigation.goBack();
                                }
                                dispatch(cartActions.reset());
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
                                    t(
                                        'SALES_PaymentFailedMessage',
                                        'The order is still open. Please try again.'
                                    )
                                );
                            });
                    },
                },
            ]
        );
    };

    useFocusEffect(
        useCallback(() => {
            isScreenFocusedRef.current = true;
            resetCatalogUi();
            restoreSearchFocus();
            return () => {
                isScreenFocusedRef.current = false;
                cancelPendingSearchFocus();
            };
        }, [cancelPendingSearchFocus, resetCatalogUi, restoreSearchFocus])
    );

    useEffect(() => {
        if (!hasCatalogProducts) return;
        restoreSearchFocus();
    }, [hasCatalogProducts, restoreSearchFocus]);

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
                    selectedCategoryId={activeCategory?.id}
                    categoryRefreshToken={categoryRefreshToken}
                    onToggleCategories={() => {
                        setShowCategories((current) => !current);
                        scheduleSearchFocusRestore({ blurFirst: true });
                    }}
                    onFilterChange={onFilterChange}
                    onProductSelected={onProductSelected}
                    onProductLongPress={onProductLongPress}
                    onOpenBackOfficeForm={openBackOfficeForm}
                />
                <View style={styles.cartPanel}>
                    <Cart
                        key="cart"
                        mode={route.params.mode}
                        preferPayFromSalesScreen={
                            route.params.mode === 'order' && payFromSalesScreen
                        }
                        onSubmit={onCartSubmit}
                        products={allProducts}
                        onInteractionComplete={scheduleSearchFocusRestore}
                    />
                </View>
            </View>
            <SalesProductDialog
                product={product}
                overlayStyle={[styles.overlay, { maxWidth: 560, width: '88%' }]}
                enforceSalesBasedOnInventory={globalSettings?.enforceSalesBasedOnInventory}
                onClose={closeProductDialog}
                onUpsertCart={upsertCart}
            />
        </UIScreen>
    );
}

export default SalesScreen;
