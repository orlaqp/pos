import React from 'react';
import { render } from '@testing-library/react-native';

import UIAlert from './ui-alert';

describe('UIAlert', () => {
  it('should render successfully', () => {
    const { container } = render(<UIAlert />);
    expect(container).toBeTruthy();
  });
});
