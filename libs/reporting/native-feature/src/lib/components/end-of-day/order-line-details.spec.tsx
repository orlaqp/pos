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
        const { toJSON } = render(<OrderLineDetails line={line} productId={null} />);
        expect(toJSON()).toBeTruthy();
    });

    it('renders inline discount and refund rows when present', () => {
        const line: any = {
            identifier: 'line-1',
            productId: 'prod-1',
            productName: 'Item 1',
            unitOfMeasure: EACH,
            quantity: 1,
            price: 12.5,
            lineDiscountTotal: 2,
            allocatedOrderDiscountTotal: 1,
            lineTotalBeforeTax: 9.5,
        };
        const { getByText } = render(
            <OrderLineDetails
                line={line}
                productId={null}
                refundedAmount={4.25}
            />
        );

        expect(getByText('Discount')).toBeTruthy();
        expect(getByText('- $ 3.00')).toBeTruthy();
        expect(getByText('Refund')).toBeTruthy();
        expect(getByText('- $ 4.25')).toBeTruthy();
    });
});
