import React from 'react';
import { render } from '@testing-library/react-native';

import Dashboard from './dashboard';

describe('Dashboard', () => {
    it('should render successfully', () => {
        const { container } = render(<Dashboard />);
        expect(container).toBeTruthy();
    });
});
