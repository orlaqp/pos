/* eslint-disable import/first */
jest.mock('@pos/shared/amplify', () => ({
    DataStore: {
        query: jest.fn(),
        save: jest.fn(async (value) => value),
    },
}));

jest.mock('@pos/shared/models', () => {
    class MockCustomer {
        constructor(init: Record<string, unknown>) {
            Object.assign(this, init);
        }

        static copyOf(source: Record<string, unknown>, mutator: (draft: Record<string, unknown>) => void) {
            const draft = { ...source };
            mutator(draft);
            return draft;
        }
    }

    class MockCustomerCreditTransaction {
        constructor(init: Record<string, unknown>) {
            Object.assign(this, init);
        }
    }

    return {
        Customer: MockCustomer,
        CustomerCreditTransaction: MockCustomerCreditTransaction,
        CustomerCreditStatus: {
            OK: 'OK',
            OVER_LIMIT: 'OVER_LIMIT',
        },
        CustomerCreditTransactionType: {
            CREDIT_PURCHASE: 'CREDIT_PURCHASE',
            ACCOUNT_PAYMENT: 'ACCOUNT_PAYMENT',
            REFUND_REVERSAL: 'REFUND_REVERSAL',
            ADJUSTMENT: 'ADJUSTMENT',
        },
        PaymentType: {
            CASH: 'CASH',
            CREDIT: 'CREDIT',
        },
    };
});

import { DataStore } from '@pos/shared/amplify';
import { CustomerCreditService } from './customer-credit.service';

const queryMock = DataStore.query as jest.Mock;
const saveMock = DataStore.save as jest.Mock;

const customer = {
    id: 'customer-1',
    tenantId: 'tenant-1',
    firstName: 'Ada',
    lastName: 'Lovelace',
    phone: '555-0100',
    email: 'ada@example.com',
    active: true,
    creditLimit: 100,
    creditBalance: 25,
    creditStatus: 'OK',
};

const baseRequest = {
    customerId: 'customer-1',
    tenantId: 'tenant-1',
    amount: 25,
    referenceKey: 'order-1:CREDIT',
    employeeId: 'employee-1',
    employeeName: 'Employee One',
    storeId: 'store-1',
    stationId: 'station-1',
};

