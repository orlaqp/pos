import React from 'react';
import { Alert } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Role } from '@pos/auth/data-access';

import CustomerForm from './customer-form';

const mockSave = jest.fn();
const mockDispatch = jest.fn();
const mockGetLedgerForCustomer = jest.fn();

jest.mock('react-redux', () => ({
    useDispatch: () => mockDispatch,
    useSelector: (selector: (state: unknown) => unknown) =>
        selector({
            tenantSession: { currentTenantId: 'tenant-1' },
            employees: {
                loginEmployee: { id: 'emp-1', firstName: 'Admin', roles: ['Admin'] },
            },
            customers: {
                ids: [],
                entities: {},
                selected: undefined,
                ledger: [],
                loadingStatus: 'loaded',
            },
        } as never),
}));

jest.mock('@pos/customers/data-access', () => {
    const actual = jest.requireActual('@pos/customers/data-access');
    return {
        ...actual,
        CustomerService: {
            save: (...args: unknown[]) => mockSave(...args),
        },
        CustomerCreditService: {
            getLedgerForCustomer: (...args: unknown[]) => mockGetLedgerForCustomer(...args),
        },
    };
});

describe('CustomerForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetLedgerForCustomer.mockResolvedValue([]);
        jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
    });

    it('requires first name before saving', async () => {
        const { getByTestId } = render(
            <CustomerForm tenantId="tenant-1" currentEmployee={{ roles: [Role.Admin] }} />
        );

        expect(getByTestId('customer-form-screen')).toHaveStyle({
            backgroundColor: '#080B10',
        });

        fireEvent.press(getByTestId('customer-form-save'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'First name required',
                'Enter a first name before saving this customer.'
            );
        });
        expect(mockSave).not.toHaveBeenCalled();
    });

    it('requires phone or email before saving', async () => {
        const { getByTestId } = render(
            <CustomerForm tenantId="tenant-1" currentEmployee={{ roles: [Role.Admin] }} />
        );

        fireEvent.changeText(getByTestId('customer-form-first-name'), 'Ada');
        fireEvent.press(getByTestId('customer-form-save'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Contact required',
                'Enter a phone number or email before saving this customer.'
            );
        });
        expect(mockSave).not.toHaveBeenCalled();
    });

    it('saves contact and credit fields when the user can manage credit', async () => {
        const onSaved = jest.fn();
        const { getByTestId } = render(
            <CustomerForm
                tenantId="tenant-1"
                currentEmployee={{ roles: [Role.CreateCustomers, Role.ManageCustomerCredit] }}
                onSaved={onSaved}
            />
        );

        mockSave.mockResolvedValueOnce({
            id: 'customer-1',
            firstName: 'Ada',
            phone: '555-0100',
            creditLimit: 250,
        });

        fireEvent.changeText(getByTestId('customer-form-first-name'), 'Ada');
        fireEvent.changeText(getByTestId('customer-form-phone'), '555-0100');
        fireEvent.changeText(getByTestId('customer-form-credit-limit'), '250');
        fireEvent.press(getByTestId('customer-form-save'));

        await waitFor(() => {
            expect(mockSave).toHaveBeenCalledWith(
                expect.objectContaining({
                    tenantId: 'tenant-1',
                    firstName: 'Ada',
                    phone: '555-0100',
                    creditLimit: 250,
                })
            );
            expect(onSaved).toHaveBeenCalledWith(expect.objectContaining({ id: 'customer-1' }));
        });
    });

    it('uses a date picker for date of birth and saves the selected date', async () => {
        const { getByTestId } = render(
            <CustomerForm
                tenantId="tenant-1"
                currentEmployee={{ roles: [Role.CreateCustomers] }}
            />
        );
        const selectedDate = new Date('1990-03-15T12:00:00.000Z');

        mockSave.mockResolvedValueOnce({
            id: 'customer-1',
            firstName: 'Ada',
            phone: '555-0100',
            dob: selectedDate.toISOString(),
        });

        fireEvent.press(getByTestId('ui-date-time-field-dob'));
        fireEvent(getByTestId('ui-date-picker-modal-input'), 'onChange', {}, selectedDate);
        fireEvent.press(getByTestId('ui-date-picker-modal-confirm'));
        fireEvent.changeText(getByTestId('customer-form-first-name'), 'Ada');
        fireEvent.changeText(getByTestId('customer-form-phone'), '555-0100');
        fireEvent.press(getByTestId('customer-form-save'));

        await waitFor(() => {
            expect(mockSave).toHaveBeenCalledWith(
                expect.objectContaining({
                    dob: selectedDate.toISOString(),
                })
            );
        });
    });

    it('preserves credit fields when employee cannot manage credit', async () => {
        const { getByTestId, queryByTestId } = render(
            <CustomerForm
                tenantId="tenant-1"
                currentEmployee={{ roles: [Role.CreateCustomers] }}
                customer={{
                    id: 'customer-1',
                    tenantId: 'tenant-1',
                    firstName: 'Ada',
                    phone: '555-0100',
                    active: false,
                    creditLimit: 100,
                }}
            />
        );

        mockSave.mockResolvedValueOnce({ id: 'customer-1', firstName: 'Ada' });

        expect(queryByTestId('customer-form-credit-limit')).toBeNull();
        fireEvent.changeText(getByTestId('customer-form-first-name'), 'Ada Edited');
        fireEvent.press(getByTestId('customer-form-save'));

        await waitFor(() => {
            expect(mockSave).toHaveBeenCalledWith(
                expect.objectContaining({
                    firstName: 'Ada Edited',
                    active: false,
                    creditLimit: 100,
                })
            );
        });
    });

    it('blocks save when the employee cannot edit customers', async () => {
        const { getByTestId } = render(
            <CustomerForm
                tenantId="tenant-1"
                currentEmployee={{ roles: [] }}
                customer={{
                    id: 'customer-1',
                    tenantId: 'tenant-1',
                    firstName: 'Ada',
                    phone: '555-0100',
                }}
            />
        );

        fireEvent.press(getByTestId('customer-form-save'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Permission required',
                'You do not have access to edit this customer.'
            );
        });
        expect(mockSave).not.toHaveBeenCalled();
    });
});
