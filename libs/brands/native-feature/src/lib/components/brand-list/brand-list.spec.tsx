
import React from 'react';
import { render } from '@testing-library/react-native';

import BrandList from './brand-list';

describe('BrandList', () => {
  it('should render successfully', () => {
    const { container } = render(<BrandList />);
    expect(container).toBeTruthy();
  });
});
