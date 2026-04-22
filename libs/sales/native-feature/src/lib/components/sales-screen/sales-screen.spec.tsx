/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-explicit-any */
import React from 'react';
import { Alert, InteractionManager } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';

const mockDispatch = jest.fn();
const mockGoBack = jest.fn();
const mockNavigate = jest.fn();
const mockSearch = jest.fn();
const mockCategoriesUnsubscribe = jest.fn();
const mockProductsUnsubscribe = jest.fn();
const mockSettingsUnsubscribe = jest.fn();
const mockPrintReceipt = jest.fn();
const mockGetPersistedDefaultPrinter = jest.fn();
const mockGetStores = jest.fn();
const mockSearchFocus = jest.fn();
const mockSearchBlur = jest.fn();
const mockSearchClear = jest.fn();
let focusEffectCallback: (() => void | (() => void)) | undefined;
const mockGetNextOrderNumber = jest.fn(async () => '51-EMP-260326-0001');
const mockReserveNextOrderNumber = jest.fn(() => ({
    orderNo: '51-EMP-260326-0001',
    config: {
        stationNumber: '51',
        currentDate: '260326',
        orderNumber: 1,
    },
}));
const mockSaveStationConfig = jest.fn(async () => undefined);
const mockUpsertOrder = Object.assign(
    jest.fn((payload: unknown) => ({
        type: 'orders/upsert',
        payload,
    })),
    {
        fulfilled: {
            match: (action: { type?: string }) => action.type === 'orders/upsert/fulfilled',
        },
    }
);
const mockPayOrder = Object.assign(
    jest.fn((payload: unknown) => ({
        type: 'orders/pay',
        payload,
    })),
    {
        fulfilled: {
            match: (action: { type?: string }) => action.type === 'orders/pay/fulfilled',
        },
    }
);
const mockSubmitOrderAndPay = Object.assign(
    jest.fn((payload: unknown) => ({
        type: 'orders/submitAndPay',
        payload,
    })),
    {
        fulfilled: {
            match: (action: { type?: string }) =>
                action.type === 'orders/submitAndPay/fulfilled',
        },
    }
);
const mockProduct = {
    id: 'p-1',
    name: 'Apple',
    price: 2.5,
    unitOfMeasure: 'ea',
    quantity: 100,
    isActive: true,
    productCategoryId: 'c-1',
} as any;

const mockLowInventoryProduct = {
    ...mockProduct,
    id: 'p-2',
    quantity: 0,
} as any;

const mockWeightedProduct = {
    ...mockProduct,
    id: 'p-3',
    name: 'Rice',
    unitOfMeasure: 'LB',
} as any;

let mockState: any;
let interactionCallbacks: Array<() => void> = [];
let mockInteractionCancel: jest.Mock;

jest.mock('react-redux', () => ({
    useDispatch: () => mockDispatch,
    useSelector: (selector: (state: any) => unknown) => selector(mockState),
}));

jest.mock('@pos/store', () => ({
    useAppDispatch: () => mockDispatch,
}));

jest.mock('@react-navigation/native', () => ({
    useFocusEffect: (callback: () => void | (() => void)) => {
        const React = require('react');
        focusEffectCallback = callback;
        React.useEffect(() => {
            const cleanup = callback();
            return cleanup;
        }, [callback]);
    },
}));

jest.mock('@pos/theme/native/design-tokens', () => ({
    useDesignTokens: () => ({
        colors: {
            accent: '#4aa3eb',
        },
    }),
}));

jest.mock('@pos/shared/ui-native', () => ({
    UIScreen: ({ children }: { children: React.ReactNode }) => {
        const { View } = require('react-native');
        return <View>{children}</View>;
    },
}));

jest.mock('@pos/auth/data-access', () => ({
    Role: {
        Admin: 'Admin',
    },
}));

jest.mock('@pos/employees/data-access', () => ({
    selectLoginEmployee: (state: any) => state.employee,
}));

jest.mock('@pos/categories/data-access', () => ({
    selectCategoriesEntities: (state: any) => state.categoriesEntities || {},
    subscribeToCategoryChanges: () => ({ unsubscribe: mockCategoriesUnsubscribe }),
}));

jest.mock('@pos/products/data-access', () => ({
    selectAllProducts: (state: any) => state.allProducts,
    selectProductsEntities: (state: any) =>
        state.productsEntities ||
        Object.fromEntries((state.allProducts || []).map((product: any) => [product.id, product])),
    ProductService: {
        search: (...args: unknown[]) => mockSearch(...args),
    },
    subscribeToProductChanges: () => ({ unsubscribe: mockProductsUnsubscribe }),
}));

