import moment from 'moment';
import { Order, OrderStatus } from '@pos/shared/models';
import {
    buildSalesSummaryFromOrders,
    getSalesForRange,
    getSalesSummaryForRange,
    hasSummaryData,
} from './reporting.service';

const mockGraphql = jest.fn();
const mockDataStoreQuery = jest.fn();

jest.mock('@pos/shared/amplify', () => ({
    API: {
        graphql: (...args: unknown[]) => mockGraphql(...args),
    },
    DataStore: {
        query: (...args: unknown[]) => mockDataStoreQuery(...args),
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

    it('falls back to local DataStore when remote summary is empty', async () => {
        mockGraphql.mockResolvedValue({
            data: {
                getSalesSummary: { totalAmount: 0, totalOrders: 0 },
            },
        });
        mockDataStoreQuery.mockResolvedValue([
            {
                id: 'o1',
                status: 'PAID',
                employeeId: 'e1',
                employeeName: 'Cashier A',
                total: 20,
                orderDate: '2026-03-15T10:00:00.000Z',
                lines: [],
            },
        ]);

        const summary = await getSalesSummaryForRange(OrderStatus.PAID, range);
        expect(mockDataStoreQuery).toHaveBeenCalled();
        expect(summary?.totalAmount).toBe(20);
        expect(summary?.totalOrders).toBe(1);
    });

    it('uses updatedAt as paid event date when filtering local fallback', async () => {
        mockGraphql.mockResolvedValue({
            data: {
                getSalesSummary: { totalAmount: 0, totalOrders: 0 },
            },
        });
        mockDataStoreQuery.mockResolvedValue([
            {
                id: 'o-outside',
                status: 'PAID',
                employeeId: 'e1',
                employeeName: 'Cashier A',
                total: 10,
                orderDate: '2026-02-20T10:00:00.000Z',
                updatedAt: '2026-03-15T18:00:00.000Z',
                lines: [],
            },
        ]);

        const summary = await getSalesSummaryForRange(OrderStatus.PAID, range);
        expect(summary?.totalOrders).toBe(1);
        expect(summary?.totalAmount).toBe(10);
    });

    it('falls back to local DataStore when remote sales query fails', async () => {
        mockGraphql.mockRejectedValue(new Error('network'));
        mockDataStoreQuery.mockResolvedValue([
            {
                id: 'o1',
                status: 'PAID',
                employeeId: 'e1',
                employeeName: 'Cashier A',
                total: 20,
                orderDate: '2026-03-15T10:00:00.000Z',
                lines: [],
            },
        ]);

        const result = await getSalesForRange(OrderStatus.PAID, range);
        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(1);
    });
});
