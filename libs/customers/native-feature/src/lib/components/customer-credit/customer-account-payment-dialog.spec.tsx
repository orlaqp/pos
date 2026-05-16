import React from 'react';
import { render } from '@testing-library/react-native';

import CustomerAccountPaymentDialog from './customer-account-payment-dialog';

describe('CustomerAccountPaymentDialog', () => {
    it('renders successfully', () => {
        const { getByText } = render(<CustomerAccountPaymentDialog />);
        expect(getByText('Customer account payment')).toBeTruthy();
    });
});
