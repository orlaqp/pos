import React from 'react';
import { render, waitFor } from '@testing-library/react-native';

import UIS3Image from './ui-s3-image';

const mockGetAssetUri = jest.fn();

jest.mock('@pos/shared/utils', () => ({
    AssetsService: {
        getAssetUri: (...args: unknown[]) => mockGetAssetUri(...args),
    },
}));

describe('UIS3Image', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the resolved remote image uri', async () => {
        mockGetAssetUri.mockResolvedValueOnce('https://example.com/image.png');

        const { UNSAFE_getByType } = render(
            <UIS3Image s3Key="image-key" width={100} height={100} />
        );

        await waitFor(() => {
            expect(UNSAFE_getByType('Image')).toBeTruthy();
        });
    });

    it('does not render an image while the uri is still pending', () => {
        mockGetAssetUri.mockImplementation(
            () => new Promise<string>(() => undefined)
        );

        const { queryByTestId } = render(
            <UIS3Image s3Key="image-key" width={100} height={100} />
        );

        expect(queryByTestId('ui-s3-image')).toBeNull();
    });

    it('does not render an image when loading fails', async () => {
        mockGetAssetUri.mockRejectedValueOnce(new Error('download failed'));

        const { queryByTestId } = render(
            <UIS3Image s3Key="image-key" width={100} height={100} />
        );

        await waitFor(() => {
            expect(queryByTestId('ui-s3-image')).toBeNull();
        });
    });
});
