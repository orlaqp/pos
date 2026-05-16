import React from 'react';
import { Alert } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { Role } from '@pos/auth/data-access';
import { PaymentType } from '@pos/shared/models';

import CustomerAccountPaymentDialog from './customer-account-payment-dialog';

const mockRecordAccountPayment = jest.fn();

jest.mock('@pos/customers/data-access', () => ({
    CustomerCreditService: {
        recordAccountPayment: (...args: unknown[]) => mockRecordAccountPayment(...args),
    },
}));

describe('CustomerAccountPaymentDialog', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
    });

    it('requires payment permission', () => {
        const { getByText, queryByTestId } = render(
            <CustomerAccountPaymentDialog
                customer={{ id: 'customer-1', tenantId: 'tenant-1', firstName: 'Ada' }}
                currentEmployee={{ id: 'emp-1', firstName: 'Clerk', roles: [] }}
            />
        );

        expect(getByText('Permission required')).toBeTruthy();
        expect(queryByTestId('customer-payment-save')).toBeNull();
    });

    it('confirms overpayment and records the entered transaction amount', async () => {
        const onSaved = jest.fn();
        const { getByTestId } = render(
            <CustomerAccountPaymentDialog
                customer={
                    {
                        id: 'customer-1',
                        tenantId: 'tenant-1',
                        firstName: 'Ada',
                        creditBalance: 10,
                    }
                }
                currentEmployee={
                    {
                        id: 'emp-1',
                        firstName: 'Grace',
                        lastName: 'Hopper',
                        roles: [Role.ReceiveCustomerCreditPayments],
                    }
                }
                onSaved={onSaved}
            />
        );

        mockRecordAccountPayment.mockResolvedValueOnce({ id: 'ledger-1', amount: 12 });

        fireEvent.changeText(getByTestId('customer-payment-amount'), '12');
        fireEvent.press(getByTestId('customer-payment-method-check'));
        fireEvent.press(getByTestId('customer-payment-save'));

        const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
        expect(alertCall[0]).toBe('Confirm overpayment');
        await act(async () => {
            await alertCall[2]
                .find((option: { text: string }) => option.text === 'Record payment')
                .onPress();
        });

        await waitFor(() => {
            expect(mockRecordAccountPayment).toHaveBeenCalledWith(
                expect.objectContaining({
                    tenantId: 'tenant-1',
                    customerId: 'customer-1',
                    amount: 12,
                    paymentMethod: PaymentType.CHECK,
                    employeeId: 'emp-1',
                    employeeName: 'Grace Hopper',
                })
            );
            expect(onSaved).toHaveBeenCalledWith(expect.objectContaining({ id: 'ledger-1' }));
        });
    });

    it('does not record without a selected customer or valid amount', async () => {
        const { getByTestId, rerender } = render(
            <CustomerAccountPaymentDialog
                currentEmployee={{
                    id: 'emp-1',
                    roles: [Role.ReceiveCustomerCreditPayments],
                }}
            />
        );

        fireEvent.changeText(getByTestId('customer-payment-amount'), '5');
        fireEvent.press(getByTestId('customer-payment-save'));
        expect(Alert.alert).toHaveBeenCalledWith(
            'Customer required',
            'Select a customer before recording a payment.'
        );
        expect(mockRecordAccountPayment).not.toHaveBeenCalled();

        rerender(
            <CustomerAccountPaymentDialog
                customer={{ id: 'customer-1', tenantId: 'tenant-1', firstName: 'Ada' }}
                currentEmployee={{
                    id: 'emp-1',
                    roles: [Role.ReceiveCustomerCreditPayments],
                }}
            />
        );

        fireEvent.changeText(getByTestId('customer-payment-amount'), '0');
        fireEvent.press(getByTestId('customer-payment-save'));
        expect(Alert.alert).toHaveBeenCalledWith(
            'Amount required',
            'Enter a payment amount greater than zero.'
        );
        expect(mockRecordAccountPayment).not.toHaveBeenCalled();
    });
});
