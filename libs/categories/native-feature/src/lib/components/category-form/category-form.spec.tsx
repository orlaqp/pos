import React from 'react';
import { render } from '@testing-library/react-native';

import CategoryForm from './category-form';

describe('CategoryForm', () => {
  it('should render successfully', () => {
    const { container } = render(<CategoryForm />);
    expect(container).toBeTruthy();
  });
});
