/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-explicit-any, import/first */
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Alert } from 'react-native';

const mockOnSelected = jest.fn();
const mockOnLongPress = jest.fn();

jest.mock('@pos/shared/ui-native', () => ({
    UIEmptyState: ({ text }: { text: string }) => {
        const { Text } = require('react-native');
        return <Text>{text}</Text>;
    },
    UIS3Image: () => {
        const { Text } = require('react-native');
        return <Text>IMAGE</Text>;
    },
    UIEbtRibbon: () => {
        const { Text } = require('react-native');
        return <Text>EBT</Text>;
    },
    UIButton: ({
        item,
        onSelected,
        onLongPress,
        children,
    }: {
        item: any;
        onSelected: (item: any) => void;
        onLongPress?: (item: any) => void;
        children: React.ReactNode;
    }) => (
        (() => {
            const { Pressable } = require('react-native');
            return (
                <Pressable
                    testID={`product-btn-${item.id}`}
                    onPress={() => onSelected(item)}
                    onLongPress={onLongPress ? () => onLongPress(item) : undefined}
                >
                    {children}
                </Pressable>
            );
        })()
    ),
}));

const { ProductSelection } = require('./product-selection');

describe('ProductSelection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('shows empty state and renders products', () => {
        const { getByText, getAllByText, rerender, getByTestId } = render(
            <ProductSelection
                products={[]}
                onSelected={mockOnSelected}
                onLongPress={mockOnLongPress}
            />
        );

        expect(
            getByText(
                'No products found. Add products in Back Office, choose another category, or search again.'
            )
        ).toBeTruthy();

        const products = [
            {
                id: 'p-1',
                name: 'Apple',
                description: 'fresh',
                quantity: 10,
                price: 2.5,
                unitOfMeasure: 'EA',
                isEBTEligible: true,
            },
            {
                id: 'p-2',
                name: 'Low',
                description: 'low stock',
                quantity: 0,
                reorderPoint: 3,
                price: 1.5,
                unitOfMeasure: 'EA',
                isEBTEligible: false,
            },
            {
                id: 'p-3',
                name: 'Warn',
                description: 'warning stock',
                quantity: 2,
                reorderPoint: 3,
                price: 1.2,
                unitOfMeasure: 'EA',
                isEBTEligible: false,
            },
            {
                id: 'p-4',
                name: 'Flour',
                description: 'weighted',
                quantity: 1.234,
                reorderPoint: 1,
                price: 5,
                unitOfMeasure: 'LB',
                isEBTEligible: false,
            },
        ] as any;

        rerender(
            <ProductSelection
                products={products}
                onSelected={mockOnSelected}
                onLongPress={mockOnLongPress}
            />
        );
        fireEvent.press(getByTestId('sales-product-card-apple'));
        fireEvent(getByTestId('sales-product-card-apple'), 'longPress');

        expect(getByText('In stock • 10')).toBeTruthy();
        expect(getByText('Low stock • 2 left')).toBeTruthy();
        expect(getByText('In stock • 1.23')).toBeTruthy();
        expect(getByText('EBT')).toBeTruthy();
        expect(getAllByText('Price').length).toBeGreaterThan(0);
        expect(getByTestId('product-selection-list').props.keyboardShouldPersistTaps).toBe(
            'handled'
        );
        expect(mockOnSelected).toHaveBeenCalledWith(products[0]);
        expect(mockOnLongPress).toHaveBeenCalledWith(products[0]);
    });

    it('dims out of stock products and shows an alert instead of adding them to the cart', () => {
        const products = [
            {
                id: 'p-2',
                name: 'Low',
                description: 'low stock',
                quantity: 0,
                reorderPoint: 3,
                price: 1.5,
                unitOfMeasure: 'EA',
                isEBTEligible: false,
            },
        ] as any;

        const { getByTestId } = render(
            <ProductSelection
                products={products}
                onSelected={mockOnSelected}
                onLongPress={mockOnLongPress}
            />
        );

        fireEvent.press(getByTestId('sales-product-card-low'));

        expect(Alert.alert).toHaveBeenCalledWith(
            'Not Available',
            'We do not have this product in inventory at the moment'
        );
        expect(mockOnSelected).not.toHaveBeenCalled();
    });

    it('renders out-of-stock and low-stock badge-based states', () => {
        const products = [
            {
                id: 'p-2',
                name: 'Low',
                quantity: 0,
                reorderPoint: 3,
                price: 1.5,
                unitOfMeasure: 'EA',
                isEBTEligible: false,
            },
            {
                id: 'p-3',
                name: 'Warn',
                quantity: 2,
                reorderPoint: 3,
                price: 1.2,
                unitOfMeasure: 'EA',
                isEBTEligible: false,
            },
        ] as any;

        const { getByText } = render(
            <ProductSelection
                products={products}
                onSelected={mockOnSelected}
                onLongPress={mockOnLongPress}
            />
        );

        expect(getByText('Out of stock')).toBeTruthy();
        expect(getByText('Low stock • 2 left')).toBeTruthy();
    });

    it('highlights a product when its quantity changes', () => {
        const products = [
            {
                id: 'p-1',
                name: 'Apple',
                description: 'fresh',
                quantity: 10,
                price: 2.5,
                unitOfMeasure: 'EA',
                isEBTEligible: true,
            },
        ] as any;

        const { queryByTestId, rerender } = render(
            <ProductSelection
                products={products}
                onSelected={mockOnSelected}
                onLongPress={mockOnLongPress}
            />
        );

        expect(queryByTestId('sales-product-update-p-1')).toBeNull();

        rerender(
            <ProductSelection
                products={[{ ...products[0], quantity: 8 }]}
                onSelected={mockOnSelected}
                onLongPress={mockOnLongPress}
            />
        );

        expect(queryByTestId('sales-product-update-p-1')).toBeTruthy();
    });
});
