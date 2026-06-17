import {
    buildOrderPaymentDetailRows,
    filterOrders,
    getEmployeeItems,
    getProductItems,
} from './end-of-day.service';

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
            CREDIT: 0,
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
                createdAt: '2026-04-21T12:00:00.000Z',
                total: 2,
                paymentInfo: { payments: [{ type: 'CASH', amount: 2 }] },
                lines: [{ productId: 'p1' }],
            },
            {
                createdBy: { id: 'y' },
                createdAt: '2026-04-21T13:00:00.000Z',
                total: 7,
                paymentInfo: { payments: [{ type: 'CC', amount: 3 }, { type: 'EBT', amount: 4 }] },
                lines: [{ productId: 'p2' }],
            },
        ];

        const all = filterOrders(orders as any, {});
        const onlyP2 = filterOrders(orders as any, { productId: 'p2' });

        expect(all.orders).toHaveLength(2);
        expect(all.summary).toEqual({ CASH: 2, CC: 3, CHECK: 0, EBT: 4, CREDIT: 0 });
        expect(all.totalAmount).toBe(9);
        expect(onlyP2.orders).toHaveLength(1);
        expect(onlyP2.orders[0].lines[0].productId).toBe('p2');
        expect(onlyP2.summary).toEqual({ CASH: 0, CC: 3, CHECK: 0, EBT: 4, CREDIT: 0 });
        expect(onlyP2.totalAmount).toBe(7);
    });

    it('includes customer credit in end-of-day payment summaries and refund rows', () => {
        const orders: any[] = [
            {
                id: 'credit-order',
                total: 25,
                paymentInfo: {
                    payments: [
                        { type: 'CREDIT', amount: 15 },
                        { type: 'CASH', amount: 10 },
                    ],
                },
                lines: [
                    {
                        identifier: 'line-1',
                        productId: 'p1',
                        quantity: 1,
                        lineTotalBeforeTax: 25,
                        ebtPaidAmount: 0,
                        nonEbtPaidAmount: 25,
                    },
                ],
            },
        ];
        const refunds: any[] = [
            {
                id: 'credit-refund',
                orderId: 'credit-order',
                refundAmount: 5,
                refundPayments: [{ type: 'CREDIT', amount: 5 }],
            },
        ];

        const result = filterOrders(orders as any, {}, refunds as any, []);

        expect(result.summary).toEqual({
            CASH: 10,
            CC: 0,
            CHECK: 0,
            EBT: 0,
            CREDIT: 10,
        });
        expect(buildOrderPaymentDetailRows(orders[0], refunds as any, [])).toEqual([
            { type: 'CREDIT', amount: 15, kind: 'payment' },
            { type: 'CASH', amount: 10, kind: 'payment' },
            { type: 'CREDIT', amount: 5, kind: 'refund' },
        ]);
    });

    it('sorts filtered orders by ticket creation time descending', () => {
        const orders: any[] = [
            {
                id: 'older-order',
                createdAt: '2026-04-21T12:00:00.000Z',
                updatedAt: '2026-04-21T18:00:00.000Z',
                paymentInfo: { payments: [] },
                lines: [],
            },
            {
                id: 'newer-order',
                createdAt: '2026-04-21T13:00:00.000Z',
                updatedAt: '2026-04-21T17:00:00.000Z',
                paymentInfo: { payments: [] },
                lines: [],
            },
        ];

        const result = filterOrders(orders as any, {});

        expect(result.orders.map((order) => order.id)).toEqual([
            'newer-order',
            'older-order',
        ]);
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
            CREDIT: 0,
        });
        expect(result.totalAmount).toBe(15);
        expect(result.references).toEqual({
            grossSales: 20,
            discounts: 0,
            refunds: 5,
            netSales: 15,
        });
    });

    it('combines captured and fallback refund tenders for mixed refund histories', () => {
        const orders: any[] = [
            {
                id: 'order-1',
                total: 100,
                paymentInfo: {
                    payments: [
                        { type: 'CC', amount: 60 },
                        { type: 'CASH', amount: 40 },
                    ],
                },
                lines: [
                    {
                        identifier: 'line-card',
                        productId: 'p-1',
                        quantity: 1,
                        lineTotalBeforeTax: 60,
                        ebtPaidAmount: 0,
                        nonEbtPaidAmount: 60,
                    },
                    {
                        identifier: 'line-cash',
                        productId: 'p-2',
                        quantity: 1,
                        lineTotalBeforeTax: 40,
                        ebtPaidAmount: 0,
                        nonEbtPaidAmount: 40,
                    },
                ],
            },
        ];
        const refunds: any[] = [
            {
                id: 'refund-explicit',
                orderId: 'order-1',
                refundAmount: 15,
                refundPayments: [{ type: 'CC', amount: 15 }],
            },
            {
                id: 'refund-legacy',
                orderId: 'order-1',
                refundAmount: 40,
            },
        ];
        const refundLines: any[] = [
            {
                refundId: 'refund-legacy',
                orderId: 'order-1',
                orderLineIdentifier: 'line-cash',
                productId: 'p-2',
                quantityRefunded: 1,
                lineRefundAmount: 40,
            },
        ];

        const result = filterOrders(
            orders as any,
            {},
            refunds as any,
            refundLines as any
        );

        expect(result.summary).toEqual({
            CC: 21,
            CASH: 24,
            CHECK: 0,
            EBT: 0,
            CREDIT: 0,
        });
        expect(result.totalAmount).toBe(45);
    });

    it('builds payment detail rows with original and refund tenders reconciled', () => {
        const order: any = {
            id: 'order-1',
            paymentInfo: {
                payments: [
                    { type: 'EBT', amount: 50 },
                    { type: 'CC', amount: 20 },
                ],
            },
            lines: [
                {
                    identifier: 'line-1',
                    quantity: 1,
                    lineTotalBeforeTax: 20,
                    ebtPaidAmount: 0,
                    nonEbtPaidAmount: 20,
                },
            ],
        };
        const refunds: any[] = [
            {
                id: 'refund-1',
                orderId: 'order-1',
                refundAmount: 5,
                refundPayments: [{ type: 'CC', amount: 5 }],
            },
        ];

        expect(buildOrderPaymentDetailRows(order, refunds as any, [])).toEqual([
            { type: 'EBT', amount: 50, kind: 'payment' },
            { type: 'CC', amount: 20, kind: 'payment' },
            { type: 'CC', amount: 5, kind: 'refund' },
        ]);
    });
});
