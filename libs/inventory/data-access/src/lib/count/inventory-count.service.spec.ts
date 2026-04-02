import { InventoryCountService } from './inventory-count.service';
import { API, DataStore } from '@pos/shared/amplify';
import { Alert } from 'react-native';
import { getProduct } from '@pos/shared/api';

jest.mock('@pos/shared/amplify', () => ({
    API: {
        graphql: jest.fn(),
    },
    DataStore: {
        query: jest.fn(),
        save: jest.fn(),
        delete: jest.fn(),
    },
}));

jest.mock('react-native', () => ({
    Alert: {
        alert: jest.fn(),
    },
}));

jest.mock('@pos/shared/models', () => {
    class InventoryCount {
        constructor(input: any) {
            Object.assign(this, input);
        }

        static copyOf(source: any, mutator: (draft: any) => void) {
            const draft = { ...source };
            mutator(draft);
            return draft;
        }
    }

    class InventoryCountLine {
        constructor(input: any) {
            Object.assign(this, input);
        }

        static copyOf(source: any, mutator: (draft: any) => void) {
            const draft = { ...source };
            mutator(draft);
            return draft;
        }
    }

    class Product {
        constructor(input: any) {
            Object.assign(this, input);
        }

        static copyOf(source: any, mutator: (draft: any) => void) {
            const draft = { ...source };
            mutator(draft);
            return draft;
        }
    }

    return {
        InventoryCount,
        InventoryCountLine,
        Product,
    };
});

describe('InventoryCountService', () => {
    const dispatch = jest.fn();
    const mockedGraphql = API.graphql as jest.Mock;
    const mockedQuery = DataStore.query as jest.Mock;
    const mockedSave = DataStore.save as jest.Mock;
    const mockedAlert = Alert.alert as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('applies inventory count as a delta mutation when updateInv=true', async () => {
        const count = {
            id: 'count-1',
            comments: 'c',
            status: 'IN_PROGRESS',
            createdBy: { id: 'e1', name: 'Emp 1' },
            lines: [
                {
                    productId: 'p-1',
                    productName: 'Apple',
                    unitOfMeasure: 'EA',
                    current: 10,
                    newCount: 25,
                    comments: '',
                    inventoryCountLineInventoryCountId: 'count-1',
                },
            ],
        } as any;

        mockedQuery.mockImplementation((model: unknown, arg: unknown) => {
            if (arg === 'count-1') {
                return Promise.resolve({ id: 'count-1', comments: 'old', status: 'IN_PROGRESS' });
            }

            if (arg === 'p-1') {
                return Promise.resolve({ id: 'p-1', quantity: 10, _version: 3 });
            }

            return Promise.resolve([]);
        });

        await InventoryCountService.save(dispatch, count, true);

        expect(mockedGraphql).toHaveBeenCalledWith(
            expect.objectContaining({
                query: expect.stringContaining('mutation UpdateProductInventoryDelta'),
                variables: {
                    input: {
                        id: 'p-1',
                        quantity: 15,
                        _version: 3,
                    },
                },
                authMode: 'userPool',
            })
        );
    });

    it('does not update product inventory when updateInv=false', async () => {
        const count = {
            id: 'count-1',
            comments: 'c',
            status: 'IN_PROGRESS',
            createdBy: { id: 'e1', name: 'Emp 1' },
            lines: [
                {
                    productId: 'p-1',
                    productName: 'Apple',
                    unitOfMeasure: 'EA',
                    current: 10,
                    newCount: 25,
                    comments: '',
                    inventoryCountLineInventoryCountId: 'count-1',
                },
            ],
        } as any;

        mockedQuery.mockImplementation((model: unknown, arg: unknown) => {
            if (arg === 'count-1') {
                return Promise.resolve({ id: 'count-1', comments: 'old', status: 'IN_PROGRESS' });
            }

            return Promise.resolve([]);
        });

        await InventoryCountService.save(dispatch, count, false);

        expect(mockedGraphql).not.toHaveBeenCalled();
    });

    it('alerts and continues when a product is missing during inventory update', async () => {
        const count = {
            id: 'count-1',
            comments: 'c',
            status: 'IN_PROGRESS',
            createdBy: { id: 'e1', name: 'Emp 1' },
            lines: [
                {
                    productId: 'missing',
                    productName: 'Ghost Product',
                    unitOfMeasure: 'EA',
                    current: 0,
                    newCount: 5,
                    comments: '',
                    inventoryCountLineInventoryCountId: 'count-1',
                },
            ],
        } as any;

        mockedQuery.mockImplementation((model: unknown, arg: unknown) => {
            if (arg === 'count-1') {
                return Promise.resolve({ id: 'count-1', comments: 'old', status: 'IN_PROGRESS' });
            }

            if (arg === 'missing') {
                return Promise.resolve(null);
            }

            return Promise.resolve([]);
        });

        await InventoryCountService.save(dispatch, count, true);

        expect(mockedAlert).toHaveBeenCalledWith(
            'Error',
            'Product Ghost Product was not found while updating the inventory'
        );
    });

    it('retries count delta with latest version when initial mutation conflicts', async () => {
        const count = {
            id: 'count-1',
            comments: 'c',
            status: 'IN_PROGRESS',
            createdBy: { id: 'e1', name: 'Emp 1' },
            lines: [
                {
                    productId: 'p-1',
                    productName: 'Apple',
                    unitOfMeasure: 'EA',
                    current: 10,
                    newCount: 25,
                    comments: '',
                    inventoryCountLineInventoryCountId: 'count-1',
                },
            ],
        } as any;

        mockedQuery.mockImplementation((model: unknown, arg: unknown) => {
            if (arg === 'count-1') {
                return Promise.resolve({ id: 'count-1', comments: 'old', status: 'IN_PROGRESS' });
            }

            if (arg === 'p-1') {
                return Promise.resolve({ id: 'p-1', quantity: 10, _version: 3 });
            }

            return Promise.resolve([]);
        });

        mockedGraphql
            .mockResolvedValueOnce({
                errors: [{ message: 'ConflictUnhandled: version mismatch' }],
            })
            .mockResolvedValueOnce({
                data: {
                    getProduct: {
                        id: 'p-1',
                        _version: 4,
                    },
                },
            })
            .mockResolvedValueOnce({
                data: {
                    updateProduct: {
                        id: 'p-1',
                        quantity: 25,
                    },
                },
            });

        await InventoryCountService.save(dispatch, count, true);

        expect(mockedGraphql).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                query: expect.stringContaining('mutation UpdateProductInventoryDelta'),
                variables: {
                    input: {
                        id: 'p-1',
                        quantity: 15,
                        _version: 3,
                    },
                },
            })
        );
        expect(mockedGraphql).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                query: getProduct,
                variables: { id: 'p-1' },
            })
        );
        expect(mockedGraphql).toHaveBeenNthCalledWith(
            3,
            expect.objectContaining({
                query: expect.stringContaining('mutation UpdateProductInventoryDelta'),
                variables: {
                    input: {
                        id: 'p-1',
                        quantity: 15,
                        _version: 4,
                    },
                },
            })
        );
    });
});
