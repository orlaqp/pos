import React from 'react';
import { render } from '@testing-library/react-native';

import CartPayment from './cart-payment';

describe('CartPayment', () => {
    it('should render successfully', () => {
        const { container } = render(<CartPayment />);
        expect(container).toBeTruthy();
    });
});
