import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import CompactProductList from './compact-product-list';

jest.mock('@pos/theme/native', () => ({
    useSharedStyles: () => ({
        overlay: { backgroundColor: '#111827' },
        secondaryText: { color: '#94a3b8' },
        primaryText: { color: '#f8fafc' },
        miniDataRow: { flexDirection: 'row' },
        name: { color: '#f8fafc' },
    }),
}));

jest.mock('@rneui/themed', () => ({
    Button: ({
        title,
        onPress,
        testID,
    }: {
        title: string;
        onPress: () => void;
        testID?: string;
    }) => {
        const { Pressable, Text } = require('react-native');
        return (
            <Pressable onPress={onPress} testID={testID}>
                <Text>{title}</Text>
            </Pressable>
        );
    },
}));

describe('CompactProductList', () => {
    const product = {
        id: 'product-1',
        name: 'Rice',
        unitOfMeasure: 'EA',
        description: 'Bagged rice',
    } as any;

    it('does not render when hidden', () => {
        const { queryByTestId } = render(
            <CompactProductList
                visible={false}
                products={[product]}
                onAdd={jest.fn()}
                onClose={jest.fn()}
            />
        );

        expect(queryByTestId('compact-product-list-backdrop')).toBeNull();
    });

    it('renders search results without crashing when quantity is missing and supports overlay actions', () => {
        const onAdd = jest.fn();
        const onClose = jest.fn();
        const { getByText, getByTestId } = render(
            <CompactProductList
                visible={true}
                products={[product]}
                onAdd={onAdd}
                onClose={onClose}
            />
        );

        expect(getByText('Products found:')).toBeTruthy();
        expect(getByText('0.00')).toBeTruthy();

        fireEvent.press(getByTestId('compact-product-add-rice'));
        expect(onAdd).toHaveBeenCalledWith(product);

        fireEvent.press(getByTestId('compact-product-list-backdrop'));
        expect(onClose).toHaveBeenCalledTimes(1);

        fireEvent.press(getByTestId('compact-product-list-close'));
        expect(onClose).toHaveBeenCalledTimes(2);
    });
});
