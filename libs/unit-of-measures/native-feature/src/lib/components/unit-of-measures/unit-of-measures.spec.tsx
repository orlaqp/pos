
import React from 'react';
import { render } from '@testing-library/react-native';

import UnitOfMeasures from './unit-of-measures';

describe('UnitOfMeasures', () => {
  it('should render successfully', () => {
    const { UNSAFE_root } = render(< UnitOfMeasures />);
    expect(UNSAFE_root).toBeTruthy();
  });
});
