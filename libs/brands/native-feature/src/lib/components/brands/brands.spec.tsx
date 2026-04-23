
import React from 'react';
import { render } from '@testing-library/react-native';

import Brands from './brands';

describe('Brands', () => {
  it('should render successfully', () => {
    const { UNSAFE_root } = render(< Brands />);
    expect(UNSAFE_root).toBeTruthy();
  });
});
