/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Alert, Pressable, Text, View } from 'react-native';

const mockDispatch = jest.fn();
const mockGoBack = jest.fn();
const mockCategorySave = jest.fn(() => Promise.resolve());
let mockSelectedCategory: any = {
    id: 'cat-1',
    name: 'Category A',
    description: 'Desc',
    picture: 'key',
};

jest.mock('react-redux', () => ({
    useDispatch: () => mockDispatch,
    useSelector: (selector: (state: any) => unknown) =>
        selector({ categories: { selected: mockSelectedCategory } }),
}));

jest.mock('@pos/theme/native', () => ({
    useSharedStyles: () => ({
        page: {},
        centeredHorizontally: {},
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
            <Pressable testID="category-form-save" onPress={submitAction}>
                <Text>Save</Text>
            </Pressable>
            <Pressable testID="category-form-cancel" onPress={cancelAction}>
                <Text>Cancel</Text>
            </Pressable>
        </View>
    ),
    UIInput: ({ name }: { name: string }) => <View testID={`category-input-${name}`} />,
    UiFileUpload: ({
        onAssetUploaded,
    }: {
        onAssetUploaded: (key: string) => void;
    }) => (
        <Pressable testID="category-upload" onPress={() => onAssetUploaded('new-key')}>
            <Text>Upload</Text>
        </Pressable>
    ),
    UIVerticalSpacer: () => <View testID="category-spacer" />,
}));

jest.mock('@pos/categories/data-access', () => ({
    CategoryService: {
        save: (...args: unknown[]) => mockCategorySave(...args),
    },
}));

const { CategoryForm } = require('./category-form');

describe('CategoryForm integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSelectedCategory = {
            id: 'cat-1',
            name: 'Category A',
            description: 'Desc',
            picture: 'key',
        };
        jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
    });

    it('saves selected category and navigates back', async () => {
        const { getByTestId } = render(
            <CategoryForm navigation={{ goBack: mockGoBack } as any} />
        );

        fireEvent.press(getByTestId('category-form-save'));

        await waitFor(() => {
            expect(mockCategorySave).toHaveBeenCalledWith(
                mockDispatch,
                expect.objectContaining({ id: 'cat-1', name: 'Category A' })
            );
            expect(mockGoBack).toHaveBeenCalled();
        });
    });

    it('updates picture key via upload callback and saves it', async () => {
        const { getByTestId } = render(
            <CategoryForm navigation={{ goBack: mockGoBack } as any} />
        );

        fireEvent.press(getByTestId('category-upload'));
        fireEvent.press(getByTestId('category-form-save'));

        await waitFor(() => {
            const savedPayload = mockCategorySave.mock.calls[0][1];
            expect(savedPayload.picture).toBe('new-key');
        });
    });

    it('removes id for new category save', async () => {
        mockSelectedCategory = { name: 'New Category', description: 'New Desc' };
        const { getByTestId } = render(
            <CategoryForm navigation={{ goBack: mockGoBack } as any} />
        );

        fireEvent.press(getByTestId('category-form-save'));

        await waitFor(() => {
            const savedPayload = mockCategorySave.mock.calls[0][1];
            expect(savedPayload.id).toBeUndefined();
        });
    });

    it('confirms cancel and navigates back on confirmation', () => {
        const { getByTestId } = render(
            <CategoryForm navigation={{ goBack: mockGoBack } as any} />
        );

        fireEvent.press(getByTestId('category-form-cancel'));

        const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
        const options = alertCall[2];
        const yesOption = options.find((o: { text: string }) => o.text === 'Yes');
        yesOption.onPress();
        expect(mockGoBack).toHaveBeenCalled();
    });

    it('does not navigate back when cancel is declined', () => {
        const { getByTestId } = render(
            <CategoryForm navigation={{ goBack: mockGoBack } as any} />
        );

        fireEvent.press(getByTestId('category-form-cancel'));

        const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
        const options = alertCall[2];
        const noOption = options.find((o: { text: string }) => o.text === 'No');
        if (typeof noOption.onPress === 'function') {
            noOption.onPress();
        }
        expect(mockGoBack).not.toHaveBeenCalled();
    });
});
