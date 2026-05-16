/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

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

jest.mock('@pos/shared/ui-native', () => ({
    UIActions: ({
        submitAction,
        cancelAction,
    }: {
        submitAction: () => void;
        cancelAction: () => void;
    }) => {
        const { Pressable: RNPressable, Text: RNText, View: RNView } = require('react-native');
        return (
            <RNView>
                <RNPressable testID="category-form-save" onPress={submitAction}>
                    <RNText>Save</RNText>
                </RNPressable>
                <RNPressable testID="category-form-cancel" onPress={cancelAction}>
                    <RNText>Cancel</RNText>
                </RNPressable>
            </RNView>
        );
    },
    UIInput: ({ name }: { name: string }) => {
        const { View: RNView } = require('react-native');
        return <RNView testID={`category-input-${name}`} />;
    },
    UiFileUpload: ({
        onAssetUploaded,
    }: {
        onAssetUploaded: (key: string) => void;
    }) => {
        const { Pressable: RNPressable, Text: RNText } = require('react-native');
        return (
            <RNPressable testID="category-upload" onPress={() => onAssetUploaded('new-key')}>
                <RNText>Upload</RNText>
            </RNPressable>
        );
    },
    UIScreen: ({ children }: { children: React.ReactNode }) => {
        const { View: RNView } = require('react-native');
        return <RNView>{children}</RNView>;
    },
    UICard: ({ children }: { children: React.ReactNode }) => {
        const { View: RNView } = require('react-native');
        return <RNView>{children}</RNView>;
    },
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
