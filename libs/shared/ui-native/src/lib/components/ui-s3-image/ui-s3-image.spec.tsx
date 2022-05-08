import React from 'react';
import { render } from '@testing-library/react-native';

import UIS3Image from './ui-s3-image';

describe('UIS3Image', () => {
    it('should render successfully', () => {
        const { container } = render(<UIS3Image />);
        expect(container).toBeTruthy();
    });
});
