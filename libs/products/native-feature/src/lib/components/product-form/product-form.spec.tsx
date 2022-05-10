
import React from 'react';
import { render } from '@testing-library/react-native';

import ProductForm from './product-form';

describe('ProductForm', () => {
  it('should render successfully', () => {
    const { container } = render(< ProductForm />);
    expect(container).toBeTruthy();
  });
});
