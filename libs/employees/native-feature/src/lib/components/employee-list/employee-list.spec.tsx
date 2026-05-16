
import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('@pos/theme/native', () => ({
  getThemeColors: () => ({
    primary: '#4aa3eb',
    grey1: '#f3f4f6',
    grey2: '#9ca3af',
    grey3: '#6b7280',
    grey4: '#374151',
    grey5: '#1f2937',
  }),
  useSharedStyles: () => ({
    page: {},
    detailsPage: {},
  }),
}));

import EmployeeList from './employee-list';

describe('EmployeeList', () => {
  it('should render successfully', () => {
    const { UNSAFE_root } = render(<EmployeeList />);
    expect(UNSAFE_root).toBeTruthy();
  });
});
