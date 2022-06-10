
import React from 'react';
import { render } from '@testing-library/react-native';

import Employees from './employees';

describe('Employees', () => {
  it('should render successfully', () => {
    const { container } = render(< Employees />);
    expect(container).toBeTruthy();
  });
});
