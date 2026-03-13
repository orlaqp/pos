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
                createdBy: { id: 'open-1' },
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
        });
    });

    it('filters by product id when provided and keeps all orders otherwise', () => {
        const orders: any[] = [
            {
                createdBy: { id: 'x' },
                paymentInfo: { payments: [{ type: 'CASH', amount: 2 }] },
                lines: [{ productId: 'p1' }],
            },
            {
                createdBy: { id: 'y' },
                paymentInfo: { payments: [{ type: 'CC', amount: 3 }] },
                lines: [{ productId: 'p2' }],
            },
        ];

        const all = filterOrders(orders as any, {});
        const onlyP2 = filterOrders(orders as any, { productId: 'p2' });

        expect(all.orders).toHaveLength(2);
        expect(onlyP2.orders).toHaveLength(1);
        expect(onlyP2.orders[0].lines[0].productId).toBe('p2');
    });
});
