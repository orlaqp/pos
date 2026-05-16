import React from 'react';
import { render } from '@testing-library/react-native';

import CustomerForm from './customer-form';

describe('CustomerForm', () => {
    it('renders successfully', () => {
        const { getByText } = render(<CustomerForm />);
        expect(getByText('Customer form')).toBeTruthy();
    });
});
