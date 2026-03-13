/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-explicit-any */
import React from 'react';
import { Alert, Pressable, Text } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

const mockOnRemove = jest.fn();
const mockOnSelect = jest.fn();

jest.mock('@rneui/themed', () => ({
    useTheme: () => ({ theme: { colors: { grey2: '#999', error: '#f66' } } }),
    Button: ({ onPress }: { onPress: () => void }) =>
        (() => {
            const { Pressable, Text } = require('react-native');
            return (
                <Pressable testID="cart-line-remove" onPress={onPress}>
                    <Text>Remove</Text>
                </Pressable>
            );
        })(),
}));

jest.mock('@pos/shared/ui-native', () => ({
    UIEbtRibbon: () => {
        const { Text } = require('react-native');
        return <Text>EBT</Text>;
    },
}));

const { CartLine } = require('./cart-line');

describe('CartLine', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('calls select and remove handlers', () => {
        jest.spyOn(Alert, 'alert').mockImplementation((_: any, __: any, actions: any) => {
            actions[1].onPress();
        });

        const item = {
            identifier: 'i-1',
            quantity: 2,
            product: {
                id: 'p-1',
                name: 'Apple',
                price: 2.5,
                unitOfMeasure: 'EA',
                isEBTEligible: true,
            },
        } as any;

        const { getByText, getByTestId } = render(
            <CartLine item={item} onRemove={mockOnRemove} onSelect={mockOnSelect} />
        );

        fireEvent.press(getByText('Apple'));
        expect(mockOnSelect).toHaveBeenCalledWith(item);

        fireEvent.press(getByTestId('cart-line-remove'));
        expect(mockOnRemove).toHaveBeenCalledWith(item);
    });
});
