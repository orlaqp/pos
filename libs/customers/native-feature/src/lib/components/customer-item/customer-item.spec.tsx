import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { customersActions } from '@pos/customers/data-access';

import CustomerItem from './customer-item';

const mockDispatch = jest.fn();
const mockNavigate = jest.fn();

jest.mock('react-redux', () => ({
    useDispatch: () => mockDispatch,
}));

describe('CustomerItem', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders status, identity, contact, and credit summary like a management row', () => {
        const { getByText } = render(
            <CustomerItem
                navigation={{ navigate: mockNavigate } as never}
                item={{
                    id: 'customer-1',
                    firstName: 'Ada',
                    lastName: 'Lovelace',
                    phone: '555-0100',
                    email: 'ada@example.com',
                    active: true,
                    creditLimit: 100,
                    creditBalance: 25,
                }}
            />
        );

        expect(getByText('Active')).toBeTruthy();
        expect(getByText('Ada Lovelace')).toBeTruthy();
        expect(getByText('555-0100')).toBeTruthy();
        expect(getByText('Balance $25.00')).toBeTruthy();
        expect(getByText('Available $75.00')).toBeTruthy();
    });

    it('selects the customer and opens the customer form when pressed', () => {
        const customer = {
            id: 'customer-1',
            firstName: 'Ada',
            phone: '555-0100',
        };
        const { getByTestId } = render(
            <CustomerItem navigation={{ navigate: mockNavigate } as never} item={customer} />
        );

        fireEvent.press(getByTestId('customer-row-customer-1'));

        expect(mockDispatch).toHaveBeenCalledWith(customersActions.select(customer));
        expect(mockNavigate).toHaveBeenCalledWith('Customer Form');
    });
});
