import React from 'react';
import { render } from '@testing-library/react-native';

import Customers from './customers';

describe('Customers', () => {
    it('renders successfully', () => {
        const { getByText } = render(<Customers />);
        expect(getByText('Customers')).toBeTruthy();
    });
});
