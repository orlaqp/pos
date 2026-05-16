import { CustomerService } from './customer.service';

jest.mock('@pos/shared/amplify', () => ({
    DataStore: {
        query: jest.fn(() => Promise.resolve([])),
    },
}));

describe('CustomerService', () => {
    it('returns customers from DataStore', async () => {
        await expect(CustomerService.getAll()).resolves.toEqual([]);
    });
});
