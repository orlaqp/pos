import { InventoryCountService } from './inventory-count.service';
import { API, DataStore } from '@pos/shared/amplify';
import { Alert } from 'react-native';

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

jest.mock('@pos/products/data-access', () => ({
    productsActions: {
        updateQuantities: (payload: unknown) => ({
            type: 'products/updateQuantities',
            payload,
        }),
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

    return {
        InventoryCount,
        InventoryCountLine,
    };
});

describe('InventoryCountService', () => {
    const dispatch = jest.fn();
    const mockedGraphql = API.graphql as jest.Mock;
    const mockedSave = DataStore.save as jest.Mock;
    const mockedAlert = Alert.alert as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('finalizes counts through the backend lifecycle query and applies exact quantities locally', async () => {
        mockedGraphql.mockResolvedValue({
            data: {
                finalizeInventoryCount: {
                    sourceId: 'count-1',
                    sourceType: 'INVENTORY_COUNT',
                    status: 'APPLIED',
                    appliedAt: '2026-04-17T10:00:00.000Z',
                    error: null,
                    affectedProducts: [
                        {
                            productId: 'p-1',
                            finalQuantity: 30,
                            appliedDelta: 5,
                        },
                    ],
                },
            },
        });

        const saved = await InventoryCountService.save(
            dispatch,
            {
                id: 'count-1',
                comments: 'cycle count',
                status: 'COMPLETED',
                createdBy: { id: 'e1', name: 'Emp 1' },
                lines: [
                    {
                        id: 'line-1',
                        productId: 'p-1',
                        productName: 'Apple',
                        unitOfMeasure: 'EA',
                        current: 25,
                        newCount: 30,
                        comments: '',
                        inventoryCountLineInventoryCountId: 'count-1',
                    },
                ],
            } as any,
            true
        );

        expect(saved).toBe(true);
        expect(mockedGraphql).toHaveBeenCalledWith(
            expect.objectContaining({
                query: expect.stringContaining('query FinalizeInventoryCount'),
                authMode: 'userPool',
                variables: {
                    input: expect.objectContaining({
                        countId: 'count-1',
                        comments: 'cycle count',
                        lines: [
                            expect.objectContaining({
                                id: 'line-1',
                                productId: 'p-1',
                                current: 25,
                                newCount: 30,
                            }),
                        ],
                    }),
                },
            })
        );
        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: expect.stringContaining('/update'),
            })
        );
        expect(dispatch).toHaveBeenCalledWith({
            type: 'products/updateQuantities',
            payload: [{ productId: 'p-1', newCount: 30 }],
        });
    });

    it('persists count drafts without calling the lifecycle query', async () => {
        mockedSave.mockImplementation(async (value) => ({
            ...value,
            id: value.id || 'draft-count-1',
        }));

        const saved = await InventoryCountService.save(
            dispatch,
            {
                comments: 'draft',
                status: 'IN_PROGRESS',
                createdBy: { id: 'e1', name: 'Emp 1' },
                lines: [
                    {
                        productId: 'p-1',
                        productName: 'Apple',
                        unitOfMeasure: 'EA',
                        current: 20,
                        newCount: 22,
                        comments: '',
                        inventoryCountLineInventoryCountId: '',
                    },
                ],
            } as any,
            false
        );

        expect(saved).toBe(true);
        expect(mockedGraphql).not.toHaveBeenCalled();
        expect(mockedSave).toHaveBeenCalled();
    });

    it('alerts and returns false when count finalization fails', async () => {
        mockedGraphql.mockRejectedValueOnce(new Error('inventory unavailable'));

        const saved = await InventoryCountService.save(
            dispatch,
            {
                id: 'count-1',
                comments: 'cycle count',
                status: 'COMPLETED',
                createdBy: { id: 'e1', name: 'Emp 1' },
                lines: [
                    {
                        productId: 'p-1',
                        productName: 'Apple',
                        unitOfMeasure: 'EA',
                        current: 20,
                        newCount: 22,
                        comments: '',
                        inventoryCountLineInventoryCountId: 'count-1',
                    },
                ],
            } as any,
            true
        );

        expect(saved).toBe(false);
        expect(mockedAlert).toHaveBeenCalledWith(
            'Unable to finalize inventory count',
            'inventory unavailable'
        );
    });

    it('returns false when AppSync returns count finalization errors', async () => {
        mockedGraphql.mockResolvedValueOnce({
            errors: [{ message: 'This inventory document has already been finalized' }],
        });

        const saved = await InventoryCountService.save(
            dispatch,
            {
                id: 'count-1',
                comments: 'cycle count',
                status: 'COMPLETED',
                createdBy: { id: 'e1', name: 'Emp 1' },
                lines: [
                    {
                        productId: 'p-1',
                        productName: 'Apple',
                        unitOfMeasure: 'EA',
                        current: 20,
                        newCount: 22,
                        comments: '',
                        inventoryCountLineInventoryCountId: 'count-1',
                    },
                ],
            } as any,
            true
        );

        expect(saved).toBe(false);
        expect(mockedAlert).toHaveBeenCalledWith(
            'Unable to finalize inventory count',
            'This inventory document has already been finalized'
        );
    });
});
