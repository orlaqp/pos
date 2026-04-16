/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-explicit-any, import/first */
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

const mockOnSelected = jest.fn();
const mockOnLongPress = jest.fn();

jest.mock('@pos/shared/ui-native', () => ({
    UIEmptyState: ({ text }: { text: string }) => {
        const { Text } = require('react-native');
        return <Text>{text}</Text>;
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
    });

    it('shows empty state and renders products', () => {
        const { getByText, rerender, getByTestId } = render(
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
                enforceSalesBasedOnInventory
                onSelected={mockOnSelected}
                onLongPress={mockOnLongPress}
            />
        );
        fireEvent.press(getByTestId('product-btn-p-1'));
        fireEvent(getByTestId('product-btn-p-1'), 'longPress');

        expect(getByText('In stock: 1.23')).toBeTruthy();
        expect(getByText('Out of stock')).toBeTruthy();
        expect(getByText('Low inventory')).toBeTruthy();
        expect(getByTestId('sales-product-card-p-2')).toHaveProp(
            'accessibilityState',
            { disabled: true }
        );
        expect(getByTestId('sales-product-card-p-3')).toHaveProp(
            'accessibilityState',
            { disabled: false }
        );
        expect(getByTestId('product-selection-list').props.keyboardShouldPersistTaps).toBe(
            'handled'
        );
        expect(mockOnSelected).toHaveBeenCalledWith(products[0]);
        expect(mockOnLongPress).toHaveBeenCalledWith(products[0]);
    });
});
