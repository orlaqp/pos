
import React from 'react';
import { render } from '@testing-library/react-native';

import Brands from './brands';

describe('Brands', () => {
  it('should render successfully', () => {
    const { container } = render(< Brands />);
    expect(container).toBeTruthy();
  });
});
