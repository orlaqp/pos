/* eslint-disable import/first */
import React from 'react';
import { render } from '@testing-library/react-native';
import moment from 'moment';
import * as mockReactNative from 'react-native';

const mockGetSalesSummaryForRange = jest.fn();
const mockGetLocalSalesSummaryForRange = jest.fn();

jest.mock('@pos/reporting/data-access', () => ({
    getSalesSummaryForRange: (...args: unknown[]) =>
        mockGetSalesSummaryForRange(...args),
    getLocalSalesSummaryForRange: (...args: unknown[]) =>
        mockGetLocalSalesSummaryForRange(...args),
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
    buildDashboardSupplemental,
    buildRevenueOverTime,
    buildTopEmployeeItems,
    buildTopProductItems,
    Dashboard,
    getDashboardAverageTicket,
    getDashboardItemsSold,
    hasSalesData,
    normalizeDashboardRange,
    sortDashboardSummary,
} from './dashboard';

describe('Dashboard', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetLocalSalesSummaryForRange.mockResolvedValue(undefined);
    });

    it('renders loading state', () => {
        mockGetSalesSummaryForRange.mockReturnValue(new Promise(() => undefined));
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
        expect(getDashboardItemsSold(summary)).toBeCloseTo(4.345);

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
                        { categoryId: 'c1', price: 2.5, quantity: 2 },
                        { categoryId: 'c2', price: 5.5, quantity: 1 },
                    ],
                },
            ] as any,
            { c1: 'Produce', c2: 'Baking' }
        );

        expect(supplemental.totalDiscounts).toBe(1.25);
        expect(supplemental.discountedOrders).toBe(1);
        expect(supplemental.topCategories).toEqual([
            { name: 'Baking', value: '$5.50' },
            { name: 'Produce', value: '$5.00' },
        ]);
        expect(supplemental.paymentMix).toEqual([
            { name: 'Cards', value: 10 },
            { name: 'Cash', value: 5.5 },
        ]);
        expect(supplemental.paymentMixBreakdown).toEqual([
            { name: 'Cards', value: '$10.00' },
            { name: 'Cash', value: '$5.50' },
        ]);
        expect(supplemental.paymentMixPercentages).toEqual([
            { name: 'Cards', amount: '$10.00', percent: '65%', ratio: 10 / 15.5 },
            { name: 'Cash', amount: '$5.50', percent: '35%', ratio: 5.5 / 15.5 },
        ]);
    });

    it('returns empty helper outputs for missing summary sections', () => {
        expect(buildTopProductItems(undefined)).toEqual([]);
        expect(buildTopEmployeeItems(undefined)).toEqual([]);
        expect(buildRevenueOverTime(undefined)).toBeUndefined();
        expect(getDashboardAverageTicket(undefined)).toBe(0);
        expect(getDashboardItemsSold(undefined)).toBe(0);
    });

});
