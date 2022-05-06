import React from 'react';
import { render } from '@testing-library/react-native';

import UIEmptyState from './ui-empty-state';

describe('EmptyState', () => {
  it('should render successfully', () => {
    const { container } = render(<UIEmptyState />);
    expect(container).toBeTruthy();
  });
});
