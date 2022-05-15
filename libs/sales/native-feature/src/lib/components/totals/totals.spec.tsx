import React from 'react';
import { render } from '@testing-library/react-native';

import Totals from './totals';

describe('Totals', () => {
  it('should render successfully', () => {
    const { container } = render(<Totals />);
    expect(container).toBeTruthy();
  });
});
