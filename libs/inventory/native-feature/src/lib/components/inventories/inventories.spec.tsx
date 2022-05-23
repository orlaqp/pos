
import React from 'react';
import { render } from '@testing-library/react-native';

import Inventories from './inventories';

describe('Inventories', () => {
  it('should render successfully', () => {
    const { container } = render(< Inventories />);
    expect(container).toBeTruthy();
  });
});
