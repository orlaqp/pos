import React from 'react';
import { render } from '@testing-library/react-native';

import UIAlert from './ui-alert';

describe('UIAlert', () => {
  it('should render successfully', () => {
    const { getByText } = render(<UIAlert type="success" message="Saved" />);
    expect(getByText('Saved')).toBeTruthy();
  });
});