describe('CustomerCreditService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        saveMock.mockImplementation(async (value) => ({
            id: value.id || `${value.referenceKey || 'customer'}-saved`,
            ...value,
        }));
    });

    it('records a credit purchase, updates balance, and writes transaction metadata', async () => {
        queryMock.mockResolvedValueOnce(customer).mockResolvedValueOnce([]);

        await expect(
            CustomerCreditService.recordCreditPurchase({
                ...baseRequest,
                amount: 50,
                orderId: 'order-1',
                orderNo: '1001',
                notes: 'Credit tender',
            })
        ).resolves.toEqual(
            expect.objectContaining({
                customerId: 'customer-1',
                customerDisplayName: 'Ada Lovelace',
                type: 'CREDIT_PURCHASE',
                amount: 50,
                balanceAfter: 75,
                orderId: 'order-1',
                orderNo: '1001',
                referenceKey: 'order-1:CREDIT',
            })
        );

        expect(saveMock).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                id: 'tenant-1::customer-1::CREDIT_PURCHASE::order-1:CREDIT',
                tenantId: 'tenant-1',
                type: 'CREDIT_PURCHASE',
                balanceAfter: 75,
                employeeId: 'employee-1',
                storeId: 'store-1',
                stationId: 'station-1',
            })
        );
        expect(saveMock).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                id: 'customer-1',
                creditBalance: 75,
                creditStatus: 'OK',
            })
        );
    });

    it('rejects credit purchases that exceed latest available credit', async () => {
        queryMock.mockResolvedValueOnce({ ...customer, creditBalance: 90 }).mockResolvedValueOnce([]);

        await expect(
            CustomerCreditService.recordCreditPurchase({
                ...baseRequest,
                amount: 11,
                referenceKey: 'order-2:CREDIT',
            })
        ).rejects.toThrow('Insufficient customer credit');

        expect(saveMock).not.toHaveBeenCalled();
    });

    it('does not double-apply an idempotent credit purchase retry', async () => {
        const existingTransaction = {
            id: 'tx-1',
            tenantId: 'tenant-1',
            customerId: 'customer-1',
            customerDisplayName: 'Ada Lovelace',
            transactionDate: '2026-05-16T12:00:00.000Z',
            type: 'CREDIT_PURCHASE',
            amount: 25,
            balanceAfter: 50,
            referenceKey: 'order-1:CREDIT',
            employeeId: 'employee-1',
            employeeName: 'Employee One',
        };
        queryMock.mockResolvedValueOnce(customer).mockResolvedValueOnce([existingTransaction]);

        await expect(CustomerCreditService.recordCreditPurchase(baseRequest)).resolves.toEqual(
            expect.objectContaining({ id: 'tx-1', balanceAfter: 50 })
        );
        expect(saveMock).not.toHaveBeenCalled();
    });

    it('does not treat another tenant or customer reference as an idempotent retry', async () => {
        const existingTransaction = {
            id: 'tx-other',
            tenantId: 'tenant-2',
            customerId: 'customer-2',
            customerDisplayName: 'Other Customer',
            transactionDate: '2026-05-16T12:00:00.000Z',
            type: 'CREDIT_PURCHASE',
            amount: 25,
            balanceAfter: 50,
            referenceKey: 'order-1:CREDIT',
            employeeId: 'employee-1',
            employeeName: 'Employee One',
        };
        queryMock.mockResolvedValueOnce(customer).mockResolvedValueOnce([existingTransaction]);

        await CustomerCreditService.recordCreditPurchase(baseRequest);

        expect(saveMock).toHaveBeenCalledTimes(2);
    });

    it('rejects credit transactions when request tenant does not match customer tenant', async () => {
        queryMock.mockResolvedValueOnce(customer);

        await expect(
            CustomerCreditService.recordCreditPurchase({
                ...baseRequest,
                tenantId: 'tenant-2',
            })
        ).rejects.toThrow('Customer credit transaction tenant mismatch');

        expect(saveMock).not.toHaveBeenCalled();
    });

    it('records account payments and allows overpayment to create a negative balance', async () => {
        queryMock.mockResolvedValueOnce({ ...customer, creditBalance: 25 }).mockResolvedValueOnce([]);

        await expect(
            CustomerCreditService.recordAccountPayment({
                ...baseRequest,
                amount: 40,
                referenceKey: 'payment-1',
                paymentMethod: 'CASH',
                notes: 'Cash account payment',
            })
        ).resolves.toEqual(
            expect.objectContaining({
                type: 'ACCOUNT_PAYMENT',
                paymentMethod: 'CASH',
                amount: 40,
                balanceAfter: -15,
            })
        );

        expect(saveMock).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                creditBalance: -15,
                creditStatus: 'OK',
            })
        );
    });

    it('records refund reversals as balance decreases', async () => {
        queryMock.mockResolvedValueOnce({ ...customer, creditBalance: 50 }).mockResolvedValueOnce([]);

        await expect(
            CustomerCreditService.recordRefundReversal({
                ...baseRequest,
                amount: 10,
                referenceKey: 'refund-1',
                orderId: 'order-1',
            })
        ).resolves.toEqual(
            expect.objectContaining({
                type: 'REFUND_REVERSAL',
                amount: 10,
                balanceAfter: 40,
            })
        );
    });

    it('returns ledger entries for one customer sorted newest first', async () => {
        queryMock.mockResolvedValueOnce([
            {
                id: 'older',
                tenantId: 'tenant-1',
                customerId: 'customer-1',
                customerDisplayName: 'Ada Lovelace',
                transactionDate: '2026-05-15T12:00:00.000Z',
                type: 'ACCOUNT_PAYMENT',
                amount: 10,
                balanceAfter: 20,
                referenceKey: 'payment-1',
                employeeId: 'employee-1',
                employeeName: 'Employee One',
            },
            {
                id: 'other-customer',
                tenantId: 'tenant-1',
                customerId: 'customer-2',
                customerDisplayName: 'Grace Hopper',
                transactionDate: '2026-05-16T12:00:00.000Z',
                type: 'CREDIT_PURCHASE',
                amount: 10,
                balanceAfter: 10,
                referenceKey: 'order-2',
                employeeId: 'employee-1',
                employeeName: 'Employee One',
            },
            {
                id: 'newer',
                tenantId: 'tenant-1',
                customerId: 'customer-1',
                customerDisplayName: 'Ada Lovelace',
                transactionDate: '2026-05-16T12:00:00.000Z',
                type: 'CREDIT_PURCHASE',
                amount: 25,
                balanceAfter: 45,
                referenceKey: 'order-1',
                employeeId: 'employee-1',
                employeeName: 'Employee One',
            },
        ]);

        await expect(CustomerCreditService.getLedgerForCustomer('customer-1')).resolves.toEqual([
            expect.objectContaining({ id: 'newer' }),
            expect.objectContaining({ id: 'older' }),
        ]);
    });
});
