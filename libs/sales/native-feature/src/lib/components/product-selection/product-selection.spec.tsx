/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-explicit-any, import/first */
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

jest.mock('react-native', () => {
    const React = require('react');
    const RN = jest.requireActual('react-native');
    return {
        ...RN,
        FlatList: ({
            data = [],
            renderItem,
            onEndReached,
            testID,
        }: {
            data: any[];
            renderItem: (info: { item: any; index: number }) => React.ReactNode;
            onEndReached?: () => void;
            testID?: string;
        }) => (
            <RN.View testID={testID || 'flat-list'}>
                {data.map((item: any, index: number) => (
                    <RN.View key={`row-${index}`}>{renderItem({ item, index })}</RN.View>
                ))}
                <RN.Pressable
                    testID="product-selection-end-reached"
                    onPress={onEndReached}
                >
                    <RN.Text>End</RN.Text>
                </RN.Pressable>
            </RN.View>
        ),
    };
});

import { Pressable, Text, View } from 'react-native';

const mockOnSelected = jest.fn();

jest.mock('@pos/shared/ui-native', () => ({
    UIEmptyState: ({ text }: { text: string }) => <Text>{text}</Text>,
    UIEbtRibbon: () => <Text>EBT</Text>,
    UIButton: ({
        item,
        onSelected,
        children,
    }: {
        item: any;
        onSelected: (item: any) => void;
        children: React.ReactNode;
    }) => (
        <Pressable testID={`product-btn-${item.id}`} onPress={() => onSelected(item)}>
            {children}
        </Pressable>
    ),
}));

const { ProductSelection } = require('./product-selection');

describe('ProductSelection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shows empty state and renders products', () => {
        const { getByText, rerender, getByTestId } = render(
            <ProductSelection products={[]} onSelected={mockOnSelected} />
        );

        expect(
            getByText('Select a category from the left or search for a product on top')
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

        rerender(<ProductSelection products={products} onSelected={mockOnSelected} />);
        fireEvent.press(getByTestId('product-selection-end-reached'));
        fireEvent.press(getByTestId('product-btn-p-1'));

        expect(getByText('In stock: 1.23')).toBeTruthy();
        expect(mockOnSelected).toHaveBeenCalledWith(products[0]);
    });
});
