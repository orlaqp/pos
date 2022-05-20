
import React from 'react';
import { render } from '@testing-library/react-native';

import OrderForm from './order-form';

describe('OrderForm', () => {
  it('should render successfully', () => {
    const { container } = render(< OrderForm />);
    expect(container).toBeTruthy();
  });
});
