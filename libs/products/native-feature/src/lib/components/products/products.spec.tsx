import React from 'react';
import { render } from '@testing-library/react-native';

import Products from './products';

describe('Products', () => {
    it('should render successfully', () => {
        const { toJSON } = render(<Products />);
        expect(toJSON()).toBeTruthy();
    });
});
