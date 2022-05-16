import React from 'react';
import { render } from '@testing-library/react-native';

import CartLine from './cart-line';

describe('CartLine', () => {
    it('should render successfully', () => {
        const { container } = render(<CartLine />);
        expect(container).toBeTruthy();
    });
});
