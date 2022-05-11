
import React from 'react';
import { render } from '@testing-library/react-native';

import UnitOfMeasureForm from './unit-of-measure-form';

describe('UnitOfMeasureForm', () => {
  it('should render successfully', () => {
    const { container } = render(< UnitOfMeasureForm />);
    expect(container).toBeTruthy();
  });
});
