import React from 'react';
import { render } from '@testing-library/react-native';

import UiSpinner from './ui-spinner';

describe('UiSpinner', () => {
  it('should render successfully', () => {
    const { container } = render(<UiSpinner />);
    expect(container).toBeTruthy();
  });
});
