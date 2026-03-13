import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { FlatList } from 'react-native';
import CategorySelection from './category-selection';

const mockDispatch = jest.fn();
const mockOnSelected = jest.fn();
const mockCategories = [
    { id: 'c1', name: 'Fruits', picture: null },
    { id: 'c2', name: 'Snacks', picture: null },
];

jest.mock('@react-native-community/netinfo', () => ({
    addEventListener: jest.fn(),
    fetch: jest.fn().mockResolvedValue({ isConnected: true }),
    useNetInfo: jest.fn(() => ({ isConnected: true })),
}));

jest.mock('react-native-gesture-handler', () => ({
    FlatList,
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
    selectedCategory: () => mockCategories[0],
}));

jest.mock('@pos/shared/ui-native', () => ({
    UIS3Image: () => null,
}));

describe('CategorySelection', () => {
    beforeEach(() => {
        mockDispatch.mockClear();
        mockOnSelected.mockClear();
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
});
