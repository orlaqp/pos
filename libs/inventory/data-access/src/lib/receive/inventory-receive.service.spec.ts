import { InventoryReceiveService } from './inventory-receive.service';
import { DataStore } from '@pos/shared/amplify';
import { Alert } from 'react-native';

jest.mock('@pos/shared/amplify', () => ({
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
    const mockedQuery = DataStore.query as jest.Mock;
    const mockedSave = DataStore.save as jest.Mock;
    const mockedAlert = Alert.alert as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('increments product quantity by received amount when updateInv=true', async () => {
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

        expect(mockedSave).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'p-1', quantity: 5 })
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

        expect(mockedSave).not.toHaveBeenCalledWith(
            expect.objectContaining({ id: 'p-1', quantity: expect.any(Number) })
        );
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
            'Error',
            'Product Ghost Product was not found while updating the inventory'
        );
    });

    it('aggregates duplicate receive lines by product and applies a single increment', async () => {
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

        expect(mockedSave).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'p-1', quantity: 5 })
        );
    });
});
