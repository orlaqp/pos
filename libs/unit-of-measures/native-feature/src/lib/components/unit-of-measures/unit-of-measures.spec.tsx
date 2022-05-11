
import React from 'react';
import { render } from '@testing-library/react-native';

import UnitOfMeasures from './unit-of-measures';

describe('UnitOfMeasures', () => {
  it('should render successfully', () => {
    const { container } = render(< UnitOfMeasures />);
    expect(container).toBeTruthy();
  });
});
