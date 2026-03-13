/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-explicit-any */
import React from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { act, fireEvent, render } from '@testing-library/react-native';

const mockDispatch = jest.fn();
const mockGoBack = jest.fn();
const mockSearch = jest.fn();
const mockCategoriesUnsubscribe = jest.fn();
const mockProductsUnsubscribe = jest.fn();
const mockSettingsUnsubscribe = jest.fn();

const mockProduct = {
    id: 'p-1',
    name: 'Apple',
    price: 2.5,
    unitOfMeasure: 'EA',
    quantity: 100,
    isActive: true,
    productCategoryId: 'c-1',
} as any;

const mockLowInventoryProduct = {
    ...mockProduct,
    id: 'p-2',
    quantity: 0,
} as any;

let mockState: any;

jest.mock('react-redux', () => ({
    useDispatch: () => mockDispatch,
    useSelector: (selector: (state: any) => unknown) => selector(mockState),
}));

jest.mock('@pos/categories/data-access', () => ({
    subscribeToCategoryChanges: () => ({ unsubscribe: mockCategoriesUnsubscribe }),
}));

jest.mock('@pos/products/data-access', () => ({
    selectFilteredList: (state: any) => state.filteredList,
    selectAllProducts: (state: any) => state.allProducts,
    ProductService: {
        search: (...args: unknown[]) => mockSearch(...args),
    },
    subscribeToProductChanges: () => ({ unsubscribe: mockProductsUnsubscribe }),
}));

jest.mock('@pos/settings/data-access', () => ({
    getGlobalSettings: (state: any) => state.settings,
    subscribeToGlobalSettingsChanges: () => ({
        unsubscribe: mockSettingsUnsubscribe,
    }),
}));

jest.mock('@pos/store-info/data-access', () => ({
    selectStore: (state: any) => state.store,
}));

jest.mock('@pos/printings/data-access', () => ({
    getDefaultPrinter: (state: any) => state.printer,
}));

jest.mock('@pos/orders/data-access', () => ({
    upsertOrder: (payload: unknown) => ({ type: 'orders/upsert', payload }),
    payOrder: (payload: unknown) => ({ type: 'orders/pay', payload }),
}));

