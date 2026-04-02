import { InventoryReceiveService } from './inventory-receive.service';
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
    class InventoryReceive {
        constructor(input: any) {
            Object.assign(this, input);
        }

        static copyOf(source: any, mutator: (draft: any) => void) {
            const draft = { ...source };
            mutator(draft);
            return draft;
        }
    }

    class InventoryReceiveLine {
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
        InventoryReceive,
        InventoryReceiveLine,
        Product,
    };
});

describe('InventoryReceiveService', () => {
    const dispatch = jest.fn();
    const mockedGraphql = API.graphql as jest.Mock;
    const mockedQuery = DataStore.query as jest.Mock;
    const mockedSave = DataStore.save as jest.Mock;
    const mockedAlert = Alert.alert as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('sends the received quantity as a delta mutation when updateInv=true', async () => {
        const receive = {
            id: 'receive-1',
            comments: 'r',
            status: 'IN_PROGRESS',
            createdBy: { id: 'e1', name: 'Emp 1' },
            lines: [
                {
                    productId: 'p-1',
                    productName: 'Apple',
                    unitOfMeasure: 'EA',
                    received: 5,
                    comments: '',
                    inventoryReceiveLineInventoryReceiveId: 'receive-1',
                },
            ],
        } as any;

        mockedQuery.mockImplementation((model: unknown, arg: unknown) => {
            if (arg === 'receive-1') {
                return Promise.resolve({ id: 'receive-1', comments: 'old', status: 'IN_PROGRESS' });
            }

            if (arg === 'p-1') {
                return Promise.resolve({ id: 'p-1', quantity: 10 });
            }

            return Promise.resolve([]);
        });

        await InventoryReceiveService.save(dispatch, receive, true);

        expect(mockedGraphql).toHaveBeenCalledWith(
            expect.objectContaining({
                query: expect.stringContaining('mutation UpdateProductInventoryDelta'),
                variables: {
                    input: {
                        id: 'p-1',
                        quantity: 5,
                        _version: undefined,
                    },
                },
                authMode: 'userPool',
            })
        );
    });

    it('skips inventory update when received value is invalid', async () => {
        const receive = {
            id: 'receive-1',
            comments: 'r',
            status: 'IN_PROGRESS',
            createdBy: { id: 'e1', name: 'Emp 1' },
            lines: [
                {
                    productId: 'p-1',
                    productName: 'Apple',
                    unitOfMeasure: 'EA',
                    received: Number.NaN,
                    comments: '',
                    inventoryReceiveLineInventoryReceiveId: 'receive-1',
                },
            ],
        } as any;

        mockedQuery.mockImplementation((model: unknown, arg: unknown) => {
            if (arg === 'receive-1') {
                return Promise.resolve({ id: 'receive-1', comments: 'old', status: 'IN_PROGRESS' });
            }

            if (arg === 'p-1') {
                return Promise.resolve({ id: 'p-1', quantity: 10 });
            }

            return Promise.resolve([]);
        });

        await InventoryReceiveService.save(dispatch, receive, true);

        expect(mockedGraphql).not.toHaveBeenCalled();
    });

    it('alerts when product is missing during receive update', async () => {
        const receive = {
            id: 'receive-1',
            comments: 'r',
            status: 'IN_PROGRESS',
            createdBy: { id: 'e1', name: 'Emp 1' },
            lines: [
                {
                    productId: 'missing',
                    productName: 'Ghost Product',
                    unitOfMeasure: 'EA',
                    received: 2,
                    comments: '',
                    inventoryReceiveLineInventoryReceiveId: 'receive-1',
                },
            ],
        } as any;

        mockedQuery.mockImplementation((model: unknown, arg: unknown) => {
            if (arg === 'receive-1') {
                return Promise.resolve({ id: 'receive-1', comments: 'old', status: 'IN_PROGRESS' });
            }

            if (arg === 'missing') {
                return Promise.resolve(null);
            }

            return Promise.resolve([]);
        });

        await InventoryReceiveService.save(dispatch, receive, true);

        expect(mockedAlert).toHaveBeenCalledWith(
            'Inventory receive partially applied',
            'Product Ghost Product was not found while updating the inventory'
        );
    });

    it('aggregates duplicate receive lines by product and applies a single delta mutation', async () => {
        const receive = {
            id: 'receive-1',
            comments: 'r2',
            status: 'IN_PROGRESS',
            createdBy: { id: 'e1', name: 'Emp 1' },
            lines: [
                {
                    productId: 'p-1',
                    productName: 'Apple',
                    unitOfMeasure: 'EA',
                    received: 2,
                    comments: '',
                    inventoryReceiveLineInventoryReceiveId: 'receive-1',
                },
                {
                    productId: 'p-1',
                    productName: 'Apple',
                    unitOfMeasure: 'EA',
                    received: 3,
                    comments: '',
                    inventoryReceiveLineInventoryReceiveId: 'receive-1',
                },
            ],
        } as any;

        mockedQuery.mockImplementation((model: unknown, arg: unknown) => {
            if (arg === 'receive-1') {
                return Promise.resolve({ id: 'receive-1', comments: 'old', status: 'IN_PROGRESS' });
            }

            if (arg === 'p-1') {
                return Promise.resolve({ id: 'p-1', quantity: 215 });
            }

            return Promise.resolve([]);
        });

        await InventoryReceiveService.save(dispatch, receive, true);

        expect(mockedGraphql).toHaveBeenCalledWith(
            expect.objectContaining({
                query: expect.stringContaining('mutation UpdateProductInventoryDelta'),
                variables: {
                    input: {
                        id: 'p-1',
                        quantity: 5,
                        _version: undefined,
                    },
                },
                authMode: 'userPool',
            })
        );
    });

    it('surfaces GraphQL object errors as readable alert text instead of object Object', async () => {
        const receive = {
            id: 'receive-1',
            comments: 'r4',
            status: 'IN_PROGRESS',
            createdBy: { id: 'e1', name: 'Emp 1' },
            lines: [
                {
                    productId: 'p-1',
                    productName: 'Aceitunas jumbo',
                    unitOfMeasure: 'EA',
                    received: 4,
                    comments: '',
                    inventoryReceiveLineInventoryReceiveId: 'receive-1',
                },
            ],
        } as any;

        mockedQuery.mockImplementation((model: unknown, arg: unknown) => {
            if (arg === 'receive-1') {
                return Promise.resolve({ id: 'receive-1', comments: 'old', status: 'IN_PROGRESS' });
            }

            if (arg === 'p-1') {
                return Promise.resolve({ id: 'p-1', quantity: 4 });
            }

            return Promise.resolve([]);
        });

        mockedGraphql.mockRejectedValueOnce({
            errors: [{ message: 'ConditionalCheckFailedException: version mismatch' }],
        });

        await InventoryReceiveService.save(dispatch, receive, true);

        expect(mockedAlert).toHaveBeenCalledWith(
            'Inventory receive partially applied',
            expect.stringContaining(
                'Aceitunas jumbo: ConditionalCheckFailedException: version mismatch'
            )
        );
    });

    it('still sends the delta mutation when received amount matches the current quantity', async () => {
        const receive = {
            id: 'receive-1',
            comments: 'r3',
            status: 'IN_PROGRESS',
            createdBy: { id: 'e1', name: 'Emp 1' },
            lines: [
                {
                    productId: 'p-1',
                    productName: 'Apple',
                    unitOfMeasure: 'EA',
                    received: 10,
                    comments: '',
                    inventoryReceiveLineInventoryReceiveId: 'receive-1',
                },
            ],
        } as any;

        mockedQuery.mockImplementation((model: unknown, arg: unknown) => {
            if (arg === 'receive-1') {
                return Promise.resolve({ id: 'receive-1', comments: 'old', status: 'IN_PROGRESS' });
            }

            if (arg === 'p-1') {
                return Promise.resolve({ id: 'p-1', quantity: 10, _version: 7 });
            }

            return Promise.resolve([]);
        });

        await InventoryReceiveService.save(dispatch, receive, true);

        expect(mockedGraphql).toHaveBeenCalledWith(
            expect.objectContaining({
                query: expect.stringContaining('mutation UpdateProductInventoryDelta'),
                variables: {
                    input: {
                        id: 'p-1',
                        quantity: 10,
                        _version: 7,
                    },
                },
                authMode: 'userPool',
            })
        );
    });

    it('retries with the latest product version when the initial mutation returns a conflict error', async () => {
        const receive = {
            id: 'receive-1',
            comments: 'r4',
            status: 'IN_PROGRESS',
            createdBy: { id: 'e1', name: 'Emp 1' },
            lines: [
                {
                    productId: 'p-1',
                    productName: 'Apple',
                    unitOfMeasure: 'EA',
                    received: 5,
                    comments: '',
                    inventoryReceiveLineInventoryReceiveId: 'receive-1',
                },
            ],
        } as any;

        mockedQuery.mockImplementation((model: unknown, arg: unknown) => {
            if (arg === 'receive-1') {
                return Promise.resolve({ id: 'receive-1', comments: 'old', status: 'IN_PROGRESS' });
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
                        quantity: 15,
                    },
                },
            });

        await InventoryReceiveService.save(dispatch, receive, true);

        expect(mockedGraphql).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                query: expect.stringContaining('mutation UpdateProductInventoryDelta'),
                variables: {
                    input: {
                        id: 'p-1',
                        quantity: 5,
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
                        quantity: 5,
                        _version: 4,
                    },
                },
            })
        );
    });

});
