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
} from './report-aggregations';
import { OrderStatus } from '@pos/shared/models';

describe('report-aggregations', () => {
    const paidOrder: any = {
        orderNo: '1001',
        orderDate: '2026-03-16T09:00:00.000Z',
        updatedAt: '2026-03-16T09:05:00.000Z',
        status: OrderStatus.PAID,
        employeeName: 'Ada',
        total: 15.5,
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

    it('builds category, payment, discount, hourly, and ebt summaries', () => {
        expect(
            buildCategoryPerformanceRows([paidOrder], { c1: 'Oils', c2: 'Baking' })
        ).toEqual([
            { category: 'Oils', sales: 10, units: 2 },
            { category: 'Baking', sales: 5.5, units: 1 },
        ]);

        expect(buildPaymentSummaryRows([paidOrder])).toEqual([
            { paymentType: 'Cards', amount: 10, count: 1, percent: '65%' },
            { paymentType: 'Cash', amount: 5.5, count: 1, percent: '35%' },
        ]);

        expect(buildDiscountReportRows([paidOrder])).toEqual([
            { discount: 'Oil Promo', amount: 1.25, orders: 1 },
        ]);

        expect(buildHourlySalesRows([paidOrder])).toEqual([
            { hour: '09:00', sales: 15.5, orders: 1, averageTicket: 15.5 },
        ]);

        expect(buildEbtSummaryRows([paidOrder])).toEqual([
            { metric: 'EBT Eligible Sales', amount: 10 },
            { metric: 'EBT Tendered', amount: 3 },
            { metric: 'Non-EBT Tendered', amount: 12.5 },
        ]);
    });

    it('builds refund, open aging, and low/no sales rows', () => {
        const refundedOrder: any = {
            orderNo: '2002',
            orderDate: '2026-03-15T10:00:00.000Z',
            updatedAt: '2026-03-16T08:00:00.000Z',
            status: OrderStatus.REFUNDED,
            employeeName: 'Grace',
            total: 18,
            refundInfo: { employeeName: 'Grace', comments: 'Damaged item' },
            lines: [],
        };
        const openOrder: any = {
            orderNo: '3003',
            orderDate: '2026-03-16T11:30:00.000Z',
            status: OrderStatus.OPEN,
            employeeName: 'Linus',
            total: 22,
            lines: [],
        };

        expect(buildRefundReportRows([refundedOrder])).toEqual([
            {
                orderNo: '2002',
                date: '2026-03-16',
                employee: 'Grace',
                amount: 18,
                reason: 'Damaged item',
            },
        ]);

        expect(buildRefundInsights([refundedOrder])).toEqual({
            totalAmount: 18,
            totalOrders: 1,
            averageAmount: 18,
            topEmployees: [{ name: 'Grace', value: '$18.00' }],
            topProducts: [],
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
});
