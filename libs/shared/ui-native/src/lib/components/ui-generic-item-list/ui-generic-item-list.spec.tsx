/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

const mockDispatch = jest.fn();
const mockFilterAction = jest.fn((query: string) => ({
    type: 'items/filter',
    payload: query,
}));
const mockFetchAction = jest.fn(() => ({ type: 'items/fetch' }));
const mockClearAction = jest.fn(() => ({ type: 'items/clear' }));

const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
};

const mockState = {
    empty: false,
    loading: 'loaded',
    filtered: [{ id: '1', name: 'First' }],
};

jest.mock('react-redux', () => ({
    useDispatch: () => mockDispatch,
    useSelector: (selector: (state: typeof mockState) => unknown) =>
        selector(mockState),
}));

jest.mock('@pos/theme/native', () => ({
    useSharedStyles: () => ({
        page: {},
        detailsPage: {},
    }),
}));

jest.mock('@rneui/themed', () => ({
    useTheme: () => ({
        theme: {
            colors: {
                grey2: '#9ca3af',
                grey3: '#6b7280',
                primary: '#4aa3eb',
                grey5: '#1f2937',
                grey1: '#f3f4f6',
            },
        },
    }),
}));

jest.mock('../ui-empty-state/ui-empty-state', () => ({
    __esModule: true,
    default: () => {
        const { Text } = require('react-native');
        return <Text>empty-state</Text>;
    },
}));

jest.mock('../ui-spinner/ui-spinner', () => ({
    __esModule: true,
    default: () => {
        const { Text } = require('react-native');
        return <Text>spinner</Text>;
    },
}));

const { UIGenericItemList } = require('./ui-generic-item-list');

describe('UIGenericItemList integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockState.empty = false;
        mockState.loading = 'loaded';
        mockState.filtered = [{ id: '1', name: 'First' }];
    });

    const renderList = () =>
        render(
            <UIGenericItemList
                formNavName="Product Form"
                navigation={mockNavigation}
                isEmptySelector={(state: typeof mockState) => state.empty}
                loadingStatusSelector={(state: typeof mockState) => state.loading}
                filteredListSelector={(state: typeof mockState) => state.filtered}
                clearSelectionAction={mockClearAction}
                filterAction={mockFilterAction}
                fetchItemsAction={mockFetchAction}
                ItemComponent={({ item }: { item: { name: string } }) => (
                    (() => {
                        const { View, Text } = require('react-native');
                        return (
                            <View>
                                <Text>{item.name}</Text>
                            </View>
                        );
                    })()
                )}
            />
        );

    it('renders list and add button without FAB', () => {
        const { getByTestId, getByText } = renderList();

        expect(getByTestId('ui-generic-item-list-add-button')).toBeTruthy();
        expect(getByText('First')).toBeTruthy();
    });

    it('dispatches clear and navigates when add button is pressed', () => {
        const { getByTestId } = renderList();

        fireEvent.press(getByTestId('ui-generic-item-list-add-button'));

        expect(mockClearAction).toHaveBeenCalled();
        expect(mockDispatch).toHaveBeenCalledWith({ type: 'items/clear' });
        expect(mockNavigation.navigate).toHaveBeenCalledWith('Product Form');
    });

    it('dispatches refresh action when refresh button is pressed', () => {
        const { getByTestId } = renderList();

        fireEvent.press(getByTestId('ui-generic-item-list-refresh-button'));

        expect(mockFetchAction).toHaveBeenCalled();
        expect(mockDispatch).toHaveBeenCalledWith({ type: 'items/fetch' });
    });

    it('dispatches filter action when search is submitted', () => {
        const { getByTestId } = renderList();

        fireEvent.changeText(getByTestId('ui-generic-item-list-search-input'), 'milk');
        fireEvent(getByTestId('ui-generic-item-list-search-input'), 'submitEditing', {
            nativeEvent: { text: 'milk' },
        });

        expect(mockFilterAction).toHaveBeenCalledWith('milk');
        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'items/filter',
            payload: 'milk',
        });
    });
});
