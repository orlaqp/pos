/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-explicit-any */
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

const mockDispatch = jest.fn();
const mockOnSelected = jest.fn();
let mockSelectedCategory: any;
const mockCategories = [
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
    useDispatch: () => mockDispatch,
    useSelector: (selector: (state: unknown) => unknown) => selector({}),
}));

jest.mock('@pos/categories/data-access', () => ({
    categoriesActions: {
        select: (item: unknown) => ({ type: 'categories/select', payload: item }),
        clearSelection: () => ({ type: 'categories/clearSelection' }),
    },
    selectAllCategories: () => mockCategories,
    selectedCategory: () => mockSelectedCategory,
}));

jest.mock('@pos/shared/ui-native', () => ({
    UIS3Image: () => null,
}));

const { default: CategorySelection } = require('./category-selection');

describe('CategorySelection', () => {
    beforeEach(() => {
        mockDispatch.mockClear();
        mockOnSelected.mockClear();
        mockSelectedCategory = mockCategories[0];
    });

    it('renders categories and handles selection', () => {
        const { getByTestId } = render(
            <CategorySelection onSelected={mockOnSelected} />
        );

        fireEvent.press(getByTestId('sales-category-c2'));

        expect(mockOnSelected).toHaveBeenCalledWith(mockCategories[1]);
        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'categories/select',
            payload: mockCategories[1],
        });
    });

    it('clears selection when pressing selected category', () => {
        const { getByTestId } = render(
            <CategorySelection onSelected={mockOnSelected} />
        );

        fireEvent.press(getByTestId('sales-category-c1'));

        expect(mockOnSelected).toHaveBeenCalledWith(undefined);
        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'categories/clearSelection',
        });
    });

    it('uses category name in testID fallback when id is missing', () => {
        const { getByTestId } = render(
            <CategorySelection onSelected={mockOnSelected} />
        );

        fireEvent.press(getByTestId('sales-category-NoId'));
        expect(mockOnSelected).toHaveBeenCalledWith(mockCategories[2]);
    });

    it('selects category when no category is currently selected', () => {
        mockSelectedCategory = undefined;
        const { getByTestId } = render(
            <CategorySelection onSelected={mockOnSelected} />
        );

        fireEvent.press(getByTestId('sales-category-c1'));
        expect(mockOnSelected).toHaveBeenCalledWith(mockCategories[0]);
        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'categories/select',
            payload: mockCategories[0],
        });
    });
});
