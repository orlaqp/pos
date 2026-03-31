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
            expect.objectContaining({ employeeId: 'e1', orders: 2, amount: 15 })
        );
    });

    it('returns the remote summary payload as-is', async () => {
        mockGraphql.mockResolvedValue({
            data: {
                getSalesSummary: { totalAmount: 20, totalOrders: 1 },
            },
        });

        const summary = await getSalesSummaryForRange(OrderStatus.PAID, range);
        expect(summary?.totalAmount).toBe(20);
        expect(summary?.totalOrders).toBe(1);
    });

    it('returns an empty remote summary payload when backend sends one', async () => {
        mockGraphql.mockResolvedValue({
            data: {
                getSalesSummary: { totalAmount: 0, totalOrders: 0 },
            },
        });

        const summary = await getSalesSummaryForRange(OrderStatus.PAID, range);
        expect(summary).toEqual({ totalAmount: 0, totalOrders: 0 });
    });

    it('returns remote sales rows directly', async () => {
        mockGraphql.mockResolvedValue({
            data: {
                getSales: [
                    {
                        id: 'o1',
                        status: 'PAID',
                    },
                ],
            },
        });

        const result = await getSalesForRange(OrderStatus.PAID, range);
        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(1);
    });

    it('returns an empty list when remote sales query fails', async () => {
        mockGraphql.mockRejectedValue(new Error('network'));

        const result = await getSalesForRange(OrderStatus.PAID, range);
        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(0);
    });

    it('returns undefined on remote summary failure', async () => {
        mockGraphql.mockRejectedValue(new Error('network'));

        const summary = await getSalesSummaryForRange(OrderStatus.PAID, range);
        expect(summary).toBeUndefined();
    });
});
