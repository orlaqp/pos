import React from 'react';
import { render } from '@testing-library/react-native';

import CustomerPickerDialog from './customer-picker-dialog';

describe('CustomerPickerDialog', () => {
    it('renders successfully', () => {
        const { getByText } = render(<CustomerPickerDialog />);
        expect(getByText('Customer picker')).toBeTruthy();
    });
});
