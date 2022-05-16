import React from 'react';
import { render } from '@testing-library/react-native';

import ProductSearch from './product-search';

describe('ProductSearch', () => {
    it('should render successfully', () => {
        const { container } = render(<ProductSearch />);
        expect(container).toBeTruthy();
    });
});
