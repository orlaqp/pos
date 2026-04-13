import React from 'react';
import { act, render, waitFor } from '@testing-library/react-native';

import UIS3Image from './ui-s3-image';

const mockGetAssetUri = jest.fn();
const mockGetImage = jest.fn();

jest.mock('@pos/shared/utils', () => ({
    AssetsService: {
        getAssetUri: (...args: unknown[]) => mockGetAssetUri(...args),
        getImage: (...args: unknown[]) => mockGetImage(...args),
    },
}));

describe('UIS3Image', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders successfully after resolving the image URI', async () => {
        mockGetImage.mockResolvedValueOnce('data:image/png;base64,abc123');

        const { getByTestId } = render(
            <UIS3Image s3Key="image-key" width={100} height={100} />
        );

        await waitFor(() => {
            expect(getByTestId('ui-s3-image')).toBeTruthy();
        });
        expect(mockGetImage).toHaveBeenCalledWith('image-key');
        expect(mockGetAssetUri).not.toHaveBeenCalled();
    });

    it('retries local image resolution once after the image load fails', async () => {
        mockGetImage
            .mockResolvedValueOnce('data:image/png;base64,stale')
            .mockResolvedValueOnce('data:image/png;base64,fresh');

        const { getByTestId } = render(
            <UIS3Image s3Key="image-key" width={100} height={100} />
        );

        const image = await waitFor(() => getByTestId('ui-s3-image'));
        await act(async () => {
            image.props.onError?.();
        });

        await waitFor(() => {
            expect(mockGetImage).toHaveBeenCalledTimes(2);
        });
        expect(mockGetAssetUri).not.toHaveBeenCalled();
    });
});
