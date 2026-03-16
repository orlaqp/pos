/* eslint-disable import/first */
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import * as mockReactNative from 'react-native';

jest.spyOn(mockReactNative.InteractionManager, 'runAfterInteractions').mockImplementation(
    (task: any) => {
        task?.();
        return { cancel: jest.fn() } as any;
    }
);

jest.mock('@pos/shared/ui-native', () => ({
    UIScreen: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    UICard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    UIStack: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    UIDateRange: ({
        onRangeChange,
    }: {
        onRangeChange: (r: { startDate: Date; endDate: Date }) => void;
    }) => (
        <mockReactNative.Pressable
            testID="date-range"
            onPress={() =>
                onRangeChange({
                    startDate: new Date('2026-03-01'),
                    endDate: new Date('2026-03-12'),
                })
            }
        >
            <mockReactNative.Text>Date Range</mockReactNative.Text>
        </mockReactNative.Pressable>
    ),
    UIEmptyState: ({ text }: { text: string }) => <>{text}</>,
    UISpinner: ({ message }: { message: string }) => <>{message}</>,
}));

import { buildReportCsv, ReportViewer } from './report-viewer';

describe('ReportViewer', () => {
    it('renders table rows and totals', async () => {
        const getData = jest
            .fn()
            .mockResolvedValue([
                { employee: 'Alice', amount: 12.5 },
                { employee: 'Bob', amount: 7.5 },
            ]);
        const headers = [
            { label: 'Employee', field: 'employee', width: 1 },
            {
                label: 'Amount',
                field: 'amount',
                width: 1,
                format: 'money' as const,
                sum: true,
            },
        ];
        render(
            <ReportViewer total={0} headers={headers} getData={getData} />
        );

        await waitFor(() => {
            expect(getData).toHaveBeenCalled();
        });
    });

    it('builds csv output with totals row', () => {
        const headers = [
            { label: 'Employee', field: 'employee', width: 1 },
            { label: 'Amount', field: 'amount', width: 1, format: 'money' as const, sum: true },
        ];
        const csv = buildReportCsv(
            headers,
            [
                { employee: 'Alice', amount: 12.5 },
                { employee: 'Bob', amount: 7.5 },
            ],
            { amount: 20 }
        );

        expect(csv).toContain('"Employee","Amount"');
        expect(csv).toContain('"Alice","$12.50"');
        expect(csv).toContain('"TOTAL","$20.00"');
    });
});
