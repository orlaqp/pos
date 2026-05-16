/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-explicit-any */
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

const mockOnFilterChange = jest.fn().mockResolvedValue('');
const mockPrimary = '#00f';
const mockGrey = '#999';
const mockFocus = jest.fn();

jest.mock('@pos/shared/utils', () => ({
    translateWithFallback: (_key: string, fallback: string) => fallback,
}));

jest.mock('@pos/shared/ui-native', () => ({
    UISearchInput: (() => {
        const React = require('react');
        const { Pressable, Text } = require('react-native');
        return React.forwardRef(
            (
                { onSubmit }: { onSubmit: (value: string) => void },
                ref: React.ForwardedRef<any>
            ) => {
                if (typeof ref === 'function') {
                    ref({ focus: mockFocus });
                } else if (ref) {
                    ref.current = { focus: mockFocus };
                }

                return (
                    <Pressable testID="product-search-submit" onPress={() => onSubmit('apple')}>
                        <Text>Search</Text>
                    </Pressable>
                );
            }
        );
    })(),
}));

jest.mock('@rneui/themed', () => ({
    useTheme: () => ({
        theme: {
            colors: {
                primary: mockPrimary,
                grey1: mockGrey,
            },
        },
    }),
    Button: ({
        onPress,
        icon,
    }: {
        onPress: () => void;
        icon: { color: string };
    }) =>
        (() => {
            const { Pressable, Text } = require('react-native');
            return (
                <Pressable testID="product-search-keyboard" onPress={onPress}>
                    <Text>{icon.color}</Text>
                </Pressable>
            );
        })(),
}));

const { ProductSearch } = require('./product-search');

describe('ProductSearch', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockFocus.mockClear();
    });

    it('submits filter text', () => {
        const { getByTestId } = render(
            <View>
                <ProductSearch onFilterChange={mockOnFilterChange} />
            </View>
        );

        fireEvent.press(getByTestId('product-search-submit'));
        expect(mockOnFilterChange).toHaveBeenCalledWith('apple');
    });

    it('toggles keyboard button active color', () => {
        const { getByTestId, getByText } = render(
            <View>
                <ProductSearch onFilterChange={mockOnFilterChange} />
            </View>
        );

        expect(getByText(mockGrey)).toBeTruthy();
        fireEvent.press(getByTestId('product-search-keyboard'));
        expect(getByText(mockPrimary)).toBeTruthy();
        expect(mockFocus).toHaveBeenCalled();
        fireEvent.press(getByTestId('product-search-keyboard'));
        expect(getByText(mockGrey)).toBeTruthy();
    });
});
