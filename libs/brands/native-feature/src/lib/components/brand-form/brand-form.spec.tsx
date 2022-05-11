
import React from 'react';
import { render } from '@testing-library/react-native';

import BrandForm from './brand-form';

describe('BrandForm', () => {
  it('should render successfully', () => {
    const { container } = render(< BrandForm />);
    expect(container).toBeTruthy();
  });
});
