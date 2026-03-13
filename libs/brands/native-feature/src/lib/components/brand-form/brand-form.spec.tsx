/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Alert, Pressable, Text, View } from 'react-native';

const mockDispatch = jest.fn();
const mockGoBack = jest.fn();
const mockBrandSave = jest.fn(() => Promise.resolve());
let mockSelectedBrand: any = {
    id: 'brand-1',
    name: 'Brand A',
    description: 'Desc',
};

jest.mock('react-redux', () => ({
    useDispatch: () => mockDispatch,
    useSelector: (selector: (state: any) => unknown) =>
        selector({ brands: { selected: mockSelectedBrand } }),
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
            <Pressable testID="brand-form-save" onPress={submitAction}>
                <Text>Save</Text>
            </Pressable>
            <Pressable testID="brand-form-cancel" onPress={cancelAction}>
                <Text>Cancel</Text>
            </Pressable>
        </View>
    ),
    UIInput: ({ name }: { name: string }) => <View testID={`brand-input-${name}`} />,
    UIScreen: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
    UICard: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
}));

jest.mock('@pos/brands/data-access', () => ({
    BrandService: {
        save: (...args: unknown[]) => mockBrandSave(...args),
    },
}));

const { BrandForm } = require('./brand-form');

describe('BrandForm integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSelectedBrand = { id: 'brand-1', name: 'Brand A', description: 'Desc' };
        jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
    });

    it('saves selected brand and navigates back', async () => {
        const { getByTestId } = render(<BrandForm navigation={{ goBack: mockGoBack } as any} />);
        fireEvent.press(getByTestId('brand-form-save'));

        await waitFor(() => {
            expect(mockBrandSave).toHaveBeenCalledWith(
                mockDispatch,
                expect.objectContaining({ id: 'brand-1', name: 'Brand A' })
            );
            expect(mockGoBack).toHaveBeenCalled();
        });
    });

    it('removes id from payload for new brand save', async () => {
        mockSelectedBrand = { name: 'New Brand', description: 'New Desc' };
        const { getByTestId } = render(<BrandForm navigation={{ goBack: mockGoBack } as any} />);
        fireEvent.press(getByTestId('brand-form-save'));

        await waitFor(() => {
            const savedPayload = mockBrandSave.mock.calls[0][1];
            expect(savedPayload.id).toBeUndefined();
        });
    });

    it('confirms cancel and navigates back on confirmation', () => {
        const { getByTestId } = render(<BrandForm navigation={{ goBack: mockGoBack } as any} />);
        fireEvent.press(getByTestId('brand-form-cancel'));

        const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
        const options = alertCall[2];
        const yesOption = options.find((o: { text: string }) => o.text === 'Yes');
        yesOption.onPress();
        expect(mockGoBack).toHaveBeenCalled();
    });

    it('does not navigate back when cancel is declined', () => {
        const { getByTestId } = render(<BrandForm navigation={{ goBack: mockGoBack } as any} />);
        fireEvent.press(getByTestId('brand-form-cancel'));

        const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
        const options = alertCall[2];
        const noOption = options.find((o: { text: string }) => o.text === 'No');
        if (typeof noOption.onPress === 'function') {
            noOption.onPress();
        }
        expect(mockGoBack).not.toHaveBeenCalled();
    });
});
