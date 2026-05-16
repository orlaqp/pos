/* eslint-disable import/first */
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import moment from 'moment';
import * as mockReactNative from 'react-native';

const mockGetOrdersForStatuses = jest.fn();
const mockGetRefundsForRange = jest.fn();
const mockGetRefundLinesForRefundIds = jest.fn();
const mockProductsById: Record<string, { cost?: number | null }> = {};

jest.mock('@pos/reporting/data-access', () => ({
    getOrdersForStatuses: (...args: unknown[]) => mockGetOrdersForStatuses(...args),
    getRefundsForRange: (...args: unknown[]) => mockGetRefundsForRange(...args),
    getRefundLinesForRefundIds: (...args: unknown[]) =>
        mockGetRefundLinesForRefundIds(...args),
}));

jest.mock('@pos/products/data-access', () => ({
    selectProductsEntities: () => mockProductsById,
}));

jest.mock('@pos/shared/ui-native', () => ({
    UIScreen: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    UICard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    UIStack: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    UIDateRange: () => <mockReactNative.Text>DateRange</mockReactNative.Text>,
    UIEmptyState: ({ text }: { text: string }) => (
        <mockReactNative.Text>{text}</mockReactNative.Text>
    ),
    UISpinner: ({ message }: { message: string }) => (
        <mockReactNative.Text>{message}</mockReactNative.Text>
    ),
}));

jest.mock('../pie-chart/pie-chart', () => ({
    __esModule: true,
    default: ({ header }: { header: string }) => <>{header}</>,
}));

jest.mock('../list-widget/list-widget', () => ({
    __esModule: true,
    default: ({ header }: { header: string }) => <>{header}</>,
}));

jest.mock('../widget/widget', () => ({
    __esModule: true,
    default: ({ text, value }: { text: string; value: string }) => (
        <>
            {text}:{value}
        </>
    ),
}));

jest.mock('../line-chart/line-chart', () => ({
    LineChartComponent: ({ header }: { header: string }) => <>{header}</>,
}));

import {
    areDashboardRangesEqual,
    buildDashboardSupplemental,
    buildDashboardSummaryFromOrders,
    getDashboardNetAverageTicket,
    getDashboardNetGrossIncome,
    buildRevenueOverTime,
    buildTopEmployeeItems,
    buildTopProductItems,
    Dashboard,
    getDashboardAverageTicket,
    hasSalesData,
    normalizeDashboardRange,
    sortDashboardSummary,
} from './dashboard';