jest.mock('@pos/settings/data-access', () => ({
    getGlobalSettings: (state: any) => state.settings,
    selectPayFromSalesScreen: (state: any) =>
        state.settings.payFromSalesScreen,
    selectStation: (state: any) => state.station,
    stationActions: {
        set: (payload: unknown) => ({ type: 'station/set', payload }),
    },
    subscribeToGlobalSettingsChanges: () => ({
        unsubscribe: mockSettingsUnsubscribe,
    }),
    StationService: {
        getNextOrderNumber: (...args: unknown[]) => mockGetNextOrderNumber(...args),
        reserveNextOrderNumber: (...args: unknown[]) => mockReserveNextOrderNumber(...args),
        saveConfig: (...args: unknown[]) => mockSaveStationConfig(...args),
    },
}));

jest.mock('react-native-uuid', () => ({
    v4: jest.fn(() => 'generated-cart-id'),
}));

jest.mock('@pos/store-info/data-access', () => ({
    selectStore: (state: any) => state.store,
    selectPreferredStore: (stores: any[]) => stores[0],
    StoreInfoService: {
        getStore: (...args: unknown[]) => mockGetStores(...args),
    },
}));

jest.mock('@pos/printings/data-access', () => ({
    getDefaultPrinter: (state: any) => state.printer,
    printReceipt: (...args: unknown[]) => mockPrintReceipt(...args),
    PrinterService: {
        getDefaultPrinter: (...args: unknown[]) =>
            mockGetPersistedDefaultPrinter(...args),
    },
}));

jest.mock('@pos/orders/data-access', () => ({
    buildEbtAllocations: jest.fn(() => ({})),
    getLineTotal: jest.fn((quantity: number, price: number) => +(quantity * price).toFixed(2)),
    OrderService: {
        buildPrintTicketForOrderEntitySnapshot: jest.fn((order: any, options?: any) => ({
            isReceipt: true,
            orderId: order?.id,
            orderNo: order?.orderNo,
            copyType: options?.copyType ?? 'MERCHANT',
            sections: [{ title: 'Items', emptyLabel: 'No items', rows: [] }],
            totals: { subtotal: 0, discount: 0, tax: 0, total: 0 },
            paymentRows: [],
            promoCodes: [],
        })),
    },
    ordersActions: {
        optimisticMarkPaid: (payload: unknown) => ({
            type: 'orders/optimisticMarkPaid',
            payload,
        }),
        optimisticRestoreOpen: (payload: unknown) => ({
            type: 'orders/optimisticRestoreOpen',
            payload,
        }),
    },
    upsertOrder: mockUpsertOrder,
    payOrder: mockPayOrder,
    submitOrderAndPay: mockSubmitOrderAndPay,
}));

jest.mock('@pos/sales/data-access', () => ({
    MINIMUM_INVENTORY_FOR_SALE: 1,
    cartActions: {
        setActiveProduct: (payload: unknown) => ({ type: 'cart/setActiveProduct', payload }),
        upsert: (payload: unknown) => ({ type: 'cart/upsert', payload }),
        reset: () => ({ type: 'cart/reset' }),
    },
    CartItemMapper: {
        fromProduct: (product: any, quantity: number) => ({
            identifier: 'i-1',
            product,
            quantity,
        }),
    },
    selectCart: (state: any) => state.cart,
    selectActiveProduct: (state: any) => state.activeProduct,
}));

jest.mock('./sales-screen.styles', () => ({
    useSalesScreenStyles: () => ({
        salesLayout: {},
        cartPanel: {},
        overlay: {},
    }),
}));

