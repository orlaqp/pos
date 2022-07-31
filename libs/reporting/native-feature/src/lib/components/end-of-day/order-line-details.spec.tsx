import React from 'react';
import { render } from '@testing-library/react-native';

import OrderLine, { OrderLineDetails } from './order-line-details';

describe('OrderLine', () => {
    it('should render successfully', () => {
        const { container } = render(<OrderLineDetails />);
        expect(container).toBeTruthy();
    });
});
