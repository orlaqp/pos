/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-explicit-any */
import React from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { EACH } from '@pos/unit-of-measures/data-access';

const mockUpsert = jest.fn();
let mockState: any;

jest.mock('react-redux', () => ({
    useSelector: (selector: (state: any) => unknown) => selector(mockState),
}));

jest.mock('@pos/products/data-access', () => ({
    selectProduct: () => (state: any) => state.product,
}));

jest.mock('@pos/brands/data-access', () => ({
    selectBrand: () => (state: any) => state.brand,
}));

jest.mock('@pos/shared/ui-native', () => ({
    UICard: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
    UIEbtRibbon: () => <Text>EBT</Text>,
    UIS3Image: () => <Text>Image</Text>,
}));

jest.mock('react-native-numeric-input', () => {
    return ({ onChange }: { onChange: (value: number) => void }) => (
        <Pressable testID="product-details-numeric" onPress={() => onChange(5)}>
            <Text>Numeric Input</Text>
        </Pressable>
    );
});

jest.mock('@rneui/themed', () => {
    const React = require('react');
    const { Pressable, Text, View } = require('react-native');
    return {
        useTheme: () => ({
            theme: { colors: { grey0: '#fff', grey3: '#999', success: '#0f0', grey1: '#ccc', grey4: '#444' } },
        }),
        Input: React.forwardRef(
            (
                {
                    value,
                    onChangeText,
                }: {
                    value: string;
                    onChangeText: (text: string) => void;
                },
                _ref: React.ForwardedRef<any>
            ) => (
                <View>
                    <Text testID="product-details-input-value">{value}</Text>
                    <Pressable
                        testID="product-details-input-valid"
                        onPress={() => onChangeText('2.5')}
                    >
                        <Text>Set valid</Text>
                    </Pressable>
                    <Pressable
                        testID="product-details-input-invalid"
                        onPress={() => onChangeText('abc')}
                    >
                        <Text>Set invalid</Text>
                    </Pressable>
                </View>
            )
        ),
        Button: ({ title, onPress }: { title: string; onPress: () => void }) => (
            <Pressable testID="product-details-submit" onPress={onPress}>
                <Text>{title}</Text>
            </Pressable>
        ),
    };
});

const { ProductDetails } = require('./product-details');

describe('ProductDetails', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockState = {
            product: {
                id: 'p-1',
                picture: null,
                description: 'desc',
                quantity: 50,
                productBrandId: 'b-1',
            },
            brand: { name: 'Brand' },
        };
        jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    });

    it('submits updated cart item for EACH products', () => {
        const item = {
            identifier: 'i-1',
            quantity: 2,
            product: {
                id: 'p-1',
                name: 'Apple',
                price: 2.5,
                unitOfMeasure: EACH,
                isEBTEligible: true,
            },
        } as any;

        const { getByTestId } = render(
            <ProductDetails item={item} upsertCart={mockUpsert} enforceSalesBasedOnInventory={false} />
        );

        fireEvent.press(getByTestId('product-details-numeric'));
        fireEvent.press(getByTestId('product-details-submit'));
        expect(mockUpsert).toHaveBeenCalledWith(
            expect.objectContaining({
                identifier: 'i-1',
                quantity: 5,
            })
        );
    });

    it('accepts valid typed quantity for non-EACH and ignores invalid input', () => {
        const item = {
            identifier: 'i-2',
            quantity: 0,
            product: {
                id: 'p-1',
                name: 'Weighted Apple',
                price: 4,
                unitOfMeasure: 'LB',
                isEBTEligible: false,
            },
        } as any;

        const { getByTestId, getByText } = render(
            <ProductDetails item={item} upsertCart={mockUpsert} enforceSalesBasedOnInventory={false} />
        );

        fireEvent.press(getByTestId('product-details-input-valid'));
        fireEvent.press(getByTestId('product-details-input-invalid'));
        fireEvent.press(getByTestId('product-details-submit'));

        expect(getByText('$ 10.00')).toBeTruthy();
        expect(mockUpsert).toHaveBeenCalledWith(
            expect.objectContaining({ quantity: 2.5 })
        );
    });

    it('blocks submit when inventory is not enough', () => {
        mockState.product.quantity = 1;
        const item = {
            identifier: 'i-3',
            quantity: 2,
            product: {
                id: 'p-1',
                name: 'Apple',
                price: 2.5,
                unitOfMeasure: EACH,
                isEBTEligible: false,
            },
        } as any;

        const { getByTestId } = render(
            <ProductDetails item={item} upsertCart={mockUpsert} enforceSalesBasedOnInventory />
        );

        fireEvent.press(getByTestId('product-details-submit'));
        expect(Alert.alert).toHaveBeenCalledWith(
            'Cannot sale this much',
            'There is not enough inventory to fulfill your request'
        );
        expect(mockUpsert).not.toHaveBeenCalled();
    });
});
