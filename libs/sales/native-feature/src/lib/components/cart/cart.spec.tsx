/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-explicit-any */
import React from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

const mockDispatch = jest.fn();
const mockOnSubmit = jest.fn();

let mockCartState: any;
let mockEmployeeState: any;
let mockStoreState: any;
let mockStationState: any;
const mockStationQuery = jest.fn().mockResolvedValue([]);

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
    EmployeeService: {
        getEmployee: jest.fn(),
    },
    selectLoginEmployee: (state: any) => state.employee,
}));

jest.mock('@pos/store-info/data-access', () => ({
    selectStore: (state: any) => state.store,
}));

jest.mock('@pos/settings/data-access', () => ({
    selectStation: (state: any) => state.station,
}));

jest.mock('@pos/shared/amplify', () => ({
    DataStore: {
        query: (...args: unknown[]) => mockStationQuery(...args),
    },
}));

jest.mock('@pos/shared/models', () => ({
    Station: function Station() {},
}));

jest.mock('react-native-device-info', () => ({
    getUniqueIdSync: () => 'device-1',
}));

jest.mock('@pos/auth/data-access', () => ({
    Role: { Checks: 'Checks' },
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
        listPolicies: jest.fn().mockResolvedValue([]),
        resolvePolicyForEmployee: jest.fn(),
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
        onSelect,
        onRemove,
        onIncrement,
        onDecrement,
    }: {
        item: { product: { name: string } };
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
                    <Pressable testID="cart-line-select" onPress={() => onSelect(item)}>
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
const { EmployeeService } = require('@pos/employees/data-access');
const { DiscountService } = require('@pos/discounts/data-access');

describe('Cart', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
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
        mockEmployeeState = { roles: ['Checks'] };
        mockStoreState = { id: 'store-1', timezone: 'America/New_York' };
        mockStationState = { stationNumber: '25' };
        EmployeeService.getEmployee.mockResolvedValue(null);
        DiscountService.resolvePolicyForEmployee.mockReturnValue(undefined);
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    const renderCart = (mode: 'order' | 'payment') => {
        const searchRef = { current: null } as React.RefObject<any>;
        return render(
            <Cart
                mode={mode}
                onSubmit={mockOnSubmit}
                searchRef={searchRef}
                products={[{ id: 'p-1', quantity: 100 } as any]}
            />
        );
    };

    it('shows empty state when cart has no items', () => {
        mockCartState.items = [];
        const { getByText } = renderCart('order');
        expect(getByText('Cart is empty')).toBeTruthy();
    });

    it('dispatches select and remove from line actions', () => {
        const { getByTestId } = renderCart('order');
        fireEvent.press(getByTestId('cart-line-select'));
        fireEvent.press(getByTestId('cart-line-remove'));
        fireEvent.press(getByTestId('cart-line-increment'));
        fireEvent.press(getByTestId('cart-line-decrement'));
        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'cart/select' })
        );
        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'cart/removeProduct' })
        );
        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'cart/upsert' })
        );
    });

    it('deselects a cart line when the selected row is tapped again', () => {
        mockCartState.selected = mockCartState.items[0];
        const { getByTestId } = renderCart('order');

        fireEvent.press(getByTestId('cart-line-select'));

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'cart/select',
            payload: undefined,
        });
    });

    it('opens order summary instead of submitting directly in order mode', () => {
        const { getByText, getAllByText } = renderCart('order');
        fireEvent.press(getByText(/Print Order/));
        expect(getByText('Order summary')).toBeTruthy();
        expect(getAllByText('Apple').length).toBeGreaterThan(1);
        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('closes order summary without submitting', () => {
        const { getByText, queryByText } = renderCart('order');
        fireEvent.press(getByText(/Print Order/));
        fireEvent.press(getByText('Back to cart'));

        expect(queryByText('Order summary')).toBeFalsy();
        expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('submits from order summary print action', () => {
        const { getByText, getByTestId } = renderCart('order');
        fireEvent.press(getByText(/Print Order/));
        fireEvent.press(getByTestId('order-summary-print-button'));

        expect(mockOnSubmit).toHaveBeenCalledWith(mockCartState);
    });

    it('opens payment modal in payment mode and submits payments', () => {
        const { getByText, getByTestId } = renderCart('payment');
        fireEvent.press(getByText(/Receive Payment/));
        fireEvent.press(getByTestId('cart-payment-entered'));
        expect(mockOnSubmit).toHaveBeenCalledWith(
            mockCartState,
            expect.arrayContaining([expect.objectContaining({ method: 'cash' })])
        );
    });

    it('closes payment modal on backdrop press', () => {
        const { getByText, getByTestId, queryByText } = renderCart('payment');
        fireEvent.press(getByText(/Receive Payment/));
        expect(queryByText('CartPayment')).toBeTruthy();
        fireEvent.press(getByTestId('cart-payment-backdrop'));
        expect(queryByText('CartPayment')).toBeFalsy();
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
    });

    it('blocks submit when product inventory is insufficient', () => {
        const { getByText } = render(
            <Cart
                mode="order"
                onSubmit={mockOnSubmit}
                searchRef={{ current: null } as any}
                products={[{ id: 'p-1', quantity: 1 } as any]}
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
    });

    it('resolves manual discount approval from an approver pin', async () => {
        mockCartState.selected = mockCartState.items[0];
        mockCartState.policy = {
            maxManualPercentDiscount: 5,
        };
        EmployeeService.getEmployee.mockResolvedValue({
            id: 'approver-1',
            firstName: 'Ava',
            lastName: 'Manager',
            code: 'MGR',
            roles: ['Manager'],
            active: true,
        });
        DiscountService.resolvePolicyForEmployee.mockReturnValue({
            canApproveDiscounts: true,
        });

        const { getByText, getByPlaceholderText } = renderCart('order');

        fireEvent.press(getByText('Show actions'));
        fireEvent.press(getByText('Manual'));
        fireEvent.changeText(getByPlaceholderText('10'), '10');
        fireEvent.changeText(getByPlaceholderText('Approver PIN'), '4321');
        fireEvent.press(getByText('Apply'));

        await waitFor(() => {
            expect(EmployeeService.getEmployee).toHaveBeenCalledWith('4321');
            expect(mockDispatch).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'cart/applyManualDiscount',
                    payload: expect.objectContaining({
                        approval: expect.objectContaining({
                            approverEmployeeId: 'approver-1',
                            approverEmployeeName: 'Ava Manager',
                        }),
                    }),
                })
            );
        });
    });

    it('blocks approval when the approver pin does not have discount access', async () => {
        mockCartState.selected = mockCartState.items[0];
        mockCartState.policy = {
            maxManualPercentDiscount: 5,
        };
        EmployeeService.getEmployee.mockResolvedValue({
            id: 'cashier-1',
            firstName: 'Chris',
            lastName: 'Cashier',
            code: 'CSR',
            roles: ['Cashier'],
            active: true,
        });
        DiscountService.resolvePolicyForEmployee.mockReturnValue({
            canApproveDiscounts: false,
        });

        const { getByText, getByPlaceholderText } = renderCart('order');

        fireEvent.press(getByText('Show actions'));
        fireEvent.press(getByText('Manual'));
        fireEvent.changeText(getByPlaceholderText('10'), '10');
        fireEvent.changeText(getByPlaceholderText('Approver PIN'), '5555');
        fireEvent.press(getByText('Apply'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Approval failed',
                'This employee cannot approve discounts.'
            );
        });
    });
});