jest.mock('./sales-catalog-pane', () => ({
    SalesCatalogPane: ({
        searchRef,
        hasCatalogProducts,
        filteredProducts,
        selectedCategoryId,
        showAllProducts,
        onCategoryChange,
        onShowAllProducts,
        onFilterChange,
        onProductSelected,
        onProductLongPress,
        onToggleCategories,
        onOpenBackOfficeForm,
        onOpenCurrentDeals,
    }: any) => {
        const { View, Pressable, Text } = require('react-native');
        if (searchRef) {
            searchRef.current = {
                focus: mockSearchFocus,
                blur: mockSearchBlur,
                clear: mockSearchClear,
            };
        }
        return (
            <View>
                <Text testID="sales-catalog-count">{filteredProducts.length}</Text>
                <Text testID="sales-selected-category">{selectedCategoryId ?? 'none'}</Text>
                <Text testID="sales-show-all-state">{showAllProducts ? 'all' : 'not-all'}</Text>
                <Pressable testID="sales-category-clear" onPress={() => onCategoryChange(undefined)}>
                    <Text>Clear Category</Text>
                </Pressable>
                <Pressable testID="sales-category-select" onPress={() => onCategoryChange({ id: 'c-1' })}>
                    <Text>Select Category</Text>
                </Pressable>
                <Pressable testID="sales-category-all" onPress={onShowAllProducts}>
                    <Text>All Products</Text>
                </Pressable>
                <Pressable testID="sales-search-submit" onPress={() => onFilterChange('apple')}>
                    <Text>Search</Text>
                </Pressable>
                <Pressable testID="sales-search-barcode" onPress={() => onFilterChange('12345')}>
                    <Text>Search Barcode</Text>
                </Pressable>
                <Pressable testID="sales-search-empty" onPress={() => onFilterChange('')}>
                    <Text>Search Empty</Text>
                </Pressable>
                <Pressable testID="sales-product-select" onPress={() => onProductSelected(mockProduct)}>
                    <Text>Product</Text>
                </Pressable>
                <Pressable
                    testID="sales-product-select-low"
                    onPress={() => onProductSelected(mockLowInventoryProduct)}
                >
                    <Text>Low Stock Product</Text>
                </Pressable>
                <Pressable
                    testID="sales-product-select-weighted"
                    onPress={() => onProductSelected(mockWeightedProduct)}
                >
                    <Text>Weighted Product</Text>
                </Pressable>
                <Pressable
                    testID="sales-product-long-press"
                    onPress={() => onProductLongPress(mockProduct)}
                >
                    <Text>Product Long Press</Text>
                </Pressable>
                <Pressable testID="sales-toggle-categories" onPress={onToggleCategories}>
                    <Text>Toggle Categories</Text>
                </Pressable>
                <Pressable testID="sales-current-deals" onPress={onOpenCurrentDeals}>
                    <Text>Current Deals</Text>
                </Pressable>
                {!hasCatalogProducts ? (
                    <>
                        <Text>No products yet</Text>
                        <Pressable
                            testID="sales-empty-add-category"
                            onPress={() => onOpenBackOfficeForm('Categories', 'Category Form')}
                        >
                            <Text>Add category</Text>
                        </Pressable>
                        <Pressable
                            testID="sales-empty-add-product"
                            onPress={() => onOpenBackOfficeForm('Products', 'Product Form')}
                        >
                            <Text>Add product</Text>
                        </Pressable>
                    </>
                ) : null}
            </View>
        );
    },
}));

jest.mock('./sales-current-deals-dialog', () => ({
    SalesCurrentDealsDialog: ({ isVisible, rows, selectedProductName, onClose }: any) => {
        const { Pressable, Text, View } = require('react-native');
        return isVisible ? (
            <View>
                <Text testID="sales-current-deals-count">{rows.length}</Text>
                <Text testID="sales-current-deals-selected-product">
                    {selectedProductName ?? 'none'}
                </Text>
                <Pressable testID="sales-current-deals-close" onPress={onClose}>
                    <Text>Close deals</Text>
                </Pressable>
            </View>
        ) : null;
    },
}));

jest.mock('./sales-product-dialog', () => ({
    SalesProductDialog: ({ product, onUpsertCart, onClose }: any) => {
        const { Pressable, Text, View } = require('react-native');
        return product ? (
            <View>
                <Pressable
                    testID="sales-product-details-submit"
                    onPress={() =>
                        onUpsertCart({
                            identifier: 'i-2',
                            product: mockProduct,
                            quantity: 3,
                        })
                    }
                >
                    <Text>Details</Text>
                </Pressable>
                <Pressable testID="sales-product-details-close" onPress={onClose}>
                    <Text>Close</Text>
                </Pressable>
            </View>
        ) : null;
    },
}));

jest.mock('../cart/cart', () => ({
    __esModule: true,
    default: ({
        onSubmit,
        onInteractionComplete,
        preferPayFromSalesScreen,
    }: {
        onSubmit: (
            cart: any,
            payments?: any[],
            options?: { intent?: 'save_open_order' | 'receive_payment' }
        ) => void;
        onInteractionComplete: () => void;
        preferPayFromSalesScreen?: boolean;
    }) => {
        const { View, Pressable, Text } = require('react-native');
        return (
            <View>
                <Text testID="sales-cart-prefer-pay-now">
                    {preferPayFromSalesScreen ? 'pay-now' : 'open-order'}
                </Text>
                <Pressable
                    testID="sales-cart-submit-order"
                    onPress={() =>
                        onSubmit({ id: 'cart-1' }, undefined, {
                            intent: 'save_open_order',
                        })
                    }
                >
                    <Text>Submit Order</Text>
                </Pressable>
                <Pressable
                    testID="sales-cart-submit-payment-empty"
                    onPress={() =>
                        onSubmit({ id: 'cart-1' }, undefined, {
                            intent: 'receive_payment',
                        })
                    }
                >
                    <Text>Submit Payment Empty</Text>
                </Pressable>
                <Pressable
                    testID="sales-cart-submit-payment"
                    onPress={() =>
                        onSubmit(
                            { id: 'cart-1' },
                            [{ type: 'cash', amount: 10 }],
                            { intent: 'receive_payment' }
                        )
                    }
                >
                    <Text>Submit Payment</Text>
                </Pressable>
                <Pressable
                    testID="sales-cart-interaction-complete"
                    onPress={onInteractionComplete}
                >
                    <Text>Cart Interaction Complete</Text>
                </Pressable>
            </View>
        );
    },
}));

