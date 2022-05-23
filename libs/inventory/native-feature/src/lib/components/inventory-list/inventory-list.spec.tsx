
import React from 'react';
import { render } from '@testing-library/react-native';

import InventoryList from './inventory-list';

describe('InventoryList', () => {
  it('should render successfully', () => {
    const { container } = render(<InventoryList />);
    expect(container).toBeTruthy();
  });
});
