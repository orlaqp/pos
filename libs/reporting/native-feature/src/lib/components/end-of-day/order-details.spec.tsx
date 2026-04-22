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
        const { toJSON } = render(<OrderDetails order={order} productId={null} />);
        expect(toJSON()).toBeTruthy();
    });

    it('uses createdBy when present and passes refunded line amounts into line details', () => {
        const order: any = {
            orderNo: 'ORD-1',
            total: 12.5,
            discountTotal: 1.5,
            createdBy: { name: 'User A' },
            paymentInfo: {
                employeeName: 'Cashier B',
                payments: [{ type: 'CASH', amount: 12.5 }],
            },
            lines: [
                {
                    identifier: 'line-1',
                    productId: 'prod-1',
                    productName: 'Item 1',
                    unitOfMeasure: EACH,
                    quantity: 1,
                    price: 12.5,
                    lineDiscountTotal: 1,
                    allocatedOrderDiscountTotal: 0.5,
                },
            ],
        };
        const { getByText } = render(
            <OrderDetails
                order={order}
                productId={null}
                refundedAmount={3}
                refundedLineAmounts={{ 'line-1': 3 }}
            />
        );

        expect(getByText('User A')).toBeTruthy();
        expect(getByText('Discount')).toBeTruthy();
        expect(getByText('Refund')).toBeTruthy();
    });

    it('renders refund payment rows when reconciled payment details are provided', () => {
        const order: any = {
            orderNo: 'ORD-2',
            total: 25,
            createdBy: { name: 'User A' },
            paymentInfo: {
                employeeName: 'Cashier B',
                payments: [{ type: 'EBT', amount: 25 }],
            },
            lines: [
                {
                    identifier: 'line-1',
                    productId: 'prod-1',
                    productName: 'Item 1',
                    unitOfMeasure: EACH,
                    quantity: 1,
                    price: 25,
                },
            ],
        };

        const { getByText } = render(
            <OrderDetails
                order={order}
                productId={null}
                paymentDetails={[
                    { type: 'EBT', amount: 25, kind: 'payment' },
                    { type: 'CC', amount: 5, kind: 'refund' },
                ]}
            />
        );

        expect(getByText('EBT: $25.00')).toBeTruthy();
        expect(getByText('Refund CC: -$5.00')).toBeTruthy();
    });
});
