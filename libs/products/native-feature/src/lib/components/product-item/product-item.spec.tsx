
import React from 'react';
import { render } from '@testing-library/react-native';

import ProductItem from './product-item';

describe('ProductItem', () => {
    it('should render successfully', () => {
        const { container } = render(<ProductItem />);
        expect(container).toBeTruthy();
    });
});
