import { InventoryCountService } from './inventory-count.service';
import { DataStore } from 'aws-amplify';
import { Alert } from 'react-native';

jest.mock('aws-amplify', () => ({
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
    const mockedQuery = DataStore.query as jest.Mock;
    const mockedSave = DataStore.save as jest.Mock;
    const mockedAlert = Alert.alert as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('applies inventory count as absolute quantity when updateInv=true', async () => {
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
                return Promise.resolve({ id: 'p-1', quantity: 10 });
            }

            return Promise.resolve([]);
        });

        await InventoryCountService.save(dispatch, count, true);

        expect(mockedSave).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'p-1', quantity: 15 })
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

        expect(mockedSave).not.toHaveBeenCalledWith(
            expect.objectContaining({ id: 'p-1' })
        );
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
});
