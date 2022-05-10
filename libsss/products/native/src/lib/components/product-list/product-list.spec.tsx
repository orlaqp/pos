
import React from 'react';
import { render } from '@testing-library/react-native';

import ProductList from './product-list';

describe('ProductList', () => {
  it('should render successfully', () => {
    const { container } = render(<ProductList />);
    expect(container).toBeTruthy();
  });
});
