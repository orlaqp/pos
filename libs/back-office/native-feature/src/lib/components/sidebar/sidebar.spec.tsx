import React from 'react';
import { render } from '@testing-library/react-native';

import Sidebar from './sidebar';

describe('Sidebar', () => {
  it('should render successfully', () => {
    const { container } = render(<Sidebar />);
    expect(container).toBeTruthy();
  });
});
