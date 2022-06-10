
import React from 'react';
import { render } from '@testing-library/react-native';

import EmployeeForm from './employee-form';

describe('EmployeeForm', () => {
  it('should render successfully', () => {
    const { container } = render(< EmployeeForm />);
    expect(container).toBeTruthy();
  });
});
