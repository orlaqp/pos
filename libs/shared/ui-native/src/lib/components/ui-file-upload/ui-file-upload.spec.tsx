import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import UiFileUpload from './ui-file-upload';

const mockGetAssetUri = jest.fn();
const mockGetImage = jest.fn();
const mockDeleteAsset = jest.fn();
const mockUploadAsset = jest.fn();

jest.mock('@pos/shared/utils', () => ({
    AssetsService: {
        getAssetUri: (...args: unknown[]) => mockGetAssetUri(...args),
        getImage: (...args: unknown[]) => mockGetImage(...args),
        deleteAsset: (...args: unknown[]) => mockDeleteAsset(...args),
        uploadAsset: (...args: unknown[]) => mockUploadAsset(...args),
    },
}));

jest.mock('@pos/theme/native', () => ({
    useSharedStyles: () => ({
        darkBackground: {},
        centered: {},
    }),
}));

jest.mock('@rneui/themed', () => ({
    useTheme: () => ({
        theme: {
            colors: {
                grey1: '#ddd',
            },
        },
    }),
    Icon: () => null,
}));

jest.mock('../ui-spinner/ui-spinner', () => ({
    __esModule: true,
    default: () => null,
}));

describe('UiFileUpload', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders successfully without an image', () => {
        const { toJSON } = render(
            <UiFileUpload prefix="products" imageKey={null} />
        );
        expect(toJSON()).toBeTruthy();
    });

    it('restores the image preview from the provided image key', async () => {
        mockGetAssetUri.mockResolvedValueOnce('https://example.com/image.jpg');

        const { getByRole } = render(
            <UiFileUpload prefix="products" imageKey="products/existing.jpg" />
        );

        await waitFor(() => {
            expect(mockGetAssetUri).toHaveBeenCalledWith('products/existing.jpg');
            expect(getByRole('image')).toBeTruthy();
        });
    });

    it('clears the loading state when image restoration fails', async () => {
        mockGetAssetUri.mockRejectedValueOnce(new Error('network failed'));
        mockGetImage.mockRejectedValueOnce(new Error('cache failed'));

        const { getByText, queryByRole } = render(
            <UiFileUpload prefix="products" imageKey="products/broken.jpg" />
        );

        await waitFor(() => {
            expect(mockGetImage).toHaveBeenCalledWith('products/broken.jpg');
            expect(getByText('Touch to\nUpload')).toBeTruthy();
            expect(queryByRole('image')).toBeNull();
        });
    });
});
