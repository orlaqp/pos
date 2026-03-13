import React from 'react';
import { render } from '@testing-library/react-native';

import UiSpinner from './ui-spinner';

describe('UiSpinner', () => {
  it('should render successfully', () => {
    const { toJSON } = render(<UiSpinner message="Loading" />);
    expect(toJSON()).toBeTruthy();
  });
});
