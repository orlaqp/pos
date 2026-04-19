/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-explicit-any */
import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

const mockDispatch = jest.fn();
const mockOnSubmit = jest.fn();
const mockOnInteractionComplete = jest.fn();
const mockSubscribeDefinitionChanges = jest.fn();

let mockCartState: any;
let mockEmployeeState: any;
let mockStoreState: any;
let mockStationState: any;

jest.mock('react-redux', () => ({
    useDispatch: () => mockDispatch,
    useSelector: (selector: (state: any) => unknown) =>
        selector({
            cart: mockCartState,
            employee: mockEmployeeState,
            store: mockStoreState,
            station: mockStationState,
        }),
}));

jest.mock('@pos/sales/data-access', () => ({
    cartActions: {
        select: (item: unknown) => ({ type: 'cart/select', payload: item }),
        setActiveProduct: (item: unknown) => ({
            type: 'cart/setActiveProduct',
            payload: item,
        }),
        removeProduct: (item: unknown) => ({
            type: 'cart/removeProduct',
            payload: item,
        }),
        upsert: (item: unknown) => ({ type: 'cart/upsert', payload: item }),
        addPromoCode: (promo: unknown) => ({ type: 'cart/addPromoCode', payload: promo }),
        removePromoCode: (code: string) => ({ type: 'cart/removePromoCode', payload: code }),
        applyManualDiscount: (request: unknown) => ({
            type: 'cart/applyManualDiscount',
            payload: request,
        }),
        applyPriceOverride: (request: unknown) => ({
            type: 'cart/applyPriceOverride',
            payload: request,
        }),
        removePricingAdjustment: (payload: unknown) => ({
            type: 'cart/removePricingAdjustment',
            payload,
        }),
        setDefinitions: (definitions: unknown) => ({
            type: 'cart/setDefinitions',
            payload: definitions,
        }),
        setPolicy: (policy: unknown) => ({ type: 'cart/setPolicy', payload: policy }),
        setPricingContext: (payload: unknown) => ({ type: 'cart/setPricingContext', payload }),
    },
    selectCart: (state: any) => state.cart,
}));

jest.mock('@pos/employees/data-access', () => ({
    selectLoginEmployee: (state: any) => state.employee,
}));

jest.mock('@pos/store-info/data-access', () => ({
    selectStore: (state: any) => state.store,
}));

jest.mock('@pos/settings/data-access', () => ({
    selectStation: (state: any) => state.station,
}));

jest.mock('@pos/auth/data-access', () => ({
    Role: {
        Checks: 'Receive Check Payment',
        Discounts: 'Discounts',
    },
}));

jest.mock('@pos/shared/ui-native', () => ({
    UICard: ({ children }: { children: React.ReactNode }) => {
        const { View } = require('react-native');
        return <View>{children}</View>;
    },
    UIEmptyState: ({ text }: { text: string }) => {
        const { Text } = require('react-native');
        return <Text>{text}</Text>;
    },
}));

jest.mock('@pos/discounts/data-access', () => ({
    DiscountService: {
        listDefinitions: jest.fn().mockResolvedValue([]),
        subscribeDefinitionChanges: mockSubscribeDefinitionChanges,
    },
}));

jest.mock('@rneui/themed', () => ({
    useTheme: () => ({
        theme: {
            colors: {
                primary: '#4aa3eb',
                grey0: '#ffffff',
                grey1: '#d6dde6',
                grey2: '#9aa9bb',
                grey3: '#7c8a9b',
                grey4: '#5a6573',
                grey5: '#2a313b',
                black: '#f5f7fb',
                background: '#0b0f14',
            },
        },
    }),
    Button: ({
        title,
        onPress,
        testID,
    }: {
        title: string;
        onPress: () => void;
        testID?: string;
    }) => (
        (() => {
            const { Pressable, Text } = require('react-native');
            return (
                <Pressable onPress={onPress} testID={testID || title}>
                    <Text>{title}</Text>
                </Pressable>
            );
        })()
    ),
    Dialog: ({
        isVisible,
        onBackdropPress,
        children,
    }: {
        isVisible?: boolean;
        onBackdropPress?: () => void;
        children: React.ReactNode;
    }) =>
        isVisible ? (
            (() => {
                const { View, Pressable, Text } = require('react-native');
                return (
                    <View>
                        {children}
                        <Pressable
                            testID="cart-payment-backdrop"
                            onPress={onBackdropPress}
                        >
                            <Text>Close</Text>
                        </Pressable>
                    </View>
                );
            })()
        ) : null,
}));

