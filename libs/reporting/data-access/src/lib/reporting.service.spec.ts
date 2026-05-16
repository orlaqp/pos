import moment from 'moment';
import { Order, OrderStatus } from '@pos/shared/models';
import {
    buildSalesSummaryFromOrders,
    getSalesForRange,
    getSalesSummaryForRange,
    hasSummaryData,
} from './reporting.service';

const mockGraphql = jest.fn();

jest.mock('@pos/shared/amplify', () => ({
    API: {
        graphql: (...args: unknown[]) => mockGraphql(...args),
    },
}));

describe('reporting.service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const range = {
        startDate: moment('2026-03-01').startOf('day'),
        endDate: moment('2026-03-31').endOf('day'),
    };

    it('detects summary data correctly', () => {
        expect(hasSummaryData(undefined)).toBe(false);
        expect(hasSummaryData({ totalAmount: 0, totalOrders: 0 } as any)).toBe(false);
        expect(hasSummaryData({ totalAmount: 1, totalOrders: 0 } as any)).toBe(true);
    });

    it('builds local summary from orders', () => {
        const orders = [
            {
                id: 'o1',
                employeeId: 'e1',
                employeeName: 'Cashier A',
                createdBy: { id: 'seller-1', name: 'Seller A' },
                total: 10,
                orderDate: '2026-03-10T10:00:00.000Z',
                lines: [
                    {
                        productId: 'p1',
                        productName: 'Apple',
                        unitOfMeasure: 'EA',
                        quantity: 2,
                        price: 2.5,
                    },
                ],
            },
            {
                id: 'o2',
                employeeId: 'e1',
                employeeName: 'Cashier A',
                createdBy: { id: 'seller-1', name: 'Seller A' },
                total: 5,
                orderDate: '2026-03-11T10:00:00.000Z',
                lines: [
                    {
                        productId: 'p1',
                        productName: 'Apple',
                        unitOfMeasure: 'EA',
                        quantity: 1,
                        price: 5,
                    },
                ],
            },
        ] as unknown as Order[];

        const summary = buildSalesSummaryFromOrders(orders);
        expect(summary.totalOrders).toBe(2);
        expect(summary.totalAmount).toBe(15);
        expect(summary.employees?.[0]).toEqual(
            expect.objectContaining({
                employeeId: 'seller-1',
                employeeName: 'Seller A',
                orders: 2,
                amount: 15,
            })
        );
    });

    it('falls back to order employee fields when createdBy is missing', () => {
        const orders = [
            {
                id: 'o1',
                employeeId: 'cashier-1',
                employeeName: 'Cashier A',
                total: 9,
                orderDate: '2026-03-10T10:00:00.000Z',
                lines: [],
            },
        ] as unknown as Order[];

        const summary = buildSalesSummaryFromOrders(orders);
        expect(summary.employees?.[0]).toEqual(
            expect.objectContaining({
                employeeId: 'cashier-1',
                employeeName: 'Cashier A',
                orders: 1,
                amount: 9,
            })
        );
    });

    it('returns the remote summary payload as-is', async () => {
        mockGraphql.mockResolvedValue({
            data: {
                getSalesSummary: { totalAmount: 20, totalOrders: 1 },
            },
        });

        const summary = await getSalesSummaryForRange(
            [OrderStatus.PAID, OrderStatus.PARTIALLY_REFUNDED],
            range
        );
        expect(summary?.totalAmount).toBe(20);
        expect(summary?.totalOrders).toBe(1);
        expect(mockGraphql).toHaveBeenCalledWith(
            expect.objectContaining({
                variables: expect.objectContaining({
                    statuses: [OrderStatus.PAID, OrderStatus.PARTIALLY_REFUNDED],
                }),
            })
        );
    });

    it('returns an empty remote summary payload when backend sends one', async () => {
        mockGraphql.mockResolvedValue({
            data: {
                getSalesSummary: { totalAmount: 0, totalOrders: 0 },
            },
        });

        const summary = await getSalesSummaryForRange(
            [OrderStatus.PAID, OrderStatus.PARTIALLY_REFUNDED],
            range
        );
        expect(summary).toEqual({ totalAmount: 0, totalOrders: 0 });
    });

    it('returns remote sales rows directly', async () => {
        mockGraphql.mockResolvedValue({
            data: {
                getSales: [
                    {
                        id: 'o1',
                        status: 'PAID',
                        createdAt: '2026-03-10T10:00:00.000Z',
                    },
                ],
            },
        });

        const result = await getSalesForRange(
            [OrderStatus.PAID, OrderStatus.PARTIALLY_REFUNDED],
            range
        );
        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(1);
        expect(mockGraphql).toHaveBeenCalledWith(
            expect.objectContaining({
                query: expect.stringContaining('createdBy'),
                variables: expect.objectContaining({
                    statuses: [OrderStatus.PAID, OrderStatus.PARTIALLY_REFUNDED],
                }),
            })
        );
        expect(mockGraphql).toHaveBeenCalledWith(
            expect.objectContaining({
                query: expect.stringContaining('lineDiscountTotal'),
            })
        );
        expect(mockGraphql).toHaveBeenCalledWith(
            expect.objectContaining({
                query: expect.not.stringContaining(`orderDate
      createdAt
      updatedAt`),
            })
        );
    });

    it('returns an empty list when remote sales query fails', async () => {
        mockGraphql.mockRejectedValue(new Error('network'));

        const result = await getSalesForRange(
            [OrderStatus.PAID, OrderStatus.PARTIALLY_REFUNDED],
            range
        );
        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(0);
    });

    it('splits sales ranges recursively when AppSync reports transformation too large', async () => {
        const longRange = {
            startDate: moment('2026-04-01').startOf('day'),
            endDate: moment('2026-04-16').endOf('day'),
        };

        mockGraphql
            .mockRejectedValueOnce({
                data: { getSales: null },
                errors: [{ message: 'Transformation too large', errorType: 'MappingTemplate' }],
            })
            .mockResolvedValueOnce({
                data: {
                    getSales: [
                        {
                            id: 'o1',
                            orderDate: '2026-04-03T10:00:00.000Z',
                            updatedAt: '2026-04-16T10:00:00.000Z',
                        },
                    ],
                },
            })
            .mockResolvedValueOnce({
                data: {
                    getSales: [
                        {
                            id: 'o2',
                            orderDate: '2026-04-06T10:00:00.000Z',
                            updatedAt: '2026-04-20T10:00:00.000Z',
                        },
                        {
                            id: 'o3',
                            orderDate: '2026-04-09T10:00:00.000Z',
                            updatedAt: '2026-04-19T10:00:00.000Z',
                        },
                        {
                            id: 'o4',
                            orderDate: '2026-04-12T10:00:00.000Z',
                            updatedAt: '2026-04-18T10:00:00.000Z',
                        },
                        {
                            id: 'o5',
                            orderDate: '2026-04-15T10:00:00.000Z',
                            updatedAt: '2026-04-17T10:00:00.000Z',
                        },
                        {
                            id: 'o5',
                            orderDate: '2026-04-15T10:00:00.000Z',
                            updatedAt: '2026-04-21T10:00:00.000Z',
                        },
                    ],
                },
            });

        const result = await getSalesForRange(
            [OrderStatus.PAID, OrderStatus.PARTIALLY_REFUNDED],
            longRange
        );

        expect(mockGraphql).toHaveBeenCalledTimes(3);
        expect(result.map((order) => order.id)).toEqual([
            'o5',
            'o4',
            'o3',
            'o2',
            'o1',
        ]);
    });

    it('returns undefined on remote summary failure', async () => {
        mockGraphql.mockRejectedValue(new Error('network'));

        const summary = await getSalesSummaryForRange(
            [OrderStatus.PAID, OrderStatus.PARTIALLY_REFUNDED],
            range
        );
        expect(summary).toBeUndefined();
    });
});
