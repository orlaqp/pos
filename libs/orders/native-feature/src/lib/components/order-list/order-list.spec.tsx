
import React from 'react';
import { render } from '@testing-library/react-native';

import OrderList from './order-list';

describe('OrderList', () => {
  it('should render successfully', () => {
    const { container } = render(<OrderList />);
    expect(container).toBeTruthy();
  });
});