jest.mock('../cart-line/cart-line', () => ({
    __esModule: true,
    default: ({
        item,
        onOpenDetails,
        onSelect,
        onRemove,
        onIncrement,
        onDecrement,
    }: {
        item: { product: { name: string } };
        onOpenDetails: (item: any) => void;
        onSelect: (item: any) => void;
        onRemove: (item: any) => void;
        onIncrement?: (item: any) => void;
        onDecrement?: (item: any) => void;
    }) =>
        (() => {
            const { View, Text, Pressable } = require('react-native');
            return (
                <View>
                    <Text>{item.product.name}</Text>
                    <Pressable testID="cart-line-open-details" onPress={() => onOpenDetails(item)}>
                        <Text>OpenDetails</Text>
                    </Pressable>
                    <Pressable testID="cart-line-select" onLongPress={() => onSelect(item)}>
                        <Text>Select</Text>
                    </Pressable>
                    <Pressable testID="cart-line-remove" onPress={() => onRemove(item)}>
                        <Text>Remove</Text>
                    </Pressable>
                    <Pressable testID="cart-line-increment" onPress={() => onIncrement?.(item)}>
                        <Text>Increment</Text>
                    </Pressable>
                    <Pressable testID="cart-line-decrement" onPress={() => onDecrement?.(item)}>
                        <Text>Decrement</Text>
                    </Pressable>
                </View>
            );
        })(),
}));

jest.mock('../cart-payment/cart-payment', () => ({
    __esModule: true,
    default: ({ onPaymentEntered }: { onPaymentEntered: (payments: any[]) => void }) =>
        (() => {
            const { Pressable, Text } = require('react-native');
            return (
                <Pressable
                    testID="cart-payment-entered"
                    onPress={() => onPaymentEntered([{ method: 'cash', amount: 5 }])}
                >
                    <Text>CartPayment</Text>
                </Pressable>
            );
        })(),
}));

const { Cart } = require('./cart');
const { DiscountService } = require('@pos/discounts/data-access');

