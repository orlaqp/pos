
import React from 'react';
import { render } from '@testing-library/react-native';

import InventoryForm from './inventory-form';

describe('InventoryForm', () => {
  it('should render successfully', () => {
    const { container } = render(< InventoryForm />);
    expect(container).toBeTruthy();
  });
});
