
import React from 'react';
import { render } from '@testing-library/react-native';

import BrandItem from './brand-item';

describe('BrandItem', () => {
    it('should render successfully', () => {
        const { container } = render(<BrandItem />);
        expect(container).toBeTruthy();
    });
});
