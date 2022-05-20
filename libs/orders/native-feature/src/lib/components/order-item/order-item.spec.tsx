
import React from 'react';
import { render } from '@testing-library/react-native';

import OrderItem from './order-item';

describe('OrderItem', () => {
    it('should render successfully', () => {
        const { container } = render(<OrderItem />);
        expect(container).toBeTruthy();
    });
});
