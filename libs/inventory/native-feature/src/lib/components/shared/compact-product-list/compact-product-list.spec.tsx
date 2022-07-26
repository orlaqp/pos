import React from 'react';
import { render } from '@testing-library/react-native';

import CompactProductList from './compact-product-list';

describe('CompactProductList', () => {
    it('should render successfully', () => {
        const { container } = render(<CompactProductList />);
        expect(container).toBeTruthy();
    });
});
