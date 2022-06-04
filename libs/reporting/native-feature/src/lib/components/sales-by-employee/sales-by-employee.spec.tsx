import React from 'react';
import { render } from '@testing-library/react-native';

import SalesByEmployee from './sales-by-employee';

describe('SalesByEmployee', () => {
    it('should render successfully', () => {
        const { container } = render(<SalesByEmployee />);
        expect(container).toBeTruthy();
    });
});
