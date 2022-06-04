import React from 'react';
import { render } from '@testing-library/react-native';

import SalesByProduct from './sales-by-product';

describe('SalesByProduct', () => {
    it('should render successfully', () => {
        const { container } = render(<SalesByProduct />);
        expect(container).toBeTruthy();
    });
});
