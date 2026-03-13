import React from 'react';
import { render } from '@testing-library/react-native';
import { EACH } from '@pos/unit-of-measures/data-access';

import { OrderLineDetails } from './order-line-details';

describe('OrderLine', () => {
    it('should render successfully', () => {
        const line: any = {
            identifier: 'line-1',
            productId: 'prod-1',
            productName: 'Item 1',
            unitOfMeasure: EACH,
            quantity: 1,
            price: 12.5,
        };
        const { container } = render(<OrderLineDetails line={line} productId={null} />);
        expect(container).toBeTruthy();
    });
});
