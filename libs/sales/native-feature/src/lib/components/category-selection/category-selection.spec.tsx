import React from 'react';
import { render } from '@testing-library/react-native';

import CategorySelection from './category-selection';

describe('CategorySelection', () => {
  it('should render successfully', () => {
    const { container } = render(<CategorySelection />);
    expect(container).toBeTruthy();
  });
});
