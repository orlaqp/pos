/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-explicit-any */
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

const mockOnSelected = jest.fn();
const mockOnShowAll = jest.fn();
let mockCategories = [
    { id: 'c1', name: 'Fruits', picture: null },
    { id: 'c2', name: 'Snacks', picture: null },
    { id: undefined, name: 'NoId', picture: null },
];

jest.mock('@react-native-community/netinfo', () => ({
    addEventListener: jest.fn(),
    fetch: jest.fn().mockResolvedValue({ isConnected: true }),
    useNetInfo: jest.fn(() => ({ isConnected: true })),
}));

jest.mock('react-native-gesture-handler', () => ({
    FlatList: require('react-native').FlatList,
}));

jest.mock('react-redux', () => ({
    useSelector: (selector: (state: unknown) => unknown) => selector({}),
}));

jest.mock('@pos/categories/data-access', () => ({
    selectAllCategories: () => mockCategories,
}));

jest.mock('@pos/shared/ui-native', () => ({
    UIS3Image: () => null,
    UIEmptyState: ({ text }: { text: string }) => {
        const { Text } = require('react-native');
        return <Text>{text}</Text>;
    },
}));

const { default: CategorySelection } = require('./category-selection');

describe('CategorySelection', () => {
    beforeEach(() => {
        mockOnSelected.mockClear();
        mockOnShowAll.mockClear();
        mockCategories = [
            { id: 'c1', name: 'Fruits', picture: null },
            { id: 'c2', name: 'Snacks', picture: null },
            { id: undefined, name: 'NoId', picture: null },
        ];
    });

    it('renders categories and handles selection from props', () => {
        const { getByTestId } = render(
            <CategorySelection onSelected={mockOnSelected} selectedCategoryId="c1" />
        );

        expect(getByTestId('sales-category-list').props.keyboardShouldPersistTaps).toBe(
            'handled'
        );
        fireEvent.press(getByTestId('sales-category-c2'));

        expect(mockOnSelected).toHaveBeenCalledWith(mockCategories[1]);
    });

    it('clears selection when pressing the currently selected category', () => {
        const { getByTestId } = render(
            <CategorySelection onSelected={mockOnSelected} selectedCategoryId="c1" />
        );

        fireEvent.press(getByTestId('sales-category-c1'));

        expect(mockOnSelected).toHaveBeenCalledWith(undefined);
    });

    it('uses category name in testID fallback when id is missing', () => {
        const { getByTestId } = render(
            <CategorySelection onSelected={mockOnSelected} />
        );

        fireEvent.press(getByTestId('sales-category-NoId'));
        expect(mockOnSelected).toHaveBeenCalledWith(mockCategories[2]);
    });

    it('marks selection based on selectedCategoryId only', () => {
        const { getByTestId } = render(
            <CategorySelection
                onSelected={mockOnSelected}
                selectedCategoryId="c2"
                onShowAll={mockOnShowAll}
            />
        );

        expect(getByTestId('sales-category-c2').props.accessibilityState).toEqual({
            selected: true,
        });
        expect(getByTestId('sales-category-c1').props.accessibilityState).toEqual({
            selected: false,
        });
    });

    it('marks all products based on showAllSelected and calls onShowAll', () => {
        const { getByTestId } = render(
            <CategorySelection
                onSelected={mockOnSelected}
                onShowAll={mockOnShowAll}
                showAllSelected
            />
        );

        expect(getByTestId('sales-category-all').props.accessibilityState).toEqual({
            selected: true,
        });

        fireEvent.press(getByTestId('sales-category-all'));
        expect(mockOnShowAll).toHaveBeenCalled();
    });

    it('shows empty state when there are no categories', () => {
        mockCategories = [];
        const { getByText } = render(
            <CategorySelection onSelected={mockOnSelected} />
        );

        expect(getByText('No categories yet')).toBeTruthy();
    });
});
