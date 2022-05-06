import React from 'react';
import { render } from '@testing-library/react-native';

import Categories from './categories';

describe('Categories', () => {
  it('should render successfully', () => {
    const { container } = render(<Categories />);
    expect(container).toBeTruthy();
  });
});