jest.mock('@pos/sales/data-access', () => ({
    MINIMUM_INVENTORY_FOR_SALE: 1,
    cartActions: {
        select: (payload: unknown) => ({ type: 'cart/select', payload }),
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

jest.mock('../category-selection/category-selection', () => ({
    __esModule: true,
    default: ({ onSelected }: { onSelected: (item?: any) => Promise<void> }) =>
        (() => {
            const { View, Pressable, Text } = require('react-native');
            return (
                <View>
                    <Pressable
                        testID="sales-category-clear"
                        onPress={() => onSelected(undefined)}
                    >
                        <Text>Clear Category</Text>
                    </Pressable>
                    <Pressable
                        testID="sales-category-select"
                        onPress={() => onSelected({ id: 'c-1' })}
                    >
                        <Text>Select Category</Text>
                    </Pressable>
                </View>
            );
        })(),
}));

jest.mock('../product-search/product-search', () => ({
    ProductSearch: (() => {
        const React = require('react');
        const { View, Pressable, Text } = require('react-native');
        return React.forwardRef(
            (
                { onFilterChange }: { onFilterChange: (text: string) => Promise<string | undefined> },
                _ref: React.ForwardedRef<any>
            ) => (
                <View>
                    <Pressable
                        testID="sales-search-submit"
                        onPress={() => onFilterChange('apple')}
                    >
                        <Text>Search</Text>
                    </Pressable>
                    <Pressable
                        testID="sales-search-barcode"
                        onPress={() => onFilterChange('12345')}
                    >
                        <Text>Search Barcode</Text>
                    </Pressable>
                    <Pressable testID="sales-search-empty" onPress={() => onFilterChange('')}>
                        <Text>Search Empty</Text>
                    </Pressable>
                </View>
            )
        );
    })(),
}));

jest.mock('../product-selection/product-selection', () => ({
    __esModule: true,
    default: ({ onSelected }: { onSelected: (item: any) => void }) =>
        (() => {
            const { View, Pressable, Text } = require('react-native');
            return (
                <View>
                    <Pressable
                        testID="sales-product-select"
                        onPress={() => onSelected(mockProduct)}
                    >
                        <Text>Product</Text>
                    </Pressable>
                    <Pressable
                        testID="sales-product-select-low"
                        onPress={() => onSelected(mockLowInventoryProduct)}
                    >
                        <Text>Low Stock Product</Text>
                    </Pressable>
                </View>
            );
        })(),
}));

jest.mock('../cart/cart', () => ({
    __esModule: true,
    default: ({ onSubmit }: { onSubmit: (cart: any, payments?: any[]) => void }) =>
        (() => {
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
                            onSubmit({ id: 'cart-1' }, [{ method: 'cash', amount: 10 }])
                        }
                    >
                        <Text>Submit Payment</Text>
                    </Pressable>
                </View>
            );
        })(),
}));

jest.mock('../product-details/product-details', () => ({
    __esModule: true,
    default: ({ upsertCart }: { upsertCart: (item: any) => void }) =>
        (() => {
            const { Pressable, Text } = require('react-native');
            return (
                <Pressable
                    testID="sales-product-details-submit"
                    onPress={() =>
                        upsertCart({
                            identifier: 'i-2',
                            product: mockProduct,
                            quantity: 3,
                        })
                    }
                >
                    <Text>Details</Text>
                </Pressable>
            );
        })(),
}));

const { SalesScreen } = require('./sales-screen');

describe('SalesScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSearch.mockResolvedValue({
            items: [mockProduct],
            allNumbers: false,
            quantity: undefined,
        });
        mockState = {
            activeProduct: undefined,
            filteredList: {},
            allProducts: [mockProduct, mockLowInventoryProduct],
            store: { id: 's-1' },
            printer: { id: 'printer-1' },
            settings: { enforceSalesBasedOnInventory: false },
        };
        jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    });

    afterEach(() => {
        (Alert.alert as jest.Mock).mockRestore?.();
    });

    const renderSalesScreen = (mode: 'order' | 'payment' = 'order') =>
        render(
            <SalesScreen
                navigation={{ goBack: mockGoBack } as any}
                route={{ key: 'Sales', name: 'Sales', params: { mode } } as any}
            />
        );

    it('dispatches cart select when a product is selected', () => {
        const { getByTestId } = renderSalesScreen();
        fireEvent.press(getByTestId('sales-product-select'));
        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'cart/select' })
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
    });

    it('handles category changes with and without selected category', async () => {
        mockSearch.mockResolvedValue({
            items: [mockProduct],
            allNumbers: false,
        });

        const { getByTestId } = renderSalesScreen();
        await act(async () => {
            fireEvent.press(getByTestId('sales-category-clear'));
            await Promise.resolve();
        });
        await act(async () => {
            fireEvent.press(getByTestId('sales-category-select'));
            await Promise.resolve();
        });

        expect(mockSearch).toHaveBeenCalledWith(
            mockState.allProducts,
            expect.objectContaining({ categoryId: 'c-1', onlyActive: true })
        );
    });

    it('submits order mode cart and resets cart on confirmation', () => {
        const { getByTestId } = renderSalesScreen('order');

        fireEvent.press(getByTestId('sales-cart-submit-order'));

        const buttons = (Alert.alert as jest.Mock).mock.calls[0][2];
        buttons[1].onPress();

        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'orders/upsert' })
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

    it('submits payment mode, goes back, and resets cart', () => {
        const { getByTestId } = renderSalesScreen('payment');

        fireEvent.press(getByTestId('sales-cart-submit-payment'));
        const buttons = (Alert.alert as jest.Mock).mock.calls[0][2];
        buttons[1].onPress();

        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'orders/pay' })
        );
        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'cart/reset' })
        );
        expect(mockGoBack).toHaveBeenCalled();
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
            expect.objectContaining({ type: 'cart/select', payload: undefined })
        );
    });

    it('auto-selects single filtered product from dictionary', () => {
        mockState.filteredList = { 'p-1': mockProduct };
        renderSalesScreen();
        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'cart/select' })
        );
    });

    it('unsubscribes subscriptions on unmount', () => {
        const view = renderSalesScreen();
        view.unmount();
        expect(mockCategoriesUnsubscribe).toHaveBeenCalled();
        expect(mockProductsUnsubscribe).toHaveBeenCalled();
        expect(mockSettingsUnsubscribe).toHaveBeenCalled();
    });
});
