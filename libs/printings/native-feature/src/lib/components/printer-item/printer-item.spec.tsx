
import React from 'react';
import { render } from '@testing-library/react-native';

import PrintingItem from './printer-item';

describe('PrintingItem', () => {
    it('should render successfully', () => {
        const { container } = render(<PrintingItem />);
        expect(container).toBeTruthy();
    });
});
