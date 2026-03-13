import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';

jest.mock('@pos/shared/ui-native', () => ({
    UIDateRange: ({
        onRangeChange,
    }: {
        onRangeChange: (r: { startDate: Date; endDate: Date }) => void;
    }) => (
        <Pressable
            testID="date-range"
            onPress={() =>
                onRangeChange({
                    startDate: new Date('2026-03-01'),
                    endDate: new Date('2026-03-12'),
                })
            }
        >
            <Text>Date Range</Text>
        </Pressable>
    ),
    UISpinner: ({ message }: { message: string }) => <>{message}</>,
}));

import { ReportViewer } from './report-viewer';

describe('ReportViewer', () => {
    it('renders table rows and totals', async () => {
        const getData = jest
            .fn()
            .mockResolvedValueOnce([
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
        const { getByText } = render(
            <ReportViewer total={0} headers={headers} getData={getData} />
        );

        await waitFor(() => {
            expect(getData).toHaveBeenCalledTimes(1);
            expect(getByText('Alice')).toBeTruthy();
            expect(getByText('$12.50')).toBeTruthy();
            expect(getByText('$20.00')).toBeTruthy();
        });
    });
});
