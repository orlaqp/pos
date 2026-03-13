import React from 'react';
import { render } from '@testing-library/react-native';

import UIEmptyState from './ui-empty-state';

describe('EmptyState', () => {
  it('should render successfully', () => {
    const { getByText } = render(<UIEmptyState text="Nothing here" />);
    expect(getByText('Nothing here')).toBeTruthy();
  });
});