describe('Dashboard', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        Object.keys(mockProductsById).forEach((key) => {
            delete mockProductsById[key];
        });
        mockGetOrdersForStatuses.mockResolvedValue([]);
        mockGetRefundsForRange.mockResolvedValue([]);
        mockGetRefundLinesForRefundIds.mockResolvedValue([]);
    });

    it('renders loading state', () => {
        mockGetOrdersForStatuses.mockReturnValue(new Promise(() => undefined));
        const { getByText } = render(<Dashboard />);
        expect(getByText('Loading...')).toBeTruthy();
    });

    it('normalizes range to day boundaries', () => {
        const normalized = normalizeDashboardRange({
            startDate: moment('2026-03-10T13:00:00'),
            endDate: moment('2026-03-10T14:00:00'),
        } as any);

        expect(normalized.startDate.hour()).toBe(0);
        expect(normalized.endDate.hour()).toBe(23);
    });

    it('uses current day when normalizing empty range', () => {
        const normalized = normalizeDashboardRange();
        expect(moment.isMoment(normalized.startDate)).toBe(true);
        expect(moment.isMoment(normalized.endDate)).toBe(true);
        expect(normalized.startDate.hour()).toBe(0);
        expect(normalized.endDate.hour()).toBe(23);
    });

    it('treats identical normalized ranges as equal', () => {
        const left = normalizeDashboardRange({
            startDate: moment('2026-04-08T00:00:00'),
            endDate: moment('2026-04-08T23:59:59'),
        } as any);
        const right = normalizeDashboardRange({
            startDate: moment('2026-04-08T12:00:00'),
            endDate: moment('2026-04-08T12:30:00'),
        } as any);

        expect(areDashboardRangesEqual(left, right)).toBe(true);
    });

    it('sorts summary employees/products descending and keeps reference', () => {
        const summary: any = {
            employees: [{ amount: 2 }, { amount: 10 }],
            products: [{ quantity: 1 }, { quantity: 5 }],
        };

        const result = sortDashboardSummary(summary);
        expect(result).toBe(summary);
        expect(result.employees[0].amount).toBe(10);
        expect(result.products[0].quantity).toBe(5);
    });

    it('builds dashboard helper data consistently', () => {
        const summary: any = {
            totalAmount: 15.5,
            totalOrders: 1,
            products: [
                { productName: 'Apples', unitOfMeasure: 'EA', quantity: 2, amount: 10 },
                { productName: 'Flour', unitOfMeasure: 'LB', quantity: 2.345, amount: 5.5 },
                { productName: 'Skip', unitOfMeasure: 'EA', quantity: 1, amount: 0 },
            ],
            employees: [{ employeeName: 'Ada', amount: 15.5 }],
            dates: [{ datePart: '2026-03-12', amount: 15.5 }],
        };

        expect(hasSalesData(summary)).toBe(true);
        expect(hasSalesData({ totalAmount: 0 } as any)).toBe(false);
        expect(buildTopProductItems(summary)).toEqual([
            { name: 'EA - Apples', value: 2 },
            { name: 'LB - Flour', value: 2.35 },
        ]);
        expect(buildTopEmployeeItems(summary)).toEqual([
            { name: 'Ada', value: '$15.50' },
        ]);
        expect(buildRevenueOverTime(summary)).toEqual([
            { label: '03-12', values: [15.5] },
        ]);
        expect(getDashboardAverageTicket(summary)).toBe(15.5);
        expect(getDashboardNetGrossIncome(summary, [{ refundAmount: 3 }] as any)).toBe(15.5);
        expect(getDashboardNetAverageTicket(summary, [{ refundAmount: 3 }] as any)).toBe(
            15.5
        );

        mockProductsById.p1 = { cost: 1.5 };
        mockProductsById.p2 = { cost: 2 };

        const supplemental = buildDashboardSupplemental(
            [
                {
                    discountTotal: 1.25,
                    paymentInfo: {
                        payments: [
                            { type: 'CC', amount: 10 },
                            { type: 'CASH', amount: 5.5 },
                        ],
                    },
                    lines: [
                        {
                            productId: 'p1',
                            categoryId: 'c1',
                            price: 2.5,
                            quantity: 2,
                            lineTotalBeforeTax: 4.25,
                        },
                        {
                            productId: 'p2',
                            categoryId: 'c2',
                            price: 5.5,
                            quantity: 1,
                            lineTotalBeforeTax: 5,
                        },
                    ],
                },
            ] as any,
            { c1: 'Produce', c2: 'Baking' },
            mockProductsById,
            [
                {
                    productId: 'p1',
                    quantityRefunded: 1,
                    lineRefundAmount: 2.5,
                },
            ] as any,
            [{ refundAmount: 2.5 }] as any
        );

        expect(supplemental.totalDiscounts).toBe(1.25);
        expect(supplemental.discountedOrders).toBe(1);
        expect(supplemental.topCategories).toEqual([
            { name: 'Baking', value: '$5.00' },
            { name: 'Produce', value: '$4.25' },
        ]);
        expect(supplemental.paymentMix).toEqual([
            { name: 'Cards', value: 8.39 },
            { name: 'Cash', value: 4.61 },
        ]);
        expect(supplemental.paymentMixBreakdown).toEqual([
            { name: 'Cards', value: '$8.39' },
            { name: 'Cash', value: '$4.61' },
        ]);
        expect(supplemental.paymentMixPercentages).toEqual([
            {
                name: 'Cards',
                amount: '$8.39',
                percent: '65%',
                ratio: 8.39 / 13,
            },
            {
                name: 'Cash',
                amount: '$4.61',
                percent: '35%',
                ratio: 4.61 / 13,
            },
        ]);
        expect(supplemental.estimatedGrossProfit).toBe(4.25);
        expect(supplemental.missingCostLineCount).toBe(0);
        expect(supplemental.missingCostProductCount).toBe(0);
        expect(supplemental.excludedSalesAmount).toBe(0);
        expect(supplemental.refundAmountTotal).toBe(2.5);
        expect(supplemental.refundedGrossProfitOffset).toBe(1);
    });

    it('subtracts captured refund tenders from dashboard payment mix', () => {
        const supplemental = buildDashboardSupplemental(
            [
                {
                    id: 'order-1',
                    discountTotal: 0,
                    paymentInfo: {
                        payments: [
                            { type: 'CC', amount: 12 },
                            { type: 'CASH', amount: 8 },
                        ],
                    },
                    lines: [],
                },
            ] as any,
            {},
            {},
            [] as any,
            [
                {
                    orderId: 'order-1',
                    refundAmount: 5,
                    refundPayments: [{ type: 'CASH', amount: 5 }],
                },
            ] as any
        );

        expect(supplemental.paymentMix).toEqual([
            { name: 'Cards', value: 12 },
            { name: 'Cash', value: 3 },
        ]);
        expect(supplemental.paymentMixBreakdown).toEqual([
            { name: 'Cards', value: '$12.00' },
            { name: 'Cash', value: '$3.00' },
        ]);
    });

    it('builds dashboard summary from paid and partially refunded orders using order date', () => {
        const summary = buildDashboardSummaryFromOrders([
            {
                orderDate: '2026-04-20T10:00:00.000Z',
                total: 20,
                employeeId: 'emp-1',
                employeeName: 'Ada',
                lines: [
                    {
                        productId: 'p1',
                        productName: 'Huevo',
                        unitOfMeasure: 'EA',
                        quantity: 2,
                        price: 4.99,
                        lineTotalBeforeTax: 6.99,
                    },
                ],
            },
            {
                orderDate: '2026-04-20T12:00:00.000Z',
                total: 15,
                employeeId: 'emp-2',
                employeeName: 'Bob',
                lines: [
                    {
                        productId: 'p2',
                        productName: 'Leche',
                        unitOfMeasure: 'EA',
                        quantity: 1,
                        price: 3.5,
                        lineTotalBeforeTax: 3.5,
                    },
                ],
            },
        ] as any);

        expect(summary.totalAmount).toBe(35);
        expect(summary.totalOrders).toBe(2);
        expect(summary.dates).toEqual([
            { datePart: '2026-04-20', orders: 2, amount: 35 },
        ]);
        expect(summary.products).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ productId: 'p1', amount: 6.99 }),
                expect.objectContaining({ productId: 'p2', amount: 3.5 }),
            ])
        );
    });

    it('nets dashboard summary totals with refunds by order and product', () => {
        const summary = buildDashboardSummaryFromOrders(
            [
                {
                    id: 'o-1',
                    orderDate: '2026-04-21T10:00:00.000Z',
                    total: 58.96,
                    employeeId: 'emp-1',
                    employeeName: 'Ada',
                    lines: [
                        {
                            productId: 'p1',
                            productName: 'Huevo',
                            unitOfMeasure: 'EA',
                            quantity: 2,
                            price: 29.48,
                            lineTotalBeforeTax: 58.96,
                        },
                    ],
                },
                {
                    id: 'o-2',
                    orderDate: '2026-04-21T11:00:00.000Z',
                    total: 148.95,
                    employeeId: 'emp-1',
                    employeeName: 'Ada',
                    lines: [
                        {
                            productId: 'p2',
                            productName: 'Aceite',
                            unitOfMeasure: 'EA',
                            quantity: 1,
                            price: 148.95,
                            lineTotalBeforeTax: 148.95,
                        },
                    ],
                },
                {
                    id: 'o-3',
                    orderDate: '2026-04-21T12:00:00.000Z',
                    total: 78.96,
                    employeeId: 'emp-1',
                    employeeName: 'Ada',
                    lines: [
                        {
                            productId: 'p3',
                            productName: 'Leche',
                            unitOfMeasure: 'EA',
                            quantity: 2,
                            price: 39.48,
                            lineTotalBeforeTax: 78.96,
                        },
                    ],
                },
            ] as any,
            [
                { id: 'r-1', orderId: 'o-1', refundAmount: 33.98 },
                { id: 'r-2', orderId: 'o-3', refundAmount: 61.98 },
            ] as any,
            [
                {
                    refundId: 'r-1',
                    orderId: 'o-1',
                    productId: 'p1',
                    quantityRefunded: 1,
                    lineRefundAmount: 33.98,
                },
                {
                    refundId: 'r-2',
                    orderId: 'o-3',
                    productId: 'p3',
                    quantityRefunded: 1,
                    lineRefundAmount: 61.98,
                },
            ] as any
        );

        expect(summary.totalAmount).toBe(190.91);
        expect(summary.totalOrders).toBe(3);
        expect(summary.dates).toEqual([
            { datePart: '2026-04-21', orders: 3, amount: 190.91 },
        ]);
        expect(summary.employees).toEqual([
            expect.objectContaining({ employeeId: 'emp-1', amount: 190.91, orders: 3 }),
        ]);
        expect(summary.products).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    productId: 'p1',
                    amount: expect.closeTo(24.98, 2),
                    quantity: 1,
                }),
                expect.objectContaining({ productId: 'p2', amount: 148.95, quantity: 1 }),
                expect.objectContaining({
                    productId: 'p3',
                    amount: expect.closeTo(16.98, 2),
                    quantity: 1,
                }),
            ])
        );
    });

    it('returns empty helper outputs for missing summary sections', () => {
        expect(buildTopProductItems(undefined)).toEqual([]);
        expect(buildTopEmployeeItems(undefined)).toEqual([]);
        expect(buildRevenueOverTime(undefined)).toBeUndefined();
        expect(getDashboardAverageTicket(undefined)).toBe(0);
    });

    it('excludes lines with missing cost from estimated gross profit and tracks disclosure counts', () => {
        mockProductsById.p1 = { cost: 1.5 };
        mockProductsById.p2 = { cost: null };

        const supplemental = buildDashboardSupplemental(
            [
                {
                    lines: [
                        {
                            productId: 'p1',
                            categoryId: 'c1',
                            price: 2.5,
                            quantity: 2,
                            lineTotalBeforeTax: 4.25,
                        },
                        {
                            productId: 'p2',
                            categoryId: 'c2',
                            price: 5.5,
                            quantity: 1,
                            lineTotalBeforeTax: 5,
                        },
                        {
                            productId: 'p2',
                            categoryId: 'c2',
                            price: 3,
                            quantity: 2,
                        },
                    ],
                },
            ] as any,
            { c1: 'Produce', c2: 'Baking' },
            mockProductsById
        );

        expect(supplemental.estimatedGrossProfit).toBe(1.25);
        expect(supplemental.missingCostLineCount).toBe(2);
        expect(supplemental.missingCostProductCount).toBe(1);
        expect(supplemental.excludedSalesAmount).toBe(11);
    });

    it('renders the estimated gross profit card value', async () => {
        mockProductsById.p1 = { cost: 1.5 };
        mockProductsById.p2 = { cost: 2 };
        mockGetOrdersForStatuses.mockResolvedValue([
            {
                id: 'o-1',
                orderDate: '2026-04-20T08:00:00.000Z',
                total: 25,
                employeeId: 'emp-1',
                employeeName: 'Ada',
                lines: [
                    {
                        productId: 'p1',
                        categoryId: 'c1',
                        price: 2.5,
                        quantity: 2,
                        lineTotalBeforeTax: 4.25,
                    },
                    {
                        productId: 'p2',
                        categoryId: 'c2',
                        price: 5.5,
                        quantity: 1,
                        lineTotalBeforeTax: 5,
                    },
                ],
            },
            {
                id: 'o-2',
                orderDate: '2026-04-20T09:00:00.000Z',
                total: 17.5,
                employeeId: 'emp-2',
                employeeName: 'Bob',
                lines: [],
            },
        ]);
        mockGetRefundsForRange.mockResolvedValue([
            {
                id: 'refund-1',
                orderId: 'o-1',
                refundAmount: 5,
            },
        ]);
        mockGetRefundLinesForRefundIds.mockResolvedValue([
            {
                refundId: 'refund-1',
                productId: 'p1',
                quantityRefunded: 1,
                lineRefundAmount: 4.25,
            },
        ]);

        const { toJSON } = render(<Dashboard />);

        await waitFor(() => {
            const rendered = JSON.stringify(toJSON());
            expect(rendered).toContain('Gross Income');
            expect(rendered).toContain('$ 37.50');
            expect(rendered).toContain('Average Ticket');
            expect(rendered).toContain('$ 18.75');
            expect(rendered).toContain('Est. Gross Profit');
            expect(rendered).toContain('$ 1.50');
            expect(rendered).not.toContain('Estimated profit excludes');
        });
    });

    it('renders the missing-cost disclosure note only when profit excludes sold lines', async () => {
        mockProductsById.p1 = { cost: 1.5 };
        mockProductsById.p2 = { cost: null };
        mockGetOrdersForStatuses.mockResolvedValue([
            {
                orderDate: '2026-04-20T08:00:00.000Z',
                total: 20,
                employeeId: 'emp-1',
                employeeName: 'Ada',
                lines: [
                    {
                        productId: 'p1',
                        categoryId: 'c1',
                        price: 2.5,
                        quantity: 2,
                        lineTotalBeforeTax: 4.25,
                    },
                    {
                        productId: 'p2',
                        categoryId: 'c2',
                        price: 5.5,
                        quantity: 1,
                        lineTotalBeforeTax: 5,
                    },
                ],
            },
        ]);

        const { toJSON } = render(<Dashboard />);

        await waitFor(() => {
            const rendered = JSON.stringify(toJSON());
            expect(rendered).toContain(
                'Estimated profit excludes 1 sold lines with missing cost.'
            );
        });
    });
});
