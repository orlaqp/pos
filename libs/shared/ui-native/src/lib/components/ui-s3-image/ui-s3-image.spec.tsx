import React from 'react';
import { render, waitFor } from '@testing-library/react-native';

import UIS3Image from './ui-s3-image';

const mockGetImage = jest.fn();

jest.mock('@pos/shared/utils', () => ({
    AssetsService: {
        getImage: (...args: unknown[]) => mockGetImage(...args),
    },
}));

describe('UIS3Image', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shows a loader while downloading and then renders the locally cached image data', async () => {
        let resolveImage: ((value: string) => void) | undefined;
        mockGetImage.mockImplementation(
            () =>
                new Promise<string>((resolve) => {
                    resolveImage = resolve;
                })
        );

        const { getByTestId, queryByTestId } = render(
            <UIS3Image s3Key="image-key" width={100} height={100} />
        );

        expect(getByTestId('ui-s3-image-loading')).toBeTruthy();
        expect(queryByTestId('ui-s3-image')).toBeNull();

        resolveImage?.('data:image/png;base64,abc123');

        await waitFor(() => {
            expect(getByTestId('ui-s3-image')).toBeTruthy();
        });
        expect(queryByTestId('ui-s3-image-loading')).toBeNull();
        expect(mockGetImage).toHaveBeenCalledWith('image-key');
    });

    it('does not render an image when loading fails', async () => {
        mockGetImage.mockRejectedValueOnce(new Error('download failed'));

        const { queryByTestId } = render(
            <UIS3Image s3Key="image-key" width={100} height={100} />
        );

        await waitFor(() => {
            expect(queryByTestId('ui-s3-image-loading')).toBeNull();
        });
        expect(queryByTestId('ui-s3-image')).toBeNull();
    });
});
