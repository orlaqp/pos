
import React from 'react';
import { Alert, TouchableOpacity } from 'react-native';
import { render } from '@testing-library/react-native';

import ProductItem, {
    deleteProductById,
    formatProductTitle,
    getProductCodeLines,
    hasProductCodes,
} from './product-item';

describe('ProductItem', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
    });

    it('should render successfully', () => {
        const item: any = {
            id: 'prod-1',
            productCategoryId: 'cat-1',
            name: 'Apple',
            description: 'Fresh apple',
            unitOfMeasure: 'ea',
            price: 1.5,
            isEBTEligible: true,
        };
        const navigation: any = { navigate: jest.fn() };
        const { UNSAFE_root } = render(<ProductItem item={item} navigation={navigation} />);
        expect(UNSAFE_root).toBeTruthy();
    });

    it('navigates to product form on row press', () => {
        const item: any = {
            id: 'prod-1',
            productCategoryId: 'cat-1',
            name: 'Apple',
            description: 'Fresh apple',
            unitOfMeasure: 'ea',
            price: 1.5,
            isEBTEligible: false,
        };
        const navigation: any = { navigate: jest.fn() };
        const { UNSAFE_getAllByType } = render(
            <ProductItem item={item} navigation={navigation} />
        );

        const touchables = UNSAFE_getAllByType(TouchableOpacity);
        touchables[0].props.onPress();
        expect(navigation.navigate).toHaveBeenCalledWith('Product Form');
    });

    it('opens delete confirmation dialog', () => {
        const item: any = {
            id: undefined,
            productCategoryId: 'cat-1',
            name: 'Apple',
            description: 'Fresh apple',
            unitOfMeasure: 'ea',
            price: 1.5,
            isEBTEligible: false,
        };
        const navigation: any = { navigate: jest.fn() };
        const { UNSAFE_getAllByType } = render(
            <ProductItem item={item} navigation={navigation} />
        );

        const touchables = UNSAFE_getAllByType(TouchableOpacity);
        touchables[touchables.length - 1].props.onPress();

        expect(Alert.alert).toHaveBeenCalledWith(
            'Are you sure?',
            'You will not be able to undo this operation',
            expect.any(Array)
        );
    });

    it('executes delete flow when confirmed for an item with id', async () => {
        const item: any = {
            id: 'prod-1',
            productCategoryId: 'cat-1',
            name: 'Apple',
            description: 'Fresh apple',
            unitOfMeasure: 'ea',
            price: 1.5,
            isEBTEligible: false,
        };
        const navigation: any = { navigate: jest.fn() };
        const { UNSAFE_getAllByType } = render(
            <ProductItem item={item} navigation={navigation} />
        );

        const touchables = UNSAFE_getAllByType(TouchableOpacity);
        touchables[touchables.length - 1].props.onPress();
        const options = (Alert.alert as jest.Mock).mock.calls[0][2];
        const yesOption = options.find((o: { text: string }) => o.text === 'Yes');
        await yesOption.onPress();

        expect(Alert.alert).toHaveBeenCalled();
    });

    it('builds product code lines and code flag correctly', () => {
        const withCodes = {
            barcode: '111',
            sku: 'SKU-1',
            plu: '12',
        } as any;
        const withoutCodes = {} as any;

        expect(getProductCodeLines(withCodes)).toEqual([
            { label: 'UPC', value: '111' },
            { label: 'SKU', value: 'SKU-1' },
            { label: 'PLU', value: '12' },
        ]);
        expect(hasProductCodes(withCodes)).toBe(true);
        expect(getProductCodeLines(withoutCodes)).toEqual([]);
        expect(hasProductCodes(withoutCodes)).toBe(false);
    });

    it('formats product title and handles delete by id helper', async () => {
        expect(
            formatProductTitle({ name: 'Apple', unitOfMeasure: 'EA' } as any)
        ).toBe('Apple (EA)');

        const deleteProduct = jest.fn(() => Promise.resolve());
        const removeProduct = jest.fn();

        await expect(
            deleteProductById(undefined, deleteProduct, removeProduct)
        ).resolves.toBe(false);
        expect(deleteProduct).not.toHaveBeenCalled();

        await expect(
            deleteProductById('prod-1', deleteProduct, removeProduct)
        ).resolves.toBe(true);
        expect(deleteProduct).toHaveBeenCalledWith('prod-1');
        expect(removeProduct).toHaveBeenCalledWith('prod-1');
    });

});