const { SalesScreen } = require('./sales-screen');

describe('SalesScreen', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.clearAllMocks();
        mockGetPersistedDefaultPrinter.mockResolvedValue(undefined);
        mockGetStores.mockResolvedValue([]);
        mockSearchFocus.mockClear();
        mockSearchBlur.mockClear();
        mockSearchClear.mockClear();
        focusEffectCallback = undefined;
        interactionCallbacks = [];
        mockInteractionCancel = jest.fn();
        jest
            .spyOn(InteractionManager, 'runAfterInteractions')
            .mockImplementation((callback: () => void) => {
                interactionCallbacks.push(callback);
                return { cancel: mockInteractionCancel } as any;
            });
        mockSearch.mockReturnValue({
            items: [mockProduct],
            allNumbers: false,
            quantity: undefined,
        });
        mockDispatch.mockImplementation((action: any) => {
            if (action?.type === 'orders/upsert') {
                return Promise.resolve({
                    type: 'orders/upsert/fulfilled',
                    payload: {
                        order: { id: 'cart-1', status: 'OPEN' },
                    },
                });
            }

            if (action?.type === 'orders/pay') {
                return Promise.resolve({
                    type: 'orders/pay/fulfilled',
                    payload: {
                        order: { id: 'cart-1', status: 'PAID' },
                    },
                });
            }

            if (action?.type === 'orders/submitAndPay') {
                return Promise.resolve({
                    type: 'orders/submitAndPay/fulfilled',
                    payload: {
                        order: {
                            id: 'cart-1',
                            status: 'PAID',
                            orderNo: '51-EMP-260326-0001',
                        },
                    },
                });
            }

            return action;
        });
        mockState = {
            activeProduct: undefined,
            allProducts: [mockProduct, mockLowInventoryProduct],
            cart: {
                definitions: [],
                selected: undefined,
            },
            categoriesEntities: {
                'c-1': { id: 'c-1', name: 'Fruit' },
            },
            productsEntities: {
                [mockProduct.id]: mockProduct,
                [mockLowInventoryProduct.id]: mockLowInventoryProduct,
            },
            employee: {
                id: 'e-1',
                code: 'EMP',
                roles: ['Admin'],
            },
            store: { id: 's-1' },
            printer: { id: 'printer-1' },
            tenantSession: { tenantId: 'tenant-1' },
            settings: {
                enforceSalesBasedOnInventory: false,
                payFromSalesScreen: false,
            },
            station: {
                stationNumber: '51',
                currentDate: '260326',
                orderNumber: 0,
            },
        };
        jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    });

    afterEach(() => {
        act(() => {
            jest.runOnlyPendingTimers();
        });
        jest.useRealTimers();
        jest.restoreAllMocks();
        (Alert.alert as jest.Mock).mockRestore?.();
    });

    const renderSalesScreen = (mode: 'order' | 'payment' = 'order') =>
        render(
            <SalesScreen
                navigation={{
                    goBack: mockGoBack,
                    navigate: mockNavigate,
                    getState: () => ({ routeNames: ['Home', 'Order List', 'Sales'] }),
                } as any}
                route={{ key: 'Sales', name: 'Sales', params: { mode } } as any}
            />
        );

    const flushInteractionCallbacks = () => {
        act(() => {
            const callbacks = [...interactionCallbacks];
            interactionCallbacks = [];
            callbacks.forEach((callback) => callback());
        });
    };

    const flushDelayedSearchRestore = () => {
        act(() => {
            jest.advanceTimersByTime(200);
        });
        flushInteractionCallbacks();
    };

    it('renders from cached state before background sync starts', () => {
        const { getByTestId } = renderSalesScreen();

        expect(getByTestId('sales-catalog-count').props.children).toBe(0);
        expect(mockCategoriesUnsubscribe).not.toHaveBeenCalled();
        expect(mockProductsUnsubscribe).not.toHaveBeenCalled();

        act(() => {
            interactionCallbacks.forEach((callback) => callback());
        });

    });

    it('dispatches cart upsert when an EA product is selected', () => {
        const { getByTestId } = renderSalesScreen();
        fireEvent.press(getByTestId('sales-product-select'));
        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'cart/upsert' })
        );
    });

    it('delays search refocus after tapping a product card', () => {
        const { getByTestId } = renderSalesScreen();

        flushInteractionCallbacks();
        mockSearchFocus.mockClear();

        fireEvent.press(getByTestId('sales-product-select'));

        act(() => {
            jest.advanceTimersByTime(199);
        });

        expect(mockSearchFocus).not.toHaveBeenCalled();

        flushDelayedSearchRestore();

        expect(mockSearchFocus).toHaveBeenCalledTimes(1);
    });

    it('dispatches cart setActiveProduct when a weighted product is selected', () => {
        const { getByTestId } = renderSalesScreen();
        fireEvent.press(getByTestId('sales-product-select-weighted'));
        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'cart/setActiveProduct' })
        );
    });

    it('opens the product dialog flow on long press', () => {
        const { getByTestId } = renderSalesScreen();
        fireEvent.press(getByTestId('sales-product-long-press'));
        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'cart/setActiveProduct' })
        );
    });

    it('does not steal search focus while the weighted product dialog is open', () => {
        mockState.activeProduct = mockWeightedProduct;
        renderSalesScreen();

        flushInteractionCallbacks();

        expect(mockSearchFocus).not.toHaveBeenCalled();
    });

    it('restores search focus after submitting from product details', () => {
        mockState.activeProduct = mockWeightedProduct;
        const { getByTestId } = renderSalesScreen();

        fireEvent.press(getByTestId('sales-product-details-submit'));

        act(() => {
            jest.advanceTimersByTime(199);
        });
        expect(mockSearchFocus).not.toHaveBeenCalled();

        flushDelayedSearchRestore();

        expect(mockSearchFocus).toHaveBeenCalled();
    });

    it('restores search focus after closing product details', () => {
        mockState.activeProduct = mockWeightedProduct;
        const { getByTestId } = renderSalesScreen();

        fireEvent.press(getByTestId('sales-product-details-close'));

        act(() => {
            jest.advanceTimersByTime(199);
        });
        expect(mockSearchFocus).not.toHaveBeenCalled();

        flushDelayedSearchRestore();

        expect(mockSearchFocus).toHaveBeenCalled();
    });

    it('shows availability alert when inventory enforcement blocks a product', () => {
        mockState.settings.enforceSalesBasedOnInventory = true;
        const { getByTestId } = renderSalesScreen();
        fireEvent.press(getByTestId('sales-product-select-low'));
        expect(Alert.alert).toHaveBeenCalledWith(
            'Not Available',
            'We do not have this product in inventory at the moment'
        );
    });

    it('passes pay-now preference to cart only for order mode', () => {
        mockState.settings.payFromSalesScreen = true;

        const orderScreen = renderSalesScreen('order');
        expect(orderScreen.getByTestId('sales-cart-prefer-pay-now').props.children).toBe(
            'pay-now'
        );
        orderScreen.unmount();

        const paymentScreen = renderSalesScreen('payment');
        expect(
            paymentScreen.getByTestId('sales-cart-prefer-pay-now').props.children
        ).toBe('open-order');
    });

    it('handles search flow and barcode auto-add behavior', async () => {
        mockSearch.mockImplementation((_: any, options: { text?: string }) => {
            if (options.text === '12345') {
                return {
                    items: [mockProduct],
                    allNumbers: true,
                    quantity: 7,
                };
            }

            return {
                items: [mockProduct],
                allNumbers: false,
            };
        });

        const { getByTestId } = renderSalesScreen();

        await act(async () => {
            fireEvent.press(getByTestId('sales-search-submit'));
            await Promise.resolve();
        });
        expect(getByTestId('sales-catalog-count').props.children).toBe(1);
        await act(async () => {
            fireEvent.press(getByTestId('sales-search-barcode'));
            await Promise.resolve();
        });
        flushInteractionCallbacks();
        await act(async () => {
            fireEvent.press(getByTestId('sales-search-empty'));
            await Promise.resolve();
        });

        expect(mockSearch).toHaveBeenCalled();
        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'cart/upsert' })
        );
        expect(getByTestId('sales-catalog-count').props.children).toBe(0);
    });

    it('handles category changes with and without selected category and supports all products', async () => {
        const { getByTestId } = renderSalesScreen();
        flushInteractionCallbacks();
        mockSearchFocus.mockClear();

        await act(async () => {
            fireEvent.press(getByTestId('sales-category-clear'));
            await Promise.resolve();
        });
        act(() => {
            jest.advanceTimersByTime(199);
        });
        expect(mockSearchFocus).not.toHaveBeenCalled();
        flushDelayedSearchRestore();
        expect(getByTestId('sales-catalog-count').props.children).toBe(0);

        await act(async () => {
            fireEvent.press(getByTestId('sales-category-select'));
            await Promise.resolve();
        });
        act(() => {
            jest.advanceTimersByTime(199);
        });
        expect(mockSearchFocus).toHaveBeenCalledTimes(1);
        flushDelayedSearchRestore();
        expect(getByTestId('sales-catalog-count').props.children).toBe(2);

        await act(async () => {
            fireEvent.press(getByTestId('sales-category-all'));
            await Promise.resolve();
        });
        act(() => {
            jest.advanceTimersByTime(199);
        });
        expect(mockSearchFocus).toHaveBeenCalledTimes(2);
        flushDelayedSearchRestore();
        expect(getByTestId('sales-catalog-count').props.children).toBe(2);
        expect(mockSearch).not.toHaveBeenCalled();
        expect(mockSearchFocus).toHaveBeenCalledTimes(3);
    });

    it('delays search refocus after toggling categories', () => {
        const { getByTestId } = renderSalesScreen();

        flushInteractionCallbacks();
        mockSearchFocus.mockClear();

        fireEvent.press(getByTestId('sales-toggle-categories'));

        act(() => {
            jest.advanceTimersByTime(199);
        });
        expect(mockSearchFocus).not.toHaveBeenCalled();

        flushDelayedSearchRestore();

        expect(mockSearchFocus).toHaveBeenCalledTimes(1);
    });

    it('opens current deals without disturbing the catalog flow', () => {
        mockState.cart = {
            definitions: [
                {
                    id: 'discount-1',
                    name: 'Egg Special',
                    status: 'ACTIVE',
                    type: 'AUTOMATIC',
                    scope: 'LINE',
                    method: 'PERCENT',
                    value: 30,
                    stackMode: 'STACKABLE',
                    applicableProductIds: [mockProduct.id],
                },
            ],
            selected: {
                identifier: 'line-1',
                product: {
                    id: mockProduct.id,
                    name: mockProduct.name,
                    price: mockProduct.price,
                    categoryId: 'c-1',
                    unitOfMeasure: 'ea',
                },
                quantity: 1,
            },
        };

        const { getByTestId, queryByTestId } = renderSalesScreen();

        expect(queryByTestId('sales-current-deals-count')).toBeNull();

        fireEvent.press(getByTestId('sales-current-deals'));

        expect(getByTestId('sales-current-deals-count').props.children).toBe(1);
        expect(getByTestId('sales-current-deals-selected-product').props.children).toBe(
            'Apple'
        );

        fireEvent.press(getByTestId('sales-current-deals-close'));

        expect(queryByTestId('sales-current-deals-count')).toBeNull();
    });

    it('delays search refocus after cart interaction completion', () => {
        const { getByTestId } = renderSalesScreen();

        flushInteractionCallbacks();
        mockSearchFocus.mockClear();

        fireEvent.press(getByTestId('sales-cart-interaction-complete'));

        act(() => {
            jest.advanceTimersByTime(199);
        });
        expect(mockSearchFocus).not.toHaveBeenCalled();

        flushDelayedSearchRestore();

        expect(mockSearchFocus).toHaveBeenCalledTimes(1);
    });

    it('resets catalog ui when the sales screen regains focus', async () => {
        const { getByTestId } = renderSalesScreen();

        await act(async () => {
            fireEvent.press(getByTestId('sales-category-select'));
            await Promise.resolve();
        });
        expect(getByTestId('sales-selected-category').props.children).toBe('c-1');

        await act(async () => {
            fireEvent.press(getByTestId('sales-search-submit'));
            await Promise.resolve();
        });
        expect(getByTestId('sales-catalog-count').props.children).toBe(1);

        act(() => {
            focusEffectCallback?.();
        });

        expect(getByTestId('sales-selected-category').props.children).toBe('none');
        expect(getByTestId('sales-show-all-state').props.children).toBe('not-all');
        expect(getByTestId('sales-catalog-count').props.children).toBe(0);
        expect(mockSearchClear).toHaveBeenCalled();
    });

    it('does not keep resetting catalog ui when focus fires again without state changes', async () => {
        const { getByTestId } = renderSalesScreen();

        await act(async () => {
            fireEvent.press(getByTestId('sales-category-select'));
            await Promise.resolve();
        });

        expect(getByTestId('sales-selected-category').props.children).toBe('c-1');

        act(() => {
            focusEffectCallback?.();
        });

        expect(getByTestId('sales-selected-category').props.children).toBe('none');
        expect(mockSearchClear).toHaveBeenCalledTimes(1);

        act(() => {
            focusEffectCallback?.();
        });

        expect(getByTestId('sales-selected-category').props.children).toBe('none');
        expect(mockSearchClear).toHaveBeenCalledTimes(1);
    });

    it('submits order mode and resets cart after save success', async () => {
        const { getByTestId } = renderSalesScreen('order');

        await act(async () => {
            fireEvent.press(getByTestId('sales-cart-submit-order'));
            await Promise.resolve();
            await Promise.resolve();
        });

        expect(mockReserveNextOrderNumber).toHaveBeenCalledWith(
            mockState.station,
            mockState.employee
        );
        expect(mockGetNextOrderNumber).not.toHaveBeenCalled();
        expect(mockSaveStationConfig).toHaveBeenCalledWith({
            stationNumber: '51',
            currentDate: '260326',
            orderNumber: 1,
        });
        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'station/set',
                payload: {
                    stationNumber: '51',
                    currentDate: '260326',
                    orderNumber: 1,
                },
            })
        );
        expect(mockUpsertOrder).toHaveBeenCalledWith(
            expect.objectContaining({
                cart: expect.objectContaining({
                    id: 'cart-1',
                    orderNo: '51-EMP-260326-0001',
                }),
                defaultPrinter: mockState.printer,
                storeInfo: mockState.store,
            })
        );
        expect(mockUpsertOrder.mock.calls[0][0]?.skipAutoPrint).toBe(false);
        expect(mockPrintReceipt).not.toHaveBeenCalled();
        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'cart/reset' })
        );
        expect(Alert.alert).not.toHaveBeenCalled();
    });

    it('falls back to persisted store and printer before saving an order', async () => {
        mockState.printer = undefined;
        mockState.store = undefined;
        mockGetPersistedDefaultPrinter.mockResolvedValue({
            identifier: 'persisted-printer',
        });
        mockGetStores.mockResolvedValue([
            {
                id: 'store-1',
                name: 'Persisted Store',
                timezone: 'America/New_York',
            },
        ]);

        const { getByTestId } = renderSalesScreen('order');

        await act(async () => {
            fireEvent.press(getByTestId('sales-cart-submit-order'));
            await Promise.resolve();
            await Promise.resolve();
        });

        expect(mockUpsertOrder).toHaveBeenCalledWith(
            expect.objectContaining({
                defaultPrinter: { identifier: 'persisted-printer' },
                storeInfo: expect.objectContaining({
                    id: 'store-1',
                    name: 'Persisted Store',
                }),
                skipAutoPrint: false,
            })
        );
    });

    it('shows an alert when order save fails even if the UI already reset the cart', async () => {
        mockDispatch.mockImplementation((action: any) => {
            if (action?.type === 'orders/upsert') {
                return Promise.resolve({ type: 'orders/upsert/rejected' });
            }

            return action;
        });

        const { getByTestId } = renderSalesScreen('order');

        await act(async () => {
            fireEvent.press(getByTestId('sales-cart-submit-order'));
            await Promise.resolve();
            await Promise.resolve();
        });

        expect(Alert.alert).toHaveBeenCalledWith(
            'Order could not be saved',
            'The order was not saved. Please try again.'
        );
        expect(mockDispatch).not.toHaveBeenCalledWith(
            expect.objectContaining({ type: 'cart/reset' })
        );
    });

    it('validates payment mode requires payments', () => {
        const { getByTestId } = renderSalesScreen('payment');

        fireEvent.press(getByTestId('sales-cart-submit-payment-empty'));
        const buttons = (Alert.alert as jest.Mock).mock.calls[0][2];
        buttons[1].onPress();

        expect(Alert.alert).toHaveBeenCalledWith(
            'An order cannot be marked as paid without payment information'
        );
        expect(mockGoBack).not.toHaveBeenCalled();
    });

    it('keeps the payment print path enabled when no printer is selected', async () => {
        mockState.printer = undefined;

        const { getByTestId } = renderSalesScreen('payment');

        fireEvent.press(getByTestId('sales-cart-submit-payment'));
        const buttons = (Alert.alert as jest.Mock).mock.calls[0][2];

        await act(async () => {
            await buttons[1].onPress();
        });

        expect(mockPayOrder).toHaveBeenCalledWith(
            expect.objectContaining({
                skipAutoPrint: false,
            })
        );
        expect(mockPrintReceipt).not.toHaveBeenCalled();
    });

    it('submits payment mode, navigates back to orders, and resets cart', async () => {
        const { getByTestId } = renderSalesScreen('payment');

        fireEvent.press(getByTestId('sales-cart-submit-payment'));
        const buttons = (Alert.alert as jest.Mock).mock.calls[0][2];

        await act(async () => {
            await buttons[1].onPress();
        });

        expect(mockPayOrder).toHaveBeenCalledWith(
            expect.objectContaining({
                cart: { id: 'cart-1' },
                payments: [{ type: 'cash', amount: 10 }],
                defaultPrinter: mockState.printer,
                storeInfo: mockState.store,
            })
        );
        expect(mockPayOrder.mock.calls[0][0]?.skipAutoPrint).toBe(false);
        expect(mockPrintReceipt).not.toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('Order List');
        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'cart/reset' })
        );
    });

    it('blocks order submission when tenant context is missing', async () => {
        mockState.tenantSession = {};

        const { getByTestId } = renderSalesScreen('order');

        await act(async () => {
            fireEvent.press(getByTestId('sales-cart-submit-order'));
            await Promise.resolve();
        });

        expect(Alert.alert).toHaveBeenCalledWith(
            'Tenant not ready',
            'Tenant context is not ready yet. Please try again in a moment.'
        );
        expect(mockUpsertOrder).not.toHaveBeenCalled();
    });

    it('shows an alert when payOrder does not fulfill with a payload even if the UI already navigated away', async () => {
        mockDispatch.mockImplementation((action: any) => {
            if (action?.type === 'orders/pay') {
                return Promise.resolve({ type: 'orders/pay/rejected' });
            }

            return action;
        });

        const { getByTestId } = renderSalesScreen('payment');
        fireEvent.press(getByTestId('sales-cart-submit-payment'));
        const buttons = (Alert.alert as jest.Mock).mock.calls[0][2];

        await act(async () => {
            await buttons[1].onPress();
        });

        expect(Alert.alert).toHaveBeenLastCalledWith(
            'Payment could not be completed',
            'The order is still open. Please try again.'
        );
        expect(mockNavigate).not.toHaveBeenCalledWith('Order List');
    });

    it('runs one-step checkout from order mode and prints both copies', async () => {
        mockState.settings.payFromSalesScreen = true;
        const { getByTestId } = renderSalesScreen('order');

        await act(async () => {
            fireEvent.press(getByTestId('sales-cart-submit-payment'));
            await Promise.resolve();
            await Promise.resolve();
            await Promise.resolve();
        });

        expect(mockSubmitOrderAndPay).toHaveBeenCalledWith(
            expect.objectContaining({
                skipAutoPrint: true,
                payments: [{ type: 'cash', amount: 10 }],
            })
        );
        expect(mockPrintReceipt).toHaveBeenNthCalledWith(
            1,
            expect.anything(),
            expect.anything(),
            expect.objectContaining({ copyType: 'CUSTOMER' })
        );
        expect(mockPrintReceipt).toHaveBeenNthCalledWith(
            2,
            expect.anything(),
            expect.anything(),
            expect.objectContaining({ copyType: 'MERCHANT' })
        );
        expect(mockPrintReceipt).toHaveBeenCalledTimes(2);
        expect(mockNavigate).not.toHaveBeenCalledWith('Order List');
        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'cart/reset' })
        );
    });

    it('leaves the order open when one-step payment fails after create', async () => {
        mockState.settings.payFromSalesScreen = true;
        mockDispatch.mockImplementation((action: any) => {
            if (action?.type === 'orders/submitAndPay') {
                return Promise.resolve({ type: 'orders/submitAndPay/rejected' });
            }

            return action;
        });

        const { getByTestId } = renderSalesScreen('order');

        await act(async () => {
            fireEvent.press(getByTestId('sales-cart-submit-payment'));
            await Promise.resolve();
            await Promise.resolve();
        });

        expect(Alert.alert).toHaveBeenCalledWith(
            'Payment could not be completed',
            'The order was saved as open. Please complete payment from Open Orders.'
        );
        expect(mockPrintReceipt).not.toHaveBeenCalled();
        expect(mockDispatch).not.toHaveBeenCalledWith(
            expect.objectContaining({ type: 'cart/reset' })
        );
    });

    it('dispatches cart upsert and deselect from product details dialog', () => {
        mockState.activeProduct = {
            identifier: 'i-1',
            product: mockProduct,
            quantity: 1,
        };

        const { getByTestId } = renderSalesScreen();
        fireEvent.press(getByTestId('sales-product-details-submit'));

        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'cart/upsert' })
        );
        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'cart/setActiveProduct', payload: undefined })
        );
    });

    it('does not auto-select products from the catalog entity dictionary', () => {
        mockState.productsEntities = { 'p-1': mockProduct };
        renderSalesScreen();
        expect(mockDispatch).not.toHaveBeenCalledWith(
            expect.objectContaining({ type: 'cart/upsert' })
        );
    });

    it('does not own global catalog subscriptions on unmount', () => {
        const view = renderSalesScreen();

        act(() => {
            interactionCallbacks.forEach((callback) => callback());
        });

        view.unmount();
        expect(mockProductsUnsubscribe).not.toHaveBeenCalled();
        expect(mockCategoriesUnsubscribe).not.toHaveBeenCalled();
        expect(mockSettingsUnsubscribe).not.toHaveBeenCalled();
    });

    it('shows the no-catalog state and opens back office create routes for admins', () => {
        mockState.allProducts = [];
        mockState.productsEntities = {};

        const { getByText, getByTestId } = renderSalesScreen();

        expect(getByText('No products yet')).toBeTruthy();

        fireEvent.press(getByTestId('sales-empty-add-category'));
        expect(mockNavigate).toHaveBeenCalledWith('BackOffice', {
            initialScreen: 'Categories',
            initialScreenParams: {
                initialRouteName: 'Category Form',
            },
        });

        fireEvent.press(getByTestId('sales-empty-add-product'));
        expect(mockNavigate).toHaveBeenCalledWith('BackOffice', {
            initialScreen: 'Products',
            initialScreenParams: {
                initialRouteName: 'Product Form',
            },
        });
    });
});
