/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-explicit-any */
import React from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

const mockDispatch = jest.fn();
const mockOnSubmit = jest.fn();

let cartState: any;
let employeeState: any;

jest.mock('react-redux', () => ({
    useDispatch: () => mockDispatch,
    useSelector: (selector: (state: any) => unknown) =>
        selector({ cart: cartState, employee: employeeState }),
}));

jest.mock('@pos/sales/data-access', () => ({
    cartActions: {
        select: (item: unknown) => ({ type: 'cart/select', payload: item }),
        removeProduct: (item: unknown) => ({
            type: 'cart/removeProduct',
            payload: item,
        }),
    },
    selectCart: (state: any) => state.cart,
}));

jest.mock('@pos/employees/data-access', () => ({
    selectLoginEmployee: (state: any) => state.employee,
}));

jest.mock('@pos/auth/data-access', () => ({
    Role: { Checks: 'Checks' },
}));

jest.mock('@pos/shared/ui-native', () => ({
    UICard: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
    UIEmptyState: ({ text }: { text: string }) => <Text>{text}</Text>,
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
        <Pressable onPress={onPress} testID={testID || title}>
            <Text>{title}</Text>
        </Pressable>
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
            <View>
                {children}
                <Pressable
                    testID="cart-payment-backdrop"
                    onPress={onBackdropPress}
                >
                    <Text>Close</Text>
                </Pressable>
            </View>
        ) : null,
}));

jest.mock('../cart-line/cart-line', () => ({
    __esModule: true,
    default: ({
        item,
        onSelect,
        onRemove,
    }: {
        item: { product: { name: string } };
        onSelect: (item: any) => void;
        onRemove: (item: any) => void;
    }) => (
        <View>
            <Text>{item.product.name}</Text>
            <Pressable testID="cart-line-select" onPress={() => onSelect(item)}>
                <Text>Select</Text>
            </Pressable>
            <Pressable testID="cart-line-remove" onPress={() => onRemove(item)}>
                <Text>Remove</Text>
            </Pressable>
        </View>
    ),
}));

jest.mock('../cart-payment/cart-payment', () => ({
    __esModule: true,
    default: ({ onPaymentEntered }: { onPaymentEntered: (payments: any[]) => void }) => (
        <Pressable
            testID="cart-payment-entered"
            onPress={() => onPaymentEntered([{ method: 'cash', amount: 5 }])}
        >
            <Text>CartPayment</Text>
        </Pressable>
    ),
}));

const { Cart } = require('./cart');

describe('Cart', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
        cartState = {
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
            footer: { total: 5, subtotal: 5, tax: 0, discount: 0 },
        };
        employeeState = { roles: ['Checks'] };
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
        cartState.items = [];
        const { getByText } = renderCart('order');
        expect(getByText('Cart is empty')).toBeTruthy();
    });

    it('dispatches select and remove from line actions', () => {
        const { getByTestId } = renderCart('order');
        fireEvent.press(getByTestId('cart-line-select'));
        fireEvent.press(getByTestId('cart-line-remove'));
        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'cart/select' })
        );
        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'cart/removeProduct' })
        );
    });

    it('submits directly in order mode', () => {
        const { getByText } = renderCart('order');
        fireEvent.press(getByText(/Print Order/));
        expect(mockOnSubmit).toHaveBeenCalledWith(cartState);
    });

    it('opens payment modal in payment mode and submits payments', () => {
        const { getByText, getByTestId } = renderCart('payment');
        fireEvent.press(getByText(/Receive Payment/));
        fireEvent.press(getByTestId('cart-payment-entered'));
        expect(mockOnSubmit).toHaveBeenCalledWith(
            cartState,
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
});
