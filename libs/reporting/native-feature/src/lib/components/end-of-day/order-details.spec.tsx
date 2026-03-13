import React from 'react';
import { render } from '@testing-library/react-native';

import OrderDetails from './order-details';
import { EACH } from '@pos/unit-of-measures/data-access';

describe('OrderDetails', () => {
    it('should render successfully', () => {
        const order: any = {
            orderNo: 'ORD-1',
            total: 12.5,
            createdBy: { name: 'User A' },
            paymentInfo: { employeeName: 'Cashier B', payments: [{ type: 'CASH', amount: 12.5 }] },
            lines: [
                {
                    identifier: 'line-1',
                    productId: 'prod-1',
                    productName: 'Item 1',
                    unitOfMeasure: EACH,
                    quantity: 1,
                    price: 12.5,
                },
            ],
        };
        const { container } = render(<OrderDetails order={order} productId={null} />);
        expect(container).toBeTruthy();
    });
});
