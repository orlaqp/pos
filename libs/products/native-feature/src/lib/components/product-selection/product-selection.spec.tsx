import React from 'react';
import { render } from '@testing-library/react-native';

import ProductSelection from './product-selection';

describe('ProductSelection', () => {
  it('should render successfully', () => {
    const { container } = render(<ProductSelection />);
    expect(container).toBeTruthy();
  });
});