describe('Cart', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
        mockSubscribeDefinitionChanges.mockImplementation((callback: (definitions: any[]) => void) => {
            callback([]);
            return jest.fn();
        });
        mockCartState = {
            items: [
                {
                    identifier: 'i-1',
                    quantity: 2,
                    product: {
                        id: 'p-1',
                        name: 'Apple',
                        price: 2.5,
                        unitOfMeasure: 'EA',
                        isEBTEligible: true,
                    },
                },
            ],
            footer: {
                total: 5,
                subtotal: 5,
                baseSubtotal: 5,
                tax: 0,
                discount: 0,
                savingsTotal: 0,
                lineDiscountTotal: 0,
                orderDiscountTotal: 0,
                pricingSource: 'OFFLINE_LOCAL',
                reconciliationStatus: 'PENDING',
            },
            definitions: [],
            promoCodes: [],
            manualDiscounts: [],
            priceOverrides: [],
            approvalEvents: [],
        };
        mockEmployeeState = { id: 'employee-1', roles: ['Receive Check Payment', 'Discounts'] };
        mockStoreState = { id: 'store-1', timezone: 'America/New_York' };
        mockStationState = { stationNumber: '25' };
        DiscountService.listDefinitions.mockResolvedValue([]);
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    const renderCart = (
        mode: 'order' | 'payment',
        options?: { preferPayFromSalesScreen?: boolean }
    ) => {
        return render(
            <Cart
                mode={mode}
                preferPayFromSalesScreen={options?.preferPayFromSalesScreen}
                onSubmit={mockOnSubmit}
                products={[{ id: 'p-1', quantity: 100 } as any]}
                onInteractionComplete={mockOnInteractionComplete}
            />
        );
    };

    it('shows empty state when cart has no items', () => {
        mockCartState.items = [];
        const { getByText } = renderCart('order');
        expect(getByText('Cart is empty')).toBeTruthy();
    });

    it('uses the configured station number in pricing context', async () => {
        renderCart('order');

        await waitFor(() =>
            expect(mockDispatch).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'cart/setPricingContext',
                    payload: expect.objectContaining({
                        storeId: 'store-1',
                        timezone: 'America/New_York',
                        stationId: '25',
                    }),
                })
            )
        );
    });

    it('opens details on press and select/remove from line actions', () => {
        const { getByTestId } = renderCart('order');
        expect(getByTestId('cart-lines-scroll').props.keyboardShouldPersistTaps).toBe(
            'handled'
        );
        fireEvent.press(getByTestId('cart-line-open-details'));
        fireEvent(getByTestId('cart-line-select'), 'longPress');
        fireEvent.press(getByTestId('cart-line-remove'));
        fireEvent.press(getByTestId('cart-line-increment'));
        fireEvent.press(getByTestId('cart-line-decrement'));
        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'cart/setActiveProduct' })
        );
        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'cart/select' })
        );
        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'cart/removeProduct' })
        );
        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'cart/upsert' })
        );
        expect(mockOnInteractionComplete).toHaveBeenCalledTimes(4);
    });

    it('deselects a cart line when the selected row is tapped again', () => {
        mockCartState.selected = mockCartState.items[0];
        const { getByTestId } = renderCart('order');

        fireEvent(getByTestId('cart-line-select'), 'longPress');

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'cart/select',
            payload: undefined,
        });
        expect(mockOnInteractionComplete).toHaveBeenCalledTimes(1);
    });

    it('opens order summary instead of submitting directly in order mode', () => {
        const { getByText, getAllByText } = renderCart('order');
        fireEvent.press(getByText(/Print Order/));
        expect(getByText('Order summary')).toBeTruthy();
        expect(getAllByText('Apple').length).toBeGreaterThan(1);
        expect(mockOnSubmit).not.toHaveBeenCalled();
        expect(mockOnInteractionComplete).not.toHaveBeenCalled();
    });

    it('closes order summary without submitting', () => {
        const { getByText, queryByText } = renderCart('order');
        fireEvent.press(getByText(/Print Order/));
        fireEvent.press(getByText('Back to cart'));

        expect(queryByText('Order summary')).toBeFalsy();
        expect(mockOnSubmit).not.toHaveBeenCalled();
        expect(mockOnInteractionComplete).toHaveBeenCalledTimes(1);
    });

    it('submits from order summary print action', () => {
        const { getByText, getByTestId } = renderCart('order');
        fireEvent.press(getByText(/Print Order/));
        fireEvent.press(getByTestId('order-summary-print-button'));

        expect(mockOnSubmit).toHaveBeenCalledWith(
            mockCartState,
            undefined,
            expect.objectContaining({ intent: 'save_open_order' })
        );
        expect(mockOnInteractionComplete).toHaveBeenCalledTimes(1);
    });

    it('opens payment modal in payment mode and submits payments', () => {
        const { getByText, getByTestId } = renderCart('payment');
        fireEvent.press(getByText(/Receive Payment/));
        expect(mockOnInteractionComplete).not.toHaveBeenCalled();
        fireEvent.press(getByTestId('cart-payment-entered'));
        expect(mockOnSubmit).toHaveBeenCalledWith(
            mockCartState,
            expect.arrayContaining([expect.objectContaining({ method: 'cash' })]),
            expect.objectContaining({ intent: 'receive_payment' })
        );
        expect(mockOnInteractionComplete).toHaveBeenCalledTimes(1);
    });

    it('shows receive payment as primary and keeps save open order when pay from sales is enabled', () => {
        const { getByText, getByTestId } = renderCart('order', {
            preferPayFromSalesScreen: true,
        });

        expect(getByText(/Receive Payment/)).toBeTruthy();
        expect(getByTestId('cart-save-open-order-button')).toBeTruthy();
    });

    it('opens payment modal from order mode when pay from sales is enabled', () => {
        const { getByText, getByTestId } = renderCart('order', {
            preferPayFromSalesScreen: true,
        });

        fireEvent.press(getByText(/Receive Payment/));
        fireEvent.press(getByTestId('cart-payment-entered'));

        expect(mockOnSubmit).toHaveBeenCalledWith(
            mockCartState,
            expect.arrayContaining([expect.objectContaining({ method: 'cash' })]),
            expect.objectContaining({ intent: 'receive_payment' })
        );
    });

    it('closes payment modal on backdrop press', () => {
        const { getByText, getByTestId, queryByText } = renderCart('payment');
        fireEvent.press(getByText(/Receive Payment/));
        expect(queryByText('CartPayment')).toBeTruthy();
        expect(mockOnInteractionComplete).not.toHaveBeenCalled();
        fireEvent.press(getByTestId('cart-payment-backdrop'));
        expect(queryByText('CartPayment')).toBeFalsy();
        expect(mockOnInteractionComplete).toHaveBeenCalledTimes(1);
    });

    it('opens the promo dialog and dispatches a promo code', () => {
        const { getByText, getByPlaceholderText } = renderCart('order');
        fireEvent.press(getByText('Show actions'));
        fireEvent.press(getByText('Promo'));
        fireEvent.changeText(getByPlaceholderText('SPRING10'), 'save5');
        fireEvent.press(getByText('Apply'));
        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'cart/addPromoCode',
                payload: { code: 'SAVE5' },
            })
        );
        expect(mockOnInteractionComplete).toHaveBeenCalledTimes(2);
    });

    it('restores interaction completion when the promo dialog is canceled', () => {
        const { getByText } = renderCart('order');

        fireEvent.press(getByText('Show actions'));
        fireEvent.press(getByText('Promo'));
        fireEvent.press(getByText('Cancel'));

        expect(mockOnInteractionComplete).toHaveBeenCalledTimes(2);
    });

    it('hides the discount card when the logged-in employee does not have the discounts role', () => {
        mockEmployeeState = { roles: ['Receive Check Payment'] };

        const { queryByText } = renderCart('order');

        expect(queryByText('Discounts')).toBeFalsy();
        expect(queryByText('Show actions')).toBeFalsy();
    });

    it('shows the discount card when the logged-in employee has the discounts role', () => {
        const { getByText } = renderCart('order');

        expect(getByText('Discounts')).toBeTruthy();
        expect(getByText('Show actions')).toBeTruthy();
    });

    it('shows both line and order discounts when stacked pricing applies', () => {
        mockCartState.footer.discount = 14;
        mockCartState.footer.savingsTotal = 14;
        mockCartState.appliedDiscountSummary = {
            lineSummaries: [
                {
                    lineId: 'i-1',
                    discounts: [
                        {
                            discountApplicationId: 'line-1',
                            name: '20% Off Aceites',
                            discountAmount: 10,
                            applicationType: 'AUTOMATIC',
                        },
                    ],
                    lineDiscountTotal: 10,
                    allocatedOrderDiscountTotal: 4,
                    lineTotalBeforeTax: 35.98,
                },
            ],
            orderLevelAdjustments: [
                {
                    discountApplicationId: 'order-1',
                    name: '10% Off 25',
                    discountAmount: 4,
                },
            ],
            warnings: [],
        };

        const { getByText } = renderCart('order');

        expect(getByText('Saved $14.00')).toBeTruthy();
        expect(getByText('2 discounts applied')).toBeTruthy();
        expect(getByText('Line · 20% Off Aceites: -$10.00')).toBeTruthy();
        expect(getByText('Order · 10% Off 25: -$4.00')).toBeTruthy();
    });

    it('subscribes to live discount definition updates while sales is open', async () => {
        let listener: ((definitions: any[]) => void) | undefined;
        mockSubscribeDefinitionChanges.mockImplementation((callback: (definitions: any[]) => void) => {
            listener = callback;
            return jest.fn();
        });

        renderCart('order');

        await waitFor(() => {
            expect(mockSubscribeDefinitionChanges).toHaveBeenCalledTimes(1);
        });

        mockDispatch.mockClear();

        listener?.([
            {
                id: 'discount-1',
                name: 'Live 10% Off',
                status: 'ACTIVE',
                type: 'AUTOMATIC',
                method: 'PERCENT',
                scope: 'ORDER',
                stackMode: 'STACKABLE',
                value: 10,
            },
        ]);

        await waitFor(() => {
            expect(mockDispatch).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'cart/setDefinitions',
                    payload: [
                        expect.objectContaining({
                            id: 'discount-1',
                            name: 'Live 10% Off',
                            status: 'ACTIVE',
                            type: 'AUTOMATIC',
                            method: 'PERCENT',
                            scope: 'ORDER',
                            stackMode: 'STACKABLE',
                        }),
                    ],
                })
            );
        });
    });

    it('drops only non-active-status definitions from live sales pricing updates', async () => {
        let listener: ((definitions: any[]) => void) | undefined;
        mockSubscribeDefinitionChanges.mockImplementation((callback: (definitions: any[]) => void) => {
            listener = callback;
            return jest.fn();
        });

        renderCart('order');

        await waitFor(() => {
            expect(mockSubscribeDefinitionChanges).toHaveBeenCalledTimes(1);
        });

        mockDispatch.mockClear();

        listener?.([
            {
                id: 'discount-disabled-status',
                name: 'Inactive 10% Off',
                status: 'INACTIVE',
                type: 'AUTOMATIC',
                method: 'PERCENT',
                scope: 'ORDER',
                stackMode: 'STACKABLE',
                value: 10,
                active: true,
            },
            {
                id: 'discount-disabled-flag',
                name: 'Disabled flag 10% Off',
                status: 'ACTIVE',
                type: 'AUTOMATIC',
                method: 'PERCENT',
                scope: 'ORDER',
                stackMode: 'STACKABLE',
                value: 10,
                active: false,
            },
            {
                id: 'discount-active',
                name: 'Live 10% Off',
                status: 'ACTIVE',
                type: 'AUTOMATIC',
                method: 'PERCENT',
                scope: 'ORDER',
                stackMode: 'STACKABLE',
                value: 10,
                active: true,
            },
        ]);

        await waitFor(() => {
            expect(mockDispatch).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'cart/setDefinitions',
                    payload: [
                        expect.objectContaining({
                            id: 'discount-disabled-flag',
                            name: 'Disabled flag 10% Off',
                        }),
                        expect.objectContaining({
                            id: 'discount-active',
                            name: 'Live 10% Off',
                        }),
                    ],
                })
            );
        });
    });

    it('blocks submit when product inventory is insufficient', () => {
        const { getByText } = render(
            <Cart
                mode="order"
                onSubmit={mockOnSubmit}
                products={[{ id: 'p-1', quantity: 1 } as any]}
                onInteractionComplete={mockOnInteractionComplete}
            />
        );
        fireEvent.press(getByText(/Print Order/));
        expect(Alert.alert).toHaveBeenCalledWith(
            'Product(s) not available',
            expect.stringContaining('p-1')
        );
        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('applies a manual amount discount without requiring a percent value', async () => {
        mockCartState.selected = mockCartState.items[0];
        const { getByText, getByPlaceholderText } = renderCart('order');

        fireEvent.press(getByText('Show actions'));
        fireEvent.press(getByText('Manual'));
        fireEvent.press(getByText('Amount'));
        fireEvent.changeText(getByPlaceholderText('5.00'), '4.25');
        fireEvent.press(getByText('Apply'));

        await waitFor(() => {
            expect(mockDispatch).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'cart/applyManualDiscount',
                    payload: expect.objectContaining({
                        method: 'AMOUNT',
                        value: 4.25,
                    }),
                })
            );
        });
        expect(mockOnInteractionComplete).toHaveBeenCalledTimes(2);
    });

    it('restores interaction completion when the manual discount dialog is canceled', () => {
        mockCartState.selected = mockCartState.items[0];
        const { getByText } = renderCart('order');

        fireEvent.press(getByText('Show actions'));
        fireEvent.press(getByText('Manual'));
        fireEvent.press(getByText('Cancel'));

        expect(mockOnInteractionComplete).toHaveBeenCalledTimes(2);
    });

    it('submits a manual percent discount without an approval pin', async () => {
        mockCartState.selected = mockCartState.items[0];
        const { getByText, getByPlaceholderText } = renderCart('order');

        fireEvent.press(getByText('Show actions'));
        fireEvent.press(getByText('Manual'));
        fireEvent.changeText(getByPlaceholderText('10'), '10');
        fireEvent.press(getByText('Apply'));

        await waitFor(() => {
            expect(mockDispatch).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'cart/applyManualDiscount',
                    payload: expect.objectContaining({
                        method: 'PERCENT',
                        value: 10,
                    }),
                })
            );
        });
        expect(mockOnInteractionComplete).toHaveBeenCalledTimes(2);
    });

    it('applies a saved manual discount definition for the selected line', async () => {
        mockCartState.selected = mockCartState.items[0];
        mockCartState.definitions = [
            {
                id: 'manual-def-1',
                name: '0.1% for Test items',
                type: 'MANUAL',
                method: 'PERCENT',
                scope: 'LINE',
                value: 0.1,
                status: 'ACTIVE',
                stackMode: 'STACKABLE',
                active: true,
                minSubtotal: 4,
                applicableProductIds: ['p-1'],
            },
        ];

        const { getByText } = renderCart('order');

        fireEvent.press(getByText('Show actions'));
        fireEvent.press(getByText('Manual'));
        fireEvent.press(getByText('0.1% for Test items'));
        fireEvent.press(getByText('Apply'));

        await waitFor(() => {
            expect(mockDispatch).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'cart/applyManualDiscount',
                    payload: expect.objectContaining({
                        definitionId: 'manual-def-1',
                        name: '0.1% for Test items',
                        method: 'PERCENT',
                        value: 0.1,
                        lineId: 'i-1',
                    }),
                })
            );
        });
    });

    it('does not offer a line manual discount when only the order subtotal meets the minimum', async () => {
        mockCartState.selected = mockCartState.items[0];
        mockCartState.items.push({
            identifier: 'i-2',
            quantity: 1,
            product: {
                id: 'p-2',
                name: 'Banana',
                price: 20,
                unitOfMeasure: 'EA',
                isEBTEligible: true,
            },
        });
        mockCartState.footer.baseSubtotal = 25;
        mockCartState.footer.subtotal = 25;
        mockCartState.footer.total = 25;
        mockCartState.definitions = [
            {
                id: 'manual-def-1',
                name: '0.1% for Test items',
                type: 'MANUAL',
                method: 'PERCENT',
                scope: 'LINE',
                value: 0.1,
                status: 'ACTIVE',
                stackMode: 'STACKABLE',
                active: true,
                minSubtotal: 10,
                applicableProductIds: ['p-1'],
            },
        ];

        const { getByText, queryByText } = renderCart('order');

        fireEvent.press(getByText('Show actions'));
        fireEvent.press(getByText('Manual'));

        await waitFor(() => {
            expect(queryByText('0.1% for Test items')).toBeNull();
        });
    });

    it('does not render the approval pin field for manual discounts', () => {
        mockCartState.selected = mockCartState.items[0];
        const { getByText, queryByPlaceholderText } = renderCart('order');

        fireEvent.press(getByText('Show actions'));
        fireEvent.press(getByText('Manual'));

        expect(queryByPlaceholderText('Approver PIN')).toBeNull();
    });

    it('submits a price override and reports interaction completion', async () => {
        mockCartState.selected = mockCartState.items[0];
        const { getByText, getByPlaceholderText } = renderCart('order');

        fireEvent.press(getByText('Show actions'));
        fireEvent.press(getByText('Override'));
        fireEvent.changeText(getByPlaceholderText('2.50'), '1.99');
        fireEvent.press(getByText('Apply'));

        await waitFor(() => {
            expect(mockDispatch).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'cart/applyPriceOverride',
                    payload: expect.objectContaining({
                        finalPrice: 1.99,
                    }),
                })
            );
        });
        expect(mockOnInteractionComplete).toHaveBeenCalledTimes(2);
    });

    it('does not render the approval pin field for price overrides', () => {
        mockCartState.selected = mockCartState.items[0];
        const { getByText, queryByPlaceholderText } = renderCart('order');

        fireEvent.press(getByText('Show actions'));
        fireEvent.press(getByText('Override'));

        expect(queryByPlaceholderText('Approver PIN')).toBeNull();
    });

    it('restores interaction completion when the override dialog is canceled', () => {
        mockCartState.selected = mockCartState.items[0];
        const { getByText } = renderCart('order');

        fireEvent.press(getByText('Show actions'));
        fireEvent.press(getByText('Override'));
        fireEvent.press(getByText('Cancel'));

        expect(mockOnInteractionComplete).toHaveBeenCalledTimes(2);
    });

    it('reports interaction completion when discount actions are toggled', () => {
        const { getByText } = renderCart('order');

        fireEvent.press(getByText('Show actions'));

        expect(mockOnInteractionComplete).toHaveBeenCalledTimes(1);
    });

    it('reports interaction completion when removing a promo code', () => {
        mockCartState.promoCodes = [{ code: 'SAVE5' }];
        mockCartState.footer.discount = 1;
        const { getByText } = renderCart('order');

        fireEvent.press(getByText('SAVE5 ×'));

        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'cart/removePromoCode',
                payload: 'SAVE5',
            })
        );
        expect(mockOnInteractionComplete).toHaveBeenCalledTimes(1);
    });

    it('reports interaction completion when clearing line pricing', () => {
        mockCartState.selected = mockCartState.items[0];
        mockCartState.manualDiscounts = [
            {
                scope: 'LINE',
                lineId: mockCartState.items[0].identifier,
            },
        ];
        const { getByText } = renderCart('order');

        fireEvent.press(getByText('Show actions'));
        fireEvent.press(getByText('Clear line pricing'));

        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'cart/removePricingAdjustment',
                payload: { lineId: mockCartState.items[0].identifier },
            })
        );
        expect(mockOnInteractionComplete).toHaveBeenCalledTimes(2);
    });

    it('shows clear line pricing without expanding actions when a selected line already has an adjustment', () => {
        mockCartState.selected = mockCartState.items[0];
        mockCartState.manualDiscounts = [
            {
                scope: 'LINE',
                lineId: mockCartState.items[0].identifier,
            },
        ];

        const { getByText } = renderCart('order');

        expect(getByText('Clear line pricing')).toBeTruthy();
    });

    it('reports interaction completion when clearing the order discount', () => {
        mockCartState.manualDiscounts = [{ scope: 'ORDER' }];
        const { getByText } = renderCart('order');

        fireEvent.press(getByText('Show actions'));
        fireEvent.press(getByText('Clear order discount'));

        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'cart/removePricingAdjustment',
                payload: { scope: 'ORDER' },
            })
        );
        expect(mockOnInteractionComplete).toHaveBeenCalledTimes(2);
    });

    it('shows clear order discount without expanding actions when an order discount is active', () => {
        mockCartState.manualDiscounts = [{ scope: 'ORDER' }];

        const { getByText } = renderCart('order');

        expect(getByText('Clear order discount')).toBeTruthy();
    });
});
