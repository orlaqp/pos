import React from 'react';
import { render } from '@testing-library/react-native';

import Login from './login';

describe('Login', () => {
  it('should render successfully', () => {
    const { container } = render(<Login />);
    expect(container).toBeTruthy();
  });
});
