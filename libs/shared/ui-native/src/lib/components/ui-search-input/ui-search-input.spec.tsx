import React from 'react';
import { render } from '@testing-library/react-native';

import { UISearchInput } from './ui-search-input';

describe('UiSearchInput', () => {
  it('should render successfully', () => {
    const { toJSON } = render(<UISearchInput onSubmit={jest.fn()} />);
    expect(toJSON()).toBeTruthy();
  });
});
