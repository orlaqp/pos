import React from 'react';
import { render } from '@testing-library/react-native';

import LineChart from './line-chart';

describe('LineChart', () => {
    it('should render successfully', () => {
        const { container } = render(<LineChart />);
        expect(container).toBeTruthy();
    });
});
