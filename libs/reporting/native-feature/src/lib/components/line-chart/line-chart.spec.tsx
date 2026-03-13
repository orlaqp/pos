import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import {
    buildLineChartConfig,
    LineChartComponent,
    toLineChartDataset,
} from './line-chart';

describe('LineChart', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders empty-state when there is no data', () => {
        const { getByText } = render(
            <LineChartComponent header="Revenue over time" data={[]} />
        );
        expect(getByText('No data provided')).toBeTruthy();
    });

    it('builds chart dataset from input series', () => {
        const dataset = toLineChartDataset([
            { label: '03-10', values: [10, 3] },
            { label: '03-11', values: [15, 4] },
        ]);

        expect(dataset).toEqual({
            labels: ['03-10', '03-11'],
            datasets: [{ data: [10, 15] }, { data: [3, 4] }],
        });
    });

    it('builds chart config using the provided text color', () => {
        const cfg = buildLineChartConfig('#abcdef');

        expect(cfg.color(1)).toBe('#abcdef');
        expect(cfg.labelColor(1)).toBe('#abcdef');
        expect(cfg.decimalPlaces).toBe(2);
    });

    it('renders component shell with data input', () => {
        const data = [{ label: '03-10', values: [10, 3] }];
        const { getByText, getByTestId } = render(
            <LineChartComponent header="Revenue over time" data={data} />
        );
        expect(getByText('Revenue over time')).toBeTruthy();

        fireEvent(getByTestId('line-chart-container'), 'layout', {
            nativeEvent: { layout: { width: 420, height: 100 } },
        });

        expect(getByText('Revenue over time')).toBeTruthy();
    });
});
