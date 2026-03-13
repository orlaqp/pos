
/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

const mockDispatch = jest.fn();
const mockGoBack = jest.fn();
const mockProductSave = jest.fn(() => Promise.resolve({ id: 'saved-1' }));
const mockSetValue = jest.fn();
const mockHandleSubmit = jest.fn((fn: () => void) => fn);
const mockGetValues = jest.fn();

let mockProduct: any;

jest.mock('react-redux', () => ({
    useDispatch: () => mockDispatch,
    useSelector: (selector: (s: any) => any) =>
        selector({
            products: { selected: mockProduct },
            categories: {},
            brands: {},
            unitOfMeasures: {},
        }),
}));

jest.mock('@pos/categories/data-access', () => ({
    selectAllCategories: () => [{ id: 'cat-1', name: 'Category 1' }],
}));

jest.mock('@pos/brands/data-access', () => ({
    selectAllBrands: () => [{ id: 'brand-1', name: 'Brand 1' }],
}));

jest.mock('@pos/unit-of-measures/data-access', () => ({
    selectAllUnitOfMeasures: () => [{ name: 'EA' }],
}));

jest.mock('@pos/products/data-access', () => ({
    ProductService: {
        save: (...args: unknown[]) => mockProductSave(...args),
    },
}));

jest.mock('react-hook-form', () => ({
    FormProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useForm: () => ({
        getValues: () => mockGetValues(),
        setValue: (...args: unknown[]) => mockSetValue(...args),
        handleSubmit: (...args: unknown[]) => mockHandleSubmit(...args),
    }),
}));

jest.mock('@pos/shared/ui-native', () => ({
    UIActions: ({
        submitAction,
        cancelAction,
    }: {
        submitAction: () => void;
        cancelAction: () => void;
    }) => (
        <View>
            <Pressable testID="product-save" onPress={submitAction}>
                <Text>Save</Text>
            </Pressable>
            <Pressable testID="product-cancel" onPress={cancelAction}>
                <Text>Cancel</Text>
            </Pressable>
        </View>
    ),
    UiFileUpload: ({ onAssetUploaded }: { onAssetUploaded: (s: string) => void }) => (
        <Pressable testID="upload" onPress={() => onAssetUploaded('pic-key')}>
            <Text>Upload</Text>
        </Pressable>
    ),
    UIInput: () => <View />,
    UINumericInput: () => <View />,
    UIOverlaySelect: () => <View />,
    UISwitch: () => <View />,
    UIVerticalSpacer: () => <View />,
}));

jest.mock('@rneui/themed', () => {
    const React = require('react');
    const { TextInput } = require('react-native');
    return {
        useTheme: () => ({ theme: { colors: { grey2: '#777' } } }),
        Input: React.forwardRef((props: any, ref: any) => (
            <TextInput ref={ref} {...props} />
        )),
    };
});

const { ProductForm } = require('./product-form');

describe('ProductForm integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockProduct = {
            id: 'prod-1',
            name: 'Apple',
            description: 'Fresh',
            price: 5,
            cost: 3,
            barcode: '111',
            sku: '222',
            plu: '333',
            unitOfMeasure: 'EA',
            productCategoryId: 'cat-1',
            productBrandId: 'brand-1',
            isActive: true,
            isEBTEligible: true,
        };
        mockGetValues.mockReturnValue({
            ...mockProduct,
            price: '12.50',
            cost: '7.25',
        });
        jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
    });

    it('saves product, converts numeric fields, and navigates back', async () => {
        const { getByTestId } = render(
            <ProductForm navigation={{ goBack: mockGoBack } as any} />
        );

        fireEvent.press(getByTestId('upload'));
        fireEvent.press(getByTestId('product-save'));

        await waitFor(() => {
            expect(mockSetValue).toHaveBeenCalledWith('picture', 'pic-key');
            expect(mockProductSave).toHaveBeenCalledWith(
                mockDispatch,
                expect.objectContaining({
                    id: 'prod-1',
                    price: 12.5,
                    cost: 7.25,
                })
            );
            expect(mockGoBack).toHaveBeenCalled();
        });
    });

    it('removes id for new product before save', async () => {
        mockGetValues.mockReturnValue({
            name: 'New Product',
            price: '9.99',
            cost: null,
        });

        const { getByTestId } = render(
            <ProductForm navigation={{ goBack: mockGoBack } as any} />
        );
        fireEvent.press(getByTestId('product-save'));

        await waitFor(() => {
            const payload = mockProductSave.mock.calls[0][1];
            expect(payload.id).toBeUndefined();
            expect(payload.cost).toBeNull();
            expect(payload.price).toBe(9.99);
        });
    });

    it('does not navigate when save response is falsy', async () => {
        mockProductSave.mockResolvedValueOnce(null);
        const { getByTestId } = render(
            <ProductForm navigation={{ goBack: mockGoBack } as any} />
        );
        fireEvent.press(getByTestId('product-save'));

        await waitFor(() => expect(mockProductSave).toHaveBeenCalled());
        expect(mockGoBack).not.toHaveBeenCalled();
    });

    it('asks confirmation on cancel and goes back on Yes', () => {
        const { getByTestId } = render(
            <ProductForm navigation={{ goBack: mockGoBack } as any} />
        );
        fireEvent.press(getByTestId('product-cancel'));

        const options = (Alert.alert as jest.Mock).mock.calls[0][2];
        const yesOption = options.find((o: { text: string }) => o.text === 'Yes');
        yesOption.onPress();

        expect(mockGoBack).toHaveBeenCalled();
    });

    it('does not go back when cancel confirmation is rejected', () => {
        const { getByTestId } = render(
            <ProductForm navigation={{ goBack: mockGoBack } as any} />
        );
        fireEvent.press(getByTestId('product-cancel'));

        const options = (Alert.alert as jest.Mock).mock.calls[0][2];
        const noOption = options.find((o: { text: string }) => o.text === 'No');
        noOption.onPress && noOption.onPress();

        expect(mockGoBack).not.toHaveBeenCalled();
    });

    it('updates barcode, sku and plu values on input blur', () => {
        const { UNSAFE_getAllByType } = render(
            <ProductForm navigation={{ goBack: mockGoBack } as any} />
        );

        const inputs = UNSAFE_getAllByType(TextInput);
        fireEvent(inputs[0], 'blur', { nativeEvent: { text: '111111' } });
        fireEvent(inputs[1], 'blur', { nativeEvent: { text: 'SKU-22' } });
        fireEvent(inputs[2], 'blur', { nativeEvent: { text: '42' } });

        expect(mockSetValue).toHaveBeenCalledWith('barcode', '111111');
        expect(mockSetValue).toHaveBeenCalledWith('sku', 'SKU-22');
        expect(mockSetValue).toHaveBeenCalledWith('plu', '42');
    });
});
