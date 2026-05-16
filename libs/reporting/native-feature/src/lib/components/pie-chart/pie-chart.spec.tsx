import React from 'react';
import { render } from '@testing-library/react-native';

import PieChart, { buildPieChartConfig } from './pie-chart';

describe('PieChart', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders empty-state when items are missing', () => {
        const { getByText } = render(
            <PieChart header="Top Products" items={[]} />
        );
        expect(getByText('No data provided')).toBeTruthy();
    });

    it('maps items and renders chart props', () => {
        const { getByText } = render(
            <PieChart
                header="Top Products"
                items={[
                    { name: 'Apple', value: 10 },
                    { name: 'Bread', value: 7 },
                ]}
            />
        );

        expect(getByText('Top Products')).toBeTruthy();
    });

    it('builds chart config with rgba color callback', () => {
        const cfg = buildPieChartConfig();

        expect(cfg.color(0.7)).toBe('rgba(26, 255, 146, 0.7)');
        expect(cfg.useShadowColorFromDataset).toBe(false);
    });
});
