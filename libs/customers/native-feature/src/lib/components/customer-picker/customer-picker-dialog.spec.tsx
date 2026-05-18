import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { ScrollView } from 'react-native';
import { Role } from '@pos/auth/data-access';
import { CustomerEntity } from '@pos/customers/data-access';

import CustomerPickerDialog from './customer-picker-dialog';

describe('CustomerPickerDialog', () => {
    const customers: CustomerEntity[] = [
        { id: 'customer-1', firstName: 'Ada', phone: '555-0100' },
    ];

    it('lists customers for selection', () => {
        const { getByText } = render(<CustomerPickerDialog customers={customers} />);

        expect(getByText('Ada')).toBeTruthy();
        expect(getByText('555-0100')).toBeTruthy();
    });

    it('keeps row taps active while the search field is focused', () => {
        const { UNSAFE_getByType } = render(<CustomerPickerDialog customers={customers} />);

        expect(UNSAFE_getByType(ScrollView).props.keyboardShouldPersistTaps).toBe('always');
    });

    it('selects a filtered customer after typing in search', () => {
        const onSelect = jest.fn();
        const { getByTestId } = render(
            <CustomerPickerDialog
                customers={[
                    {
                        id: 'customer-1',
                        firstName: 'John',
                        lastName: 'Doe',
                        phone: '3053053055',
                        email: 'email@address.com',
                    },
                ]}
                onSelect={onSelect}
            />
        );

        fireEvent.changeText(getByTestId('customer-picker-search'), 'Jo');
        fireEvent.press(getByTestId('customer-picker-item-customer-1'));

        expect(onSelect).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'customer-1',
                firstName: 'John',
            })
        );
    });

    it('gates customer creation by role', () => {
        const denied = render(
            <CustomerPickerDialog customers={customers} currentEmployee={{ roles: [] }} />
        );
        expect(denied.queryByTestId('customer-picker-create')).toBeNull();

        const allowed = render(
            <CustomerPickerDialog
                customers={customers}
                currentEmployee={{ roles: [Role.CreateCustomers] }}
            />
        );
        expect(allowed.getByTestId('customer-picker-create')).toBeTruthy();
    });
});
