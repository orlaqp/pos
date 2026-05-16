import {
    customersActions,
    customersAdapter,
    customersReducer,
} from './customers.slice';

describe('customers reducer', () => {
    it('returns initial state', () => {
        expect(customersReducer(undefined, { type: '' })).toEqual(
            customersAdapter.getInitialState({
                loadingStatus: 'not loaded',
                selected: undefined,
            })
        );
    });

    it('upserts and selects a customer', () => {
        const customer = { id: 'customer-1', firstName: 'Ada' };
        let state = customersReducer(
            undefined,
            customersActions.upsert(customer)
        );

        expect(state.entities['customer-1']).toEqual(customer);

        state = customersReducer(state, customersActions.select(customer));
        expect(state.selected).toEqual(customer);
    });
});
