import React from 'react';
import { render } from '@testing-library/react-native';

import UiSearchInput from './ui-search-input';

describe('UiSearchInput', () => {
  it('should render successfully', () => {
    const { container } = render(<UiSearchInput />);
    expect(container).toBeTruthy();
  });
});
