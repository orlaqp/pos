import React from 'react';
import { render } from '@testing-library/react-native';

import BackOffice from './back-office';

describe('BackOffice', () => {
  it('should render successfully', () => {
    const { container } = render(<BackOffice />);
    expect(container).toBeTruthy();
  });
});
