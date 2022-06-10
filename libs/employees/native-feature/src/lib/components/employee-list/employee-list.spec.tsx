
import React from 'react';
import { render } from '@testing-library/react-native';

import EmployeeList from './employee-list';

describe('EmployeeList', () => {
  it('should render successfully', () => {
    const { container } = render(<EmployeeList />);
    expect(container).toBeTruthy();
  });
});
