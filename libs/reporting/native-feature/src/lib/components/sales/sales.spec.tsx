import React from 'react';
import { buildSalesRows } from './sales';

describe('Sales', () => {
    it('nets partial refunds out of the displayed sales amount', () => {
        const rows = buildSalesRows(
            [
                {
                    id: 'order-1',
                    orderNo: '001',
                    orderDate: '2026-04-21T12:00:00.000Z',
                    createdAt: '2026-04-21T12:00:00.000Z',
                    total: 58.96,
                    createdBy: { name: 'Cashier A' },
                },
                {
                    id: 'order-2',
                    orderNo: '002',
                    orderDate: '2026-04-21T13:00:00.000Z',
                    createdAt: '2026-04-21T13:00:00.000Z',
                    total: 148.95,
                    employeeName: 'Cashier B',
                    paymentInfo: {
                        payments: [
                            { type: 'CREDIT', amount: 50 },
                            { type: 'CASH', amount: 98.95 },
                        ],
                    },
                },
            ] as any,
            [
                {
                    id: 'refund-1',
                    orderId: 'order-1',
                    refundAmount: 33.98,
                },
                {
                    id: 'refund-2',
                    orderId: 'order-1',
                    refundAmount: 0,
                },
            ] as any
        );

        expect(rows[0]).toEqual(
            expect.objectContaining({
                orderNo: '002',
                employee: 'Cashier B',
                paymentBreakdown: 'Customer Credit: $50.00, Cash: $98.95',
                amount: 148.95,
            })
        );
        expect(rows[1]).toEqual(
            expect.objectContaining({
                orderNo: '001',
                employee: 'Cashier A',
                amount: 24.98,
            })
        );
    });

    it('sorts sale rows by ticket creation date descending, not by later updates', () => {
        const rows = buildSalesRows(
            [
                {
                    id: 'order-older',
                    orderNo: '001',
                    orderDate: '2026-04-21T12:00:00.000Z',
                    createdAt: '2026-04-21T12:00:00.000Z',
                    updatedAt: '2026-04-21T16:00:00.000Z',
                    total: 58.96,
                    createdBy: { name: 'Cashier A' },
                },
                {
                    id: 'order-newer',
                    orderNo: '002',
                    orderDate: '2026-04-21T13:00:00.000Z',
                    createdAt: '2026-04-21T13:00:00.000Z',
                    updatedAt: '2026-04-21T15:00:00.000Z',
                    total: 148.95,
                    employeeName: 'Cashier B',
                },
            ] as any,
            [] as any
        );

        expect(rows.map((row) => row.orderNo)).toEqual(['002', '001']);
    });
});
