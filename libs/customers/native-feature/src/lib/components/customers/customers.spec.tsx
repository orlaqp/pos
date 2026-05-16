import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { customersActions } from '@pos/customers/data-access';

import Customers from './customers';

const mockDispatch = jest.fn();
const mockGetAll = jest.fn();
const mockGetLedgerForCustomer = jest.fn();
let mockEmployeeRoles: string[] = ['Admin'];

jest.mock('react-redux', () => ({
    useDispatch: () => mockDispatch,
    useSelector: (selector: (state: unknown) => unknown) =>
        selector({
            employees: {
                loginEmployee: { id: 'emp-1', firstName: 'Admin', roles: mockEmployeeRoles },
            },
            tenantSession: {
                currentTenantId: 'tenant-1',
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
            getAll: (...args: unknown[]) => mockGetAll(...args),
        },
        CustomerCreditService: {
            getLedgerForCustomer: (...args: unknown[]) => mockGetLedgerForCustomer(...args),
        },
    };
});

describe('Customers', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockEmployeeRoles = ['Admin'];
    });

    it('fetches customers and renders the management surface', async () => {
        mockGetAll.mockResolvedValueOnce([
            {
                id: 'customer-1',
                tenantId: 'tenant-1',
                firstName: 'Ada',
                phone: '555-0100',
                creditBalance: 42,
            },
        ]);
        mockGetLedgerForCustomer.mockResolvedValueOnce([]);

        const { getAllByText, getByTestId, getByText } = render(
            <Customers tenantId="tenant-1" />
        );

        await waitFor(() => {
            expect(mockGetAll).toHaveBeenCalled();
            expect(mockDispatch).toHaveBeenCalledWith(
                customersActions.setAll([
                    expect.objectContaining({ id: 'customer-1', firstName: 'Ada' }),
                ])
            );
            expect(mockDispatch).toHaveBeenCalledWith(customersActions.setLedger([]));
        });

        expect(getByText('Customers')).toBeTruthy();
        expect(getAllByText('Ada').length).toBeGreaterThan(0);
        expect(getByText('Account summary')).toBeTruthy();
        expect(getByTestId('customers-available-credit')).toHaveTextContent(
            'Available credit -$42.00'
        );
        expect(getByTestId('customers-credit-status')).toHaveTextContent('Credit status OK');
    });

    it('hides edit actions without customer creation or credit management access', async () => {
        mockEmployeeRoles = [];
        mockGetAll.mockResolvedValueOnce([
            {
                id: 'customer-1',
                tenantId: 'tenant-1',
                firstName: 'Ada',
                phone: '555-0100',
                creditLimit: 100,
                creditBalance: 42,
            },
        ]);
        mockGetLedgerForCustomer.mockResolvedValueOnce([]);

        const { queryByTestId } = render(<Customers tenantId="tenant-1" />);

        await waitFor(() => {
            expect(mockGetAll).toHaveBeenCalled();
            expect(mockDispatch).toHaveBeenCalledWith(customersActions.setLedger([]));
        });

        expect(queryByTestId('customers-edit')).toBeNull();
    });
});
