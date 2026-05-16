import React from 'react';
import { render } from '@testing-library/react-native';

import UiActionMessage from './ui-action-message';

describe('UiActionMessage', () => {
  it('should render successfully', () => {
    const { getByText } = render(
      <UiActionMessage message="No data" actionTitle="Retry" action={jest.fn()} />
    );
    expect(getByText('No data')).toBeTruthy();
  });
});
