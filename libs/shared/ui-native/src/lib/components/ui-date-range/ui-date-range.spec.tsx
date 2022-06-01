import React from 'react';
import { render } from '@testing-library/react-native';

import UIDateRange from './ui-date-range';

describe('UIDateRange', () => {
    it('should render successfully', () => {
        const { container } = render(<UIDateRange />);
        expect(container).toBeTruthy();
    });
});
