
import React from 'react';
import { render } from '@testing-library/react-native';

import EmployeeItem from './employee-item';

describe('EmployeeItem', () => {
    it('should render successfully', () => {
        const { container } = render(<EmployeeItem />);
        expect(container).toBeTruthy();
    });
});
