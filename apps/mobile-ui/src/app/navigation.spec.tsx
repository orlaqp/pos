import React from 'react';
import { render } from '@testing-library/react-native';

import Navigation from './navigation';

describe('Navigation', () => {
  it('should render successfully', () => {
    const { container } = render(<Navigation />);
    expect(container).toBeTruthy();
  });
});
