import React from 'react';
import { render } from '@testing-library/react-native';

import OrderDetails from './order-details';

describe('OrderDetails', () => {
    it('should render successfully', () => {
        const { container } = render(<OrderDetails />);
        expect(container).toBeTruthy();
    });
});
