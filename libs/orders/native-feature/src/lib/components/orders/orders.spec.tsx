
import React from 'react';
import { render } from '@testing-library/react-native';

import Orders from './orders';

describe('Orders', () => {
  it('should render successfully', () => {
    const { container } = render(< Orders />);
    expect(container).toBeTruthy();
  });
});
