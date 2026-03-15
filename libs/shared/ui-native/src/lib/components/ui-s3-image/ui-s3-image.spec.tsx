import React from 'react';
import { render, waitFor } from '@testing-library/react-native';

import UIS3Image from './ui-s3-image';

describe('UIS3Image', () => {
    it('should render successfully', async () => {
        const { toJSON } = render(
            <UIS3Image s3Key="image-key" width={100} height={100} />
        );

        await waitFor(() => {
            expect(toJSON()).toBeTruthy();
        });
    });
});
