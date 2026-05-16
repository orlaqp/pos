import { DataStore } from '@pos/shared/amplify';
import { CustomerCreditService } from './customer-credit.service';

jest.mock('@pos/shared/amplify', () => ({
    DataStore: {
        query: jest.fn(() => Promise.resolve([])),
    },
}));

describe('CustomerCreditService', () => {
    it('returns mapped customer credit transactions placeholder data', async () => {
        await expect(CustomerCreditService.getTransactions()).resolves.toEqual([]);
        expect(DataStore.query).toHaveBeenCalled();
    });
});
