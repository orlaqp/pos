import {
    buildDiscountBreakdownFromOrder,
    buildOrderSummaryFromOrder,
    buildRefundedOrderDetailsSummary,
} from './order-refunded-details.logic';

describe('order refunded details logic', () => {
    it('builds an order summary view model from a persisted order', () => {
        const order = {
            id: 'order-1',
            subtotal: 18,
            discountTotal: 4,
            savingsTotal: 4,
            tax: 0,
            total: 18,
            promoCodes: ['SAVE4'],
            appliedDiscountSummary: {
                warnings: ['Manager approval used'],
            },
            lines: [
                {
                    identifier: 'line-1',
                    productId: 'product-1',
                    productName: 'Ribeye',
                    quantity: 2,
                    unitOfMeasure: 'LB',
                    price: 11,
                    basePrice: 12,
                    lineDiscountTotal: 2,
                    allocatedOrderDiscountTotal: 2,
                    lineTotalBeforeTax: 20,
                    isEBTEligible: false,
                    appliedDiscounts: [
                        {
                            discountApplicationId: 'line-discount-1',
                            name: 'Manual',
                            discountAmount: 2,
                        },
                    ],
                },
            ],
        } as any;

        expect(buildOrderSummaryFromOrder(order)).toEqual({
            lines: [
                {
                    id: 'line-1',
                    name: 'Ribeye',
                    quantity: 2,
                    unitLabel: 'lb',
                    unitPrice: 12,
                    originalTotal: 24,
                    finalTotal: 22,
                    savings: 2,
                    discounts: [
                        {
                            discountApplicationId: 'line-discount-1',
                            name: 'Manual',
                            discountAmount: 2,
                        },
                    ],
                },
            ],
            promoCodes: ['SAVE4'],
            warnings: ['Manager approval used'],
            subtotal: 18,
            discountTotal: 4,
            tax: 0,
            total: 18,
            savingsTotal: 4,
            ebtEligibleTotal: 0,
        });
    });

    it('builds line and order discount breakdown rows from persisted discount summaries', () => {
        const order = {
            appliedDiscountSummary: {
                lineSummaries: [
                    {
                        discounts: [
                            {
                                discountApplicationId: 'line-1',
                                name: 'Manual',
                                discountAmount: 2,
                                applicationType: 'MANUAL_DISCOUNT',
                            },
                        ],
                    },
                ],
                orderLevelAdjustments: [
                    {
                        discountApplicationId: 'order-1',
                        name: 'Promo SAVE4',
                        discountAmount: 2,
                    },
                ],
            },
        } as any;

        expect(buildDiscountBreakdownFromOrder(order)).toEqual([
            {
                discountApplicationId: 'line-1',
                name: 'Manual',
                discountAmount: 2,
                scope: 'LINE',
            },
            {
                discountApplicationId: 'order-1',
                name: 'Promo SAVE4',
                discountAmount: 2,
                scope: 'ORDER',
            },
        ]);
    });

    it('aggregates refund summary using the latest refund metadata and merged payments', () => {
        const order = {
            refundInfo: { employeeName: 'Fallback Manager' },
        } as any;
        const refunds = [
            {
                refundDate: '2026-04-23T10:00:00.000Z',
                refundAmount: 5,
                createdByEmployeeName: 'Supervisor One',
                refundPayments: [{ type: 'CC', amount: 5 }],
            },
            {
                refundDate: '2026-04-23T11:00:00.000Z',
                refundAmount: 13,
                createdByEmployeeName: 'Supervisor Two',
                refundPayments: [
                    { type: 'CC', amount: 3 },
                    { type: 'CASH', amount: 10 },
                ],
            },
        ] as any;

        expect(buildRefundedOrderDetailsSummary(order, refunds)).toEqual({
            latestRefundDate: '2026-04-23T11:00:00.000Z',
            latestRefundedBy: 'Supervisor Two',
            totalRefundAmount: 18,
            refundPayments: [
                { type: 'CC', amount: 8 },
                { type: 'CASH', amount: 10 },
            ],
        });
    });
});
