import React from 'react';
import { render } from '@testing-library/react-native';

import PieChart from './pie-chart';

describe('PieChart', () => {
    it('should render successfully', () => {
        const { container } = render(<PieChart />);
        expect(container).toBeTruthy();
    });
});
