import React from 'react';
import { render } from '@testing-library/react-native';

import Categories from './categories';

describe('Categories', () => {
  it('should render successfully', () => {
    const { UNSAFE_root } = render(<Categories />);
    expect(UNSAFE_root).toBeTruthy();
  });
});
