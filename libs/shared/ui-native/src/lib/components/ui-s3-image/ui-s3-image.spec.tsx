import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import UIS3Image from './ui-s3-image';
import { AssetsService } from '@pos/shared/utils';

jest.mock('@pos/shared/utils', () => ({
    AssetsService: {
        getAssetUri: jest.fn(),
        getCachedImage: jest.fn(),
        getImage: jest.fn(),
        invalidateCachedImage: jest.fn(),
    },
}));

describe('UIS3Image', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(AssetsService.getAssetUri).mockResolvedValue('https://cdn.example.com/image.png');
        jest.mocked(AssetsService.getCachedImage).mockResolvedValue(undefined);
        jest.mocked(AssetsService.getImage).mockResolvedValue('data:image/png;base64,abc123');
    });

    it('should render successfully', async () => {
        const { toJSON } = render(
            <UIS3Image s3Key="image-key" width={100} height={100} />
        );

        await waitFor(() => {
            expect(toJSON()).toBeTruthy();
        });
    });

    it('prefers a fresh cached image before requesting a new uri', async () => {
        jest.mocked(AssetsService.getCachedImage).mockResolvedValue(
            'data:image/png;base64,cached'
        );

        const { UNSAFE_getByType } = render(
            <UIS3Image s3Key="cached-image-key" width={100} height={100} />
        );

        await waitFor(() => {
            expect(UNSAFE_getByType('Image').props.source).toEqual({
                uri: 'data:image/png;base64,cached',
            });
        });

        expect(AssetsService.getAssetUri).not.toHaveBeenCalled();
        expect(AssetsService.getImage).not.toHaveBeenCalled();
    });

    it('refreshes a stale cached uri when the image fails to load', async () => {
        jest.mocked(AssetsService.getAssetUri)
            .mockResolvedValueOnce('https://cdn.example.com/expired.png')
            .mockResolvedValueOnce('https://cdn.example.com/fresh.png');

        const { UNSAFE_getByType } = render(
            <UIS3Image s3Key="stale-image-key" width={100} height={100} />
        );

        await waitFor(() => {
            expect(UNSAFE_getByType('Image').props.source).toEqual({
                uri: 'https://cdn.example.com/expired.png',
            });
        });

        fireEvent(UNSAFE_getByType('Image'), 'error');

        await waitFor(() => {
            expect(UNSAFE_getByType('Image').props.source).toEqual({
                uri: 'https://cdn.example.com/fresh.png',
            });
        });

        expect(AssetsService.invalidateCachedImage).toHaveBeenCalledWith('stale-image-key');
        expect(AssetsService.getAssetUri).toHaveBeenCalledTimes(2);
    });

    it('falls back to the downloaded image when the asset uri cannot be resolved', async () => {
        jest.mocked(AssetsService.getAssetUri).mockRejectedValueOnce(
            new Error('signed url unavailable')
        );
        jest.mocked(AssetsService.getImage).mockResolvedValueOnce(
            'data:image/png;base64,fallback'
        );

        const { UNSAFE_getByType } = render(
            <UIS3Image s3Key="fallback-image-key" width={100} height={100} />
        );

        await waitFor(() => {
            expect(UNSAFE_getByType('Image').props.source).toEqual({
                uri: 'data:image/png;base64,fallback',
            });
        });
    });
});
