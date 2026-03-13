import React from 'react';
import { render } from '@testing-library/react-native';
import moment from 'moment';

const mockGetSalesSummaryForRange = jest.fn();

jest.mock('@pos/reporting/data-access', () => ({
    getSalesSummaryForRange: (...args: unknown[]) =>
        mockGetSalesSummaryForRange(...args),
}));

jest.mock('@pos/shared/ui-native', () => ({
    UIDateRange: () => <>DateRange</>,
    UIEmptyState: ({ text }: { text: string }) => <>{text}</>,
    UISpinner: ({ message }: { message: string }) => <>{message}</>,
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
    buildRevenueOverTime,
    buildTopEmployeeItems,
    buildTopProductItems,
    Dashboard,
    hasSalesData,
    normalizeDashboardRange,
    sortDashboardSummary,
} from './dashboard';

describe('Dashboard', () => {
    beforeEach(() => {
        jest.clearAllMocks();
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
    });

    it('returns empty helper outputs for missing summary sections', () => {
        expect(buildTopProductItems(undefined)).toEqual([]);
        expect(buildTopEmployeeItems(undefined)).toEqual([]);
        expect(buildRevenueOverTime(undefined)).toBeUndefined();
    });

});
