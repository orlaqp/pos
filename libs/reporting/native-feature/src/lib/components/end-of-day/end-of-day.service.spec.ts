import { filterOrders, getEmployeeItems, getProductItems } from './end-of-day.service';

describe('end-of-day.service', () => {
    it('builds employee dropdown items with All option first', () => {
        const items = getEmployeeItems([
            { id: 'e1', firstName: 'Ada', lastName: 'Lovelace' } as any,
            { id: 'e2', firstName: 'Alan', lastName: 'Turing' } as any,
        ]);

        expect(items).toEqual([
            { label: 'All', value: '' },
            { label: 'Ada Lovelace', value: 'e1' },
            { label: 'Alan Turing', value: 'e2' },
        ]);
    });

    it('builds product dropdown items with All option first', () => {
        const items = getProductItems([
            { id: 'p1', name: 'Apple' } as any,
            { id: 'p2', name: 'Bread' } as any,
        ]);

        expect(items).toEqual([
            { label: 'All', value: '' },
            { label: 'Apple', value: 'p1' },
            { label: 'Bread', value: 'p2' },
        ]);
    });

    it('returns empty arrays when employee or product list is missing', () => {
        expect(getEmployeeItems(undefined as any)).toEqual([]);
        expect(getProductItems(undefined as any)).toEqual([]);
    });

    it('filters orders and computes payment summary by method', () => {
        const orders: any[] = [
            {
                employeeId: 'open-1',
                paymentInfo: {
                    employeeId: 'close-1',
                    payments: [
                        { type: 'CASH', amount: 10 },
                        { type: 'CC', amount: 5 },
                    ],
                },
                lines: [{ productId: 'p1' }],
            },
            {
                createdBy: { id: 'open-2' },
                paymentInfo: {
                    employeeId: 'close-2',
                    payments: [{ type: 'CHECK', amount: 7 }],
                },
                lines: [{ productId: 'p2' }],
            },
        ];

        const result = filterOrders(orders as any, {
            openedBy: 'open-1',
            closedBy: 'close-1',
            productId: 'p1',
        });

        expect(result.orders).toHaveLength(1);
        expect(result.summary).toEqual({
            CASH: 10,
            CC: 5,
            CHECK: 0,
            EBT: 0,
        });
        expect(result.totalAmount).toBe(0);
    });

    it('falls back to order employeeId for opened by filtering when createdBy is absent', () => {
        const orders: any[] = [
            {
                employeeId: 'open-1',
                paymentInfo: { employeeId: 'close-1', payments: [] },
                lines: [],
            },
            {
                employeeId: 'open-2',
                paymentInfo: { employeeId: 'close-2', payments: [] },
                lines: [],
            },
        ];

        const result = filterOrders(orders as any, {
            openedBy: 'open-2',
        });

        expect(result.orders).toHaveLength(1);
        expect(result.orders[0].employeeId).toBe('open-2');
    });

    it('filters by product id when provided and only sums matching orders', () => {
        const orders: any[] = [
            {
                createdBy: { id: 'x' },
                total: 2,
                paymentInfo: { payments: [{ type: 'CASH', amount: 2 }] },
                lines: [{ productId: 'p1' }],
            },
            {
                createdBy: { id: 'y' },
                total: 7,
                paymentInfo: { payments: [{ type: 'CC', amount: 3 }, { type: 'EBT', amount: 4 }] },
                lines: [{ productId: 'p2' }],
            },
        ];

        const all = filterOrders(orders as any, {});
        const onlyP2 = filterOrders(orders as any, { productId: 'p2' });

        expect(all.orders).toHaveLength(2);
        expect(all.summary).toEqual({ CASH: 2, CC: 3, CHECK: 0, EBT: 4 });
        expect(all.totalAmount).toBe(9);
        expect(onlyP2.orders).toHaveLength(1);
        expect(onlyP2.orders[0].lines[0].productId).toBe('p2');
        expect(onlyP2.summary).toEqual({ CASH: 0, CC: 3, CHECK: 0, EBT: 4 });
        expect(onlyP2.totalAmount).toBe(7);
    });

    it('subtracts captured refund tenders from the payment summary for unfiltered reports', () => {
        const orders: any[] = [
            {
                id: 'order-1',
                total: 20,
                discountTotal: 0,
                paymentInfo: {
                    payments: [
                        { type: 'CC', amount: 12 },
                        { type: 'CASH', amount: 8 },
                    ],
                },
                lines: [
                    {
                        identifier: 'line-1',
                        productId: 'p1',
                        quantity: 2,
                        price: 10,
                        lineTotalBeforeTax: 20,
                        ebtPaidAmount: 0,
                        nonEbtPaidAmount: 20,
                    },
                ],
            },
        ];
        const refunds: any[] = [
            {
                id: 'refund-1',
                orderId: 'order-1',
                refundAmount: 5,
                refundPayments: [{ type: 'CASH', amount: 5 }],
            },
        ];

        const result = filterOrders(orders as any, {}, refunds as any, []);

        expect(result.summary).toEqual({
            CASH: 3,
            CC: 12,
            CHECK: 0,
            EBT: 0,
        });
        expect(result.totalAmount).toBe(15);
        expect(result.references).toEqual({
            grossSales: 20,
            discounts: 0,
            refunds: 5,
            netSales: 15,
        });
    });
});
