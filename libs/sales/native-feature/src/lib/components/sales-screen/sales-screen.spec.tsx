import React from 'react';
import { render } from '@testing-library/react-native';

import SalesScreen from './sales-screen';

describe('SalesScreen', () => {
  it('should render successfully', () => {
    const { container } = render(<SalesScreen />);
    expect(container).toBeTruthy();
  });
});
