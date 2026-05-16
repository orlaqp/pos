import React from 'react';
import { render } from '@testing-library/react-native';

import UIEmptyState from './ui-empty-state';

describe('EmptyState', () => {
  it('should render successfully', () => {
    const { getByText } = render(<UIEmptyState text="Nothing here" />);
    expect(getByText('Nothing here')).toBeTruthy();
  });

  it('renders title, subtitle, and actions', () => {
    const { getByText } = render(
      <UIEmptyState
        title="No products yet"
        subtitle="Add products before using sales search."
        actions={[
          { title: 'Add product', onPress: jest.fn() },
          { title: 'Add category', onPress: jest.fn(), type: 'outline' },
        ]}
      />
    );

    expect(getByText('No products yet')).toBeTruthy();
    expect(getByText('Add products before using sales search.')).toBeTruthy();
    expect(getByText('Add product')).toBeTruthy();
    expect(getByText('Add category')).toBeTruthy();
  });
});
