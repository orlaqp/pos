import {
    customersActions,
    customersAdapter,
    customersReducer,
    CUSTOMERS_FEATURE_KEY,
    selectAllCustomers,
    selectCustomerLedger,
    selectCustomerSearchResults,
    selectSelectedCustomer,
} from './customers.slice';

describe('customers reducer', () => {
    const initial = customersAdapter.getInitialState({
        loadingStatus: 'not loaded' as const,
        selected: undefined,
        ledger: [],
    });

    it('returns initial state', () => {
        expect(customersReducer(undefined, { type: '' })).toEqual(initial);
    });

    it('sets all customers and exposes them through selectors', () => {
        const state = customersReducer(
            undefined,
            customersActions.setAll([
                { id: 'customer-1', firstName: 'Ada', displayName: 'Ada Lovelace', phone: '555-0100' },
                { id: 'customer-2', firstName: 'Grace', displayName: 'Grace Hopper', email: 'grace@example.com' },
            ])
        );
        const rootState = {
            [CUSTOMERS_FEATURE_KEY]: state,
        } as unknown as Parameters<typeof selectAllCustomers>[0];

        expect(state.loadingStatus).toBe('loaded');
        expect(selectAllCustomers(rootState).map((customer) => customer.id)).toEqual([
            'customer-1',
            'customer-2',
        ]);
        expect(selectCustomerSearchResults(rootState, 'GRACE@EXAMPLE.COM')).toEqual([
            expect.objectContaining({ id: 'customer-2' }),
        ]);
    });

    it('upserts, selects, and clears a customer', () => {
        const customer = { id: 'customer-1', firstName: 'Ada', displayName: 'Ada Lovelace' };
        let state = customersReducer(undefined, customersActions.upsert(customer));

        expect(state.entities['customer-1']).toEqual(customer);

        state = customersReducer(state, customersActions.select(customer));
        expect(
            selectSelectedCustomer({
                [CUSTOMERS_FEATURE_KEY]: state,
            } as unknown as Parameters<typeof selectSelectedCustomer>[0])
        ).toEqual(customer);

        state = customersReducer(state, customersActions.clearSelection());
        expect(state.selected).toBeUndefined();
    });

    it('stores and clears customer ledger history', () => {
        let state = customersReducer(
            undefined,
            customersActions.setLedger([
                {
                    id: 'tx-1',
                    customerId: 'customer-1',
                    customerDisplayName: 'Ada Lovelace',
                    transactionDate: '2026-05-16T12:00:00.000Z',
                    type: 'CREDIT_PURCHASE',
                    amount: 25,
                    balanceAfter: 25,
                    referenceKey: 'order-1',
                    employeeId: 'employee-1',
                    employeeName: 'Employee One',
                },
            ])
        );

        expect(
            selectCustomerLedger({
                [CUSTOMERS_FEATURE_KEY]: state,
            } as unknown as Parameters<typeof selectCustomerLedger>[0])
        ).toEqual([
            expect.objectContaining({ id: 'tx-1' }),
        ]);

        state = customersReducer(state, customersActions.clearLedger());
        expect(state.ledger).toEqual([]);
    });
});
