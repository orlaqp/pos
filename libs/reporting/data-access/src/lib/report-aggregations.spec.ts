import {
    buildCategoryPerformanceRows,
    buildDiscountReportRows,
    buildEbtSummaryRows,
    buildHourlySalesRows,
    buildLowSalesItemRows,
    buildOpenOrdersAgingRows,
    buildPaymentSummaryRows,
    buildRefundInsights,
    buildRefundReportRows,
    buildSalesByEmployeeRows,
    buildSalesByProductRows,
} from './report-aggregations';
import { OrderStatus } from '@pos/shared/models';

describe('report-aggregations', () => {
    const paidOrder: any = {
        id: 'order-1',
        orderNo: '1001',
        orderDate: '2026-03-16T09:00:00.000Z',
        updatedAt: '2026-03-16T09:05:00.000Z',
        status: OrderStatus.PAID,
        employeeName: 'Ada',
        total: 15.5,
        tax: 0,
        discountTotal: 1.25,
        appliedDiscountSummary: JSON.stringify({
            applications: [{ name: 'Oil Promo', amount: 1.25 }],
        }),
        paymentInfo: {
            payments: [
                { type: 'CC', amount: 10 },
                { type: 'CASH', amount: 5.5 },
            ],
        },
        lines: [
            {
                productId: 'p1',
                productName: 'Oil',
                categoryId: 'c1',
                quantity: 2,
                price: 5,
                isEBTEligible: true,
                ebtPaidAmount: 3,
                nonEbtPaidAmount: 7,
            },
            {
                productId: 'p2',
                productName: 'Flour',
                categoryId: 'c2',
                quantity: 1,
                price: 5.5,
                isEBTEligible: false,
                ebtPaidAmount: 0,
                nonEbtPaidAmount: 5.5,
            },
        ],
    };
    const partialRefund: any = {
        id: 'refund-1',
        orderId: 'order-1',
        refundAmount: 5,
        refundPayments: [{ type: 'CASH', amount: 5 }],
    };
    const partialRefundLines: any[] = [
        {
            refundId: 'refund-1',
            orderId: 'order-1',
            orderLineIdentifier: 'line-1',
            quantityRefunded: 1,
            lineRefundAmount: 5,
            productName: 'Oil',
        },
    ];

    beforeEach(() => {
        paidOrder.lines[0].identifier = 'line-1';
        paidOrder.lines[1].identifier = 'line-2';
    });

    it('builds category, payment, discount, hourly, and ebt summaries', () => {
        expect(
            buildCategoryPerformanceRows([paidOrder], { c1: 'Oils', c2: 'Baking' })
        ).toEqual([
            { category: 'Oils', sales: 10, tax: 0, units: 2 },
            { category: 'Baking', sales: 5.5, tax: 0, units: 1 },
        ]);

        expect(buildPaymentSummaryRows([paidOrder])).toEqual([
            { paymentType: 'Cards', amount: 10, count: 1, percent: '65%' },
            { paymentType: 'Cash', amount: 5.5, count: 1, percent: '35%' },
        ]);

        expect(buildDiscountReportRows([paidOrder])).toEqual([
            { discount: 'Oil Promo', amount: 1.25, orders: 1 },
        ]);

        expect(buildHourlySalesRows([paidOrder])).toEqual([
            { hour: '09:00', sales: 15.5, tax: 0, orders: 1, averageTicket: 15.5 },
        ]);

        expect(buildEbtSummaryRows([paidOrder])).toEqual([
            { metric: 'EBT Eligible Sales', amount: 10 },
            { metric: 'EBT Tendered', amount: 0 },
            { metric: 'Non-EBT Tendered', amount: 15.5 },
        ]);
    });

    it('builds refund, open aging, and low/no sales rows', () => {
        const refundRecord: any = {
            id: 'refund-1',
            orderNo: '2002',
            refundDate: '2026-03-16T08:00:00.000Z',
            createdByEmployeeName: 'Grace',
            refundAmount: 18,
            refundReason: 'Damaged item',
        };
        const refundLine: any = {
            refundId: 'refund-1',
            productName: 'Oil',
            lineRefundAmount: 18,
        };
        const openOrder: any = {
            orderNo: '3003',
            orderDate: '2026-03-16T11:30:00.000Z',
            status: OrderStatus.OPEN,
            employeeName: 'Linus',
            total: 22,
            lines: [],
        };

        expect(buildRefundReportRows([refundRecord])).toEqual([
            {
                orderNo: '2002',
                date: '2026-03-16',
                employee: 'Grace',
                amount: 18,
                reason: 'Damaged item',
            },
        ]);

        expect(buildRefundInsights([refundRecord], [refundLine])).toEqual({
            totalAmount: 18,
            totalOrders: 1,
            averageAmount: 18,
            topEmployees: [{ name: 'Grace', value: '$18.00' }],
            topProducts: [{ name: 'Oil', value: '$18.00' }],
            reasons: [{ name: 'Damaged item', value: '1' }],
        });

        expect(
            buildOpenOrdersAgingRows([openOrder], new Date('2026-03-16T12:30:00.000Z'))
        ).toEqual([
            {
                orderNo: '3003',
                employee: 'Linus',
                total: 22,
                ageMinutes: 60,
                ageBucket: '1h-4h',
            },
        ]);

        expect(
            buildLowSalesItemRows([paidOrder], [
                { id: 'p1', name: 'Oil' },
                { id: 'p2', name: 'Flour' },
                { id: 'p3', name: 'Sugar' },
            ] as any)
        ).toEqual([
            { product: 'Sugar', quantity: 0, sales: 0, status: 'No sales' },
            { product: 'Flour', quantity: 1, sales: 5.5, status: 'Low sales' },
            { product: 'Oil', quantity: 2, sales: 10, status: 'Low sales' },
        ]);
    });

    it('subtracts captured refund tenders from payment summaries and falls back for legacy refunds', () => {
        const refunds: any[] = [
            {
                orderId: paidOrder.id,
                refundAmount: 4,
                refundPayments: [{ type: 'CC', amount: 4 }],
            },
            {
                orderId: paidOrder.id,
                refundAmount: 2,
            },
        ];

        expect(
            buildPaymentSummaryRows(
                [paidOrder] as any,
                refunds as any
            )
        ).toEqual([
            { paymentType: 'Cash', amount: 4.79, count: 1, percent: '50%' },
            { paymentType: 'Cards', amount: 4.71, count: 1, percent: '50%' },
        ]);
    });

    it('reports processing fee recovery separately from base card sales', () => {
        const surchargeOrder: any = {
            ...paidOrder,
            id: 'order-surcharge-1',
            total: 101.8,
            paymentInfo: {
                payments: [
                    { type: 'CC', amount: 60, surchargeAmount: 1.8 },
                    { type: 'CASH', amount: 40 },
                ],
            },
        };

        expect(buildPaymentSummaryRows([surchargeOrder] as any)).toEqual([
            { paymentType: 'Cards', amount: 60, count: 1, percent: '59%' },
            {
                paymentType: 'Cash',
                amount: 40,
                count: 1,
                percent: '39%',
            },
            {
                paymentType: 'Processing Fee Recovery',
                amount: 1.8,
                count: 1,
                percent: '2%',
            },
        ]);
    });

    it('nets partial refunds out of sales-facing aggregations', () => {
        expect(buildSalesByEmployeeRows([paidOrder] as any, [partialRefund] as any)).toEqual([
            { employeeName: 'Ada', amount: 10.5, tax: 0 },
        ]);

        expect(buildSalesByProductRows([paidOrder] as any, partialRefundLines as any)).toEqual([
            { productId: 'p1', quantity: 1, sales: 5, tax: 0 },
            { productId: 'p2', quantity: 1, sales: 5.5, tax: 0 },
        ]);

        expect(
            buildCategoryPerformanceRows(
                [paidOrder] as any,
                { c1: 'Oils', c2: 'Baking' },
                partialRefundLines as any
            )
        ).toEqual([
            { category: 'Baking', sales: 5.5, tax: 0, units: 1 },
            { category: 'Oils', sales: 5, tax: 0, units: 1 },
        ]);

        expect(buildHourlySalesRows([paidOrder] as any, [partialRefund] as any)).toEqual([
            { hour: '09:00', sales: 10.5, tax: 0, orders: 1, averageTicket: 10.5 },
        ]);

        expect(
            buildEbtSummaryRows(
                [paidOrder] as any,
                [partialRefund] as any,
                partialRefundLines as any
            )
        ).toEqual([
            { metric: 'EBT Eligible Sales', amount: 5 },
            { metric: 'EBT Tendered', amount: 0 },
            { metric: 'Non-EBT Tendered', amount: 10.5 },
        ]);

        expect(
            buildLowSalesItemRows(
                [paidOrder] as any,
                [
                    { id: 'p1', name: 'Oil' },
                    { id: 'p2', name: 'Flour' },
                ] as any,
                partialRefundLines as any
            )
        ).toEqual([
            { product: 'Flour', quantity: 1, sales: 5.5, status: 'Low sales' },
            { product: 'Oil', quantity: 1, sales: 5, status: 'Low sales' },
        ]);
    });

    it('scales discount totals for partially refunded orders and drops fully refunded ones', () => {
        expect(
            buildDiscountReportRows(
                [paidOrder] as any,
                [partialRefund] as any,
                partialRefundLines as any
            )
        ).toEqual([{ discount: 'Oil Promo', amount: 0.85, orders: 1 }]);

        expect(
            buildDiscountReportRows(
                [paidOrder] as any,
                [{ ...partialRefund, refundAmount: 15.5 }] as any,
                [
                    {
                        ...partialRefundLines[0],
                        lineRefundAmount: 10,
                        quantityRefunded: 2,
                    },
                    {
                        refundId: 'refund-1',
                        orderId: 'order-1',
                        orderLineIdentifier: 'line-2',
                        quantityRefunded: 1,
                        lineRefundAmount: 5.5,
                    },
                ] as any
            )
        ).toEqual([]);
    });

    it('includes sold products even when they are missing from the loaded product catalog', () => {
        const rows = buildLowSalesItemRows(
            [
                {
                    lines: [
                        {
                            productId: 'p-missing',
                            productName: 'Zucchini',
                            quantity: 3,
                            price: 2,
                        },
                    ],
                } as any,
            ],
            [{ id: 'p-known', name: 'Apple' }] as any
        );

        expect(rows).toEqual(
            expect.arrayContaining([
                { product: 'Apple', quantity: 0, sales: 0, status: 'No sales' },
                { product: 'Zucchini', quantity: 3, sales: 6, status: 'Low sales' },
            ])
        );
    });

    it('nets tax into sales-facing aggregations when orders are partially refunded', () => {
        const taxableOrder: any = {
            ...paidOrder,
            id: 'tax-order',
            total: 22,
            tax: 2,
            lines: [
                {
                    identifier: 'tax-line',
                    productId: 'p1',
                    productName: 'Oil',
                    categoryId: 'c1',
                    quantity: 2,
                    price: 10,
                    lineTotalBeforeTax: 20,
                    lineTotalAfterTax: 22,
                    tax: 2,
                    taxable: true,
                },
            ],
        };
        const taxRefund: any = {
            orderId: 'tax-order',
            refundAmount: 11,
        };
        const taxRefundLines: any[] = [
            {
                orderId: 'tax-order',
                orderLineIdentifier: 'tax-line',
                quantityRefunded: 1,
                lineRefundAmount: 11,
            },
        ];

        expect(buildSalesByEmployeeRows([taxableOrder], [taxRefund])).toEqual([
            { employeeName: 'Ada', amount: 11, tax: 1 },
        ]);

        expect(
            buildCategoryPerformanceRows([taxableOrder], { c1: 'Oils' }, taxRefundLines)
        ).toEqual([{ category: 'Oils', sales: 10, tax: 1, units: 1 }]);

        expect(buildSalesByProductRows([taxableOrder], taxRefundLines)).toEqual([
            { productId: 'p1', quantity: 1, sales: 10, tax: 1 },
        ]);

        expect(buildHourlySalesRows([taxableOrder], [taxRefund])).toEqual([
            { hour: '09:00', sales: 11, tax: 1, orders: 1, averageTicket: 11 },
        ]);
    });
});
