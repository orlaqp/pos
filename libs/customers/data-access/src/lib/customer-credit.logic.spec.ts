import { buildCustomerCreditSnapshot } from './customer-credit.logic';

describe('customer credit logic placeholders', () => {
    it('builds an empty customer credit snapshot', () => {
        expect(buildCustomerCreditSnapshot()).toEqual({
            customer: undefined,
            transactions: [],
        });
    });
});
