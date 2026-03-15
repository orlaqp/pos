import React from 'react';
import { render } from '@testing-library/react-native';

import Signup from './signup';

describe('Signup', () => {
  it('should render successfully', () => {
    const { root } = render(<Signup />);
    expect(root).toBeTruthy();
  });
});
