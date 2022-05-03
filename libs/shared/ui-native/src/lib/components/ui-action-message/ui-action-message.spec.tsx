import React from 'react';
import { render } from '@testing-library/react-native';

import UiActionMessage from './ui-action-message';

describe('UiActionMessage', () => {
  it('should render successfully', () => {
    const { container } = render(<UiActionMessage />);
    expect(container).toBeTruthy();
  });
});
