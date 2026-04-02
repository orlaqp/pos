import React, { useCallback, useEffect, useState } from 'react';
import i18next from 'i18next';

import { useDesignTokens } from '@pos/theme/native/design-tokens';

import { Animated, View, Alert, InteractionManager, TextInput } from 'react-native';

import {
    CategoryEntity,
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
    subscribeToProductChanges,
} from '@pos/products/data-access';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ButtonItemType, UIScreen } from '@pos/shared/ui-native';
import { RootState, useAppDispatch } from '@pos/store';
import { getDefaultPrinter, printReceipt } from '@pos/printings/data-access';
import {
    PendingOrderJournalEntry,
    ordersActions,
    payOrder,
    submitOrderAndPay,
    upsertPendingOrderJournalEntry,
    upsertOrder,
} from '@pos/orders/data-access';
import { selectStore } from '@pos/store-info/data-access';
import {
    getGlobalSettings,
    selectPayFromSalesScreen,
    selectStation,
    stationActions,
    StationService,
    subscribeToGlobalSettingsChanges,
} from '@pos/settings/data-access';
import { Role } from '@pos/auth/data-access';
import { selectLoginEmployee } from '@pos/employees/data-access';
import { EACH } from '@pos/unit-of-measures/data-access';
import uuid from 'react-native-uuid';
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
    console.info('[sales-flow]', step, details ?? {});
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
    const restoreSearchFocus = useCallback(() => {
        const interaction = InteractionManager.runAfterInteractions(() => {
            setTimeout(() => {
                searchRef.current?.focus();
            }, 25);
        });

        return () => interaction.cancel?.();
    }, []);
    const deselectProduct = useCallback(() => {
        dispatch(cartActions.setActiveProduct(undefined));
    }, [dispatch]);
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
        dispatch(cartActions.upsert(item));
        deselectProduct();
        restoreSearchFocus();
    }, [deselectProduct, dispatch, restoreSearchFocus]);

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
            setIsSearchActive(false);
            setFilteredProducts(
                getBrowseModeProducts(allProducts, browseMode, activeCategory)
            );
        }

        searchRef.current?.clear();
        restoreSearchFocus();
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
        const buildJournalEntry = (
            cartState: CartState,
            statusTarget: 'OPEN' | 'PAID',
            paymentInfo?: CartPayment[]
        ): PendingOrderJournalEntry => ({
            orderId: cartState.id!,
            orderNo: cartState.orderNo,
            tenantId,
            statusTarget,
            cart: cartState,
            payments: paymentInfo,
            employee: employee
                ? {
                      id: employee.id,
                      name: `${employee.firstName} ${employee.lastName}`,
                  }
                : undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            syncState: 'local_only',
        });

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
                    const journalEntry = buildJournalEntry(cartForOrder, 'OPEN');

                    await upsertPendingOrderJournalEntry(journalEntry);
                    logSaleFlow('order-journal-upserted', {
                        orderId: journalEntry.orderId,
                        entryCount: 1,
                    });

                    const result = await dispatch(
                        upsertOrder({
                            cart: cartForOrder,
                            defaultPrinter,
                            storeInfo,
                            skipAutoPrint: !defaultPrinter || !storeInfo,
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

                    await upsertPendingOrderJournalEntry(
                        buildJournalEntry(cartForPayment, 'PAID', payments)
                    );

                    if (defaultPrinter && storeInfo) {
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
                        });
                        const journalEntry: PendingOrderJournalEntry = {
                            orderId,
                            orderNo: cart.orderNo,
                            tenantId,
                            statusTarget: 'PAID',
                            cart: cartForPayment,
                            payments,
                            employee: employee
                                ? {
                                      id: employee.id,
                                      name: `${employee.firstName} ${employee.lastName}`,
                                  }
                                : undefined,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            syncState: 'local_only',
                        };
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
                            upsertPendingOrderJournalEntry(journalEntry)
                        )
                            .then(() => {
                                logSaleFlow('payment-journal-upserted', {
                                    orderId: journalEntry.orderId,
                                    entryCount: 1,
                                });
                                return dispatch(
                                    payOrder({
                                        cart: cartForPayment,
                                        payments,
                                        defaultPrinter,
                                        storeInfo,
                                        skipAutoPrint: !defaultPrinter || !storeInfo,
                                    })
                                );
                            })
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

                                logSaleFlow('payment-submit-succeeded', {
                                    orderId: result.payload.order.id,
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

    useEffect(() => {
        let active = true;
        let categoriesSub: { unsubscribe: () => void } | undefined;
        let productsSub: { unsubscribe: () => void } | undefined;
        let globalSettingsSub: { unsubscribe: () => void } | undefined;
        const interaction = InteractionManager.runAfterInteractions(() => {
            if (!active) {
                return;
            }

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

        const interaction = InteractionManager.runAfterInteractions(() => {
            searchRef.current?.focus();
        });

        return () => interaction.cancel?.();
    }, [hasCatalogProducts]);

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
                        preferPayFromSalesScreen={
                            route.params.mode === 'order' && payFromSalesScreen
                        }
                        onSubmit={onCartSubmit}
                        products={allProducts}
                        onInteractionComplete={restoreSearchFocus}
                    />
                </View>
            </View>
            <SalesProductDialog
                product={product}
                overlayStyle={[styles.overlay, { maxWidth: 560, width: '88%' }]}
                enforceSalesBasedOnInventory={globalSettings?.enforceSalesBasedOnInventory}
                onClose={() => {
                    deselectProduct();
                    restoreSearchFocus();
                }}
                onUpsertCart={upsertCart}
            />
        </UIScreen>
    );
}

export default SalesScreen;
