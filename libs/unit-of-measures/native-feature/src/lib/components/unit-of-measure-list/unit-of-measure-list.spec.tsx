
import React from 'react';
import { render } from '@testing-library/react-native';

import UnitOfMeasureList from './unit-of-measure-list';

describe('UnitOfMeasureList', () => {
  it('should render successfully', () => {
    const { container } = render(<UnitOfMeasureList />);
    expect(container).toBeTruthy();
  });
});
