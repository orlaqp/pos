
import React from 'react';
import { render } from '@testing-library/react-native';

import PrinterList from './printer-list';

describe('PrintingList', () => {
  it('should render successfully', () => {
    const { container } = render(<PrinterList />);
    expect(container).toBeTruthy();
  });
});
