/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-explicit-any */
import React from 'react';
import { Alert, InteractionManager } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';

const mockDispatch = jest.fn();
const mockGoBack = jest.fn();
const mockNavigate = jest.fn();
const mockSearch = jest.fn();
const mockSyncCategories = jest.fn();
const mockSyncProducts = jest.fn();
const mockCategoriesUnsubscribe = jest.fn();
const mockProductsUnsubscribe = jest.fn();
const mockSettingsUnsubscribe = jest.fn();
const mockPrintReceipt = jest.fn();
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
    syncCategories: (...args: unknown[]) => mockSyncCategories(...args),
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
    syncProducts: (...args: unknown[]) => mockSyncProducts(...args),
    subscribeToProductChanges: () => ({ unsubscribe: mockProductsUnsubscribe }),
}));

jest.mock('@pos/settings/data-access', () => ({
    getGlobalSettings: (state: any) => state.settings,
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
}));

jest.mock('@pos/printings/data-access', () => ({
    getDefaultPrinter: (state: any) => state.printer,
    printReceipt: (...args: unknown[]) => mockPrintReceipt(...args),
}));

jest.mock('@pos/orders/data-access', () => ({
    buildEbtAllocations: jest.fn(() => ({})),
    getLineTotal: jest.fn((quantity: number, price: number) => +(quantity * price).toFixed(2)),
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
        hasCatalogProducts,
        filteredProducts,
        onCategoryChange,
        onShowAllProducts,
        onFilterChange,
        onProductSelected,
        onProductLongPress,
        onToggleCategories,
        onOpenBackOfficeForm,
    }: any) => {
        const { View, Pressable, Text } = require('react-native');
        return (
            <View>
                <Text testID="sales-catalog-count">{filteredProducts.length}</Text>
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

jest.mock('./sales-product-dialog', () => ({
    SalesProductDialog: ({ product, onUpsertCart }: any) => {
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
            </View>
        ) : null;
    },
}));

jest.mock('../cart/cart', () => ({
    __esModule: true,
    default: ({ onSubmit }: { onSubmit: (cart: any, payments?: any[]) => void }) => {
        const { View, Pressable, Text } = require('react-native');
        return (
            <View>
                <Pressable
                    testID="sales-cart-submit-order"
                    onPress={() => onSubmit({ id: 'cart-1' })}
                >
                    <Text>Submit Order</Text>
                </Pressable>
                <Pressable
                    testID="sales-cart-submit-payment-empty"
                    onPress={() => onSubmit({ id: 'cart-1' }, undefined)}
                >
                    <Text>Submit Payment Empty</Text>
                </Pressable>
                <Pressable
                    testID="sales-cart-submit-payment"
                    onPress={() =>
                        onSubmit({ id: 'cart-1' }, [{ type: 'cash', amount: 10 }])
                    }
                >
                    <Text>Submit Payment</Text>
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
        interactionCallbacks = [];
        mockInteractionCancel = jest.fn();
        jest
            .spyOn(InteractionManager, 'runAfterInteractions')
            .mockImplementation((callback: () => void) => {
                interactionCallbacks.push(callback);
                return { cancel: mockInteractionCancel } as any;
            });
        mockSearch.mockResolvedValue({
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

            return action;
        });
        mockState = {
            activeProduct: undefined,
            allProducts: [mockProduct, mockLowInventoryProduct],
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
            settings: { enforceSalesBasedOnInventory: false },
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

    it('renders from cached state before background sync starts', () => {
        const { getByTestId } = renderSalesScreen();

        expect(getByTestId('sales-catalog-count').props.children).toBe(0);
        expect(mockSyncCategories).not.toHaveBeenCalled();
        expect(mockSyncProducts).not.toHaveBeenCalled();
        expect(mockCategoriesUnsubscribe).not.toHaveBeenCalled();
        expect(mockProductsUnsubscribe).not.toHaveBeenCalled();

        act(() => {
            interactionCallbacks.forEach((callback) => callback());
        });

        expect(mockSyncCategories).not.toHaveBeenCalled();
        expect(mockSyncProducts).not.toHaveBeenCalled();
    });

    it('dispatches cart upsert when an EA product is selected', () => {
        const { getByTestId } = renderSalesScreen();
        fireEvent.press(getByTestId('sales-product-select'));
        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'cart/upsert' })
        );
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

    it('shows availability alert when inventory enforcement blocks a product', () => {
        mockState.settings.enforceSalesBasedOnInventory = true;
        const { getByTestId } = renderSalesScreen();
        fireEvent.press(getByTestId('sales-product-select-low'));
        expect(Alert.alert).toHaveBeenCalledWith(
            'Not Available',
            'We do not have this product in inventory at the moment'
        );
    });

    it('handles search flow and barcode auto-add behavior', async () => {
        mockSearch
            .mockResolvedValueOnce({
                items: [mockProduct],
                allNumbers: false,
            })
            .mockResolvedValueOnce({
                items: [mockProduct],
                allNumbers: true,
                quantity: 7,
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
        mockSearch.mockResolvedValue({
            items: [mockProduct],
            allNumbers: false,
        });

        const { getByTestId } = renderSalesScreen();
        await act(async () => {
            fireEvent.press(getByTestId('sales-category-clear'));
            await Promise.resolve();
        });
        expect(getByTestId('sales-catalog-count').props.children).toBe(0);
        await act(async () => {
            fireEvent.press(getByTestId('sales-category-select'));
            await Promise.resolve();
        });
        expect(getByTestId('sales-catalog-count').props.children).toBe(2);
        await act(async () => {
            fireEvent.press(getByTestId('sales-category-all'));
            await Promise.resolve();
        });
        expect(getByTestId('sales-catalog-count').props.children).toBe(2);

        expect(mockSearch).toHaveBeenCalledWith(
            mockState.allProducts,
            expect.objectContaining({ categoryId: 'c-1', onlyActive: true })
        );
    });

    it('submits order mode through parallel print/save and resets cart after save success', async () => {
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
        expect(mockUpsertOrder.mock.calls[0][0]?.skipAutoPrint).toBe(true);
        expect(mockPrintReceipt).toHaveBeenCalledWith(
            mockState.store,
            mockState.printer,
            expect.objectContaining({
                id: 'cart-1',
                orderNo: '51-EMP-260326-0001',
            }),
            expect.objectContaining({
                copyType: 'CUSTOMER',
                orderNo: '51-EMP-260326-0001',
            })
        );
        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'cart/reset' })
        );
        expect(Alert.alert).not.toHaveBeenCalled();
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
            'The order was not saved. Please try again. The receipt may have already been printed.'
        );
        expect(mockDispatch).toHaveBeenCalledWith(
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

    it('shows printer requirements immediately and skips fallback printing when no printer is selected', async () => {
        mockState.printer = undefined;

        const { getByTestId } = renderSalesScreen('payment');

        fireEvent.press(getByTestId('sales-cart-submit-payment'));
        const buttons = (Alert.alert as jest.Mock).mock.calls[0][2];

        await act(async () => {
            await buttons[1].onPress();
        });

        expect(Alert.alert).toHaveBeenCalledWith(
            'Printing unavailable',
            'Store and printer should be available in order to print.'
        );
        expect(mockPayOrder).toHaveBeenCalledWith(
            expect.objectContaining({
                skipAutoPrint: true,
            })
        );
        expect(mockPrintReceipt).not.toHaveBeenCalled();
    });

    it('submits payment mode with parallel print/save, navigates back to orders, and resets cart', async () => {
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
        expect(mockPayOrder.mock.calls[0][0]?.skipAutoPrint).toBe(true);
        expect(mockPrintReceipt).toHaveBeenCalledWith(
            mockState.store,
            mockState.printer,
            { id: 'cart-1' },
            expect.objectContaining({ copyType: 'MERCHANT' })
        );
        expect(mockNavigate).toHaveBeenCalledWith('Order List');
        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'cart/reset' })
        );
    });

    it('shows a print failure alert when payment saves but printing fails', async () => {
        mockPrintReceipt.mockRejectedValueOnce(new Error('printer offline'));

        const { getByTestId } = renderSalesScreen('payment');
        fireEvent.press(getByTestId('sales-cart-submit-payment'));
        const buttons = (Alert.alert as jest.Mock).mock.calls[0][2];

        await act(async () => {
            await buttons[1].onPress();
        });

        expect(Alert.alert).toHaveBeenLastCalledWith(
            'Receipt could not be printed',
            'The payment was saved, but the receipt could not be printed.'
        );
        expect(mockNavigate).toHaveBeenCalledWith('Order List');
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
            'The order is still open. Please try again. The receipt may have already been printed.'
        );
        expect(mockNavigate).toHaveBeenCalledWith('Order List');
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

    it('unsubscribes background subscriptions on unmount', () => {
        const view = renderSalesScreen();

        act(() => {
            interactionCallbacks.forEach((callback) => callback());
        });

        view.unmount();
        expect(mockInteractionCancel).toHaveBeenCalled();
        expect(mockCategoriesUnsubscribe).toHaveBeenCalled();
        expect(mockProductsUnsubscribe).toHaveBeenCalled();
        expect(mockSettingsUnsubscribe).toHaveBeenCalled();
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
