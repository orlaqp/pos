import { InventoryReceiveService } from './inventory-receive.service';
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

jest.mock('@pos/auth/data-access', () => ({
    requireCurrentTenantId: () => 'tenant-1',
    stampTenant: (value: Record<string, unknown>) => ({
        ...value,
        tenantId: 'tenant-1',
    }),
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

    return {
        InventoryReceive,
        InventoryReceiveLine,
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

    it('finalizes inventory receive through the backend lifecycle query', async () => {
        mockedQuery.mockResolvedValueOnce({
            id: 'receive-1',
            status: 'IN_PROGRESS',
            comments: 'restock',
        });
        mockedQuery.mockResolvedValueOnce([]);
        mockedSave.mockImplementation(async (value) => value);
        mockedGraphql.mockResolvedValue({
            data: {
                finalizeInventoryReceive: {
                    sourceId: 'receive-1',
                    sourceType: 'INVENTORY_RECEIVE',
                    status: 'APPLIED',
                    appliedAt: '2026-04-17T10:00:00.000Z',
                    error: null,
                    affectedProducts: [
                        {
                            productId: 'p-1',
                            finalQuantity: 15,
                            appliedDelta: 5,
                        },
                    ],
                },
            },
        });

        const saved = await InventoryReceiveService.save(
            dispatch,
            {
                id: 'receive-1',
                comments: 'restock',
                status: 'COMPLETED',
                createdBy: { id: 'e1', name: 'Emp 1' },
                lines: [
                    {
                        id: 'line-1',
                        productId: 'p-1',
                        productName: 'Apple',
                        unitOfMeasure: 'EA',
                        received: 5,
                        comments: '',
                        inventoryReceiveLineInventoryReceiveId: 'receive-1',
                    },
                ],
            } as any,
            true
        );

        expect(saved).toBe(true);
        expect(mockedGraphql).toHaveBeenCalledWith(
            expect.objectContaining({
                query: expect.stringContaining('query FinalizeInventoryReceive'),
                authMode: 'userPool',
                variables: {
                    input: expect.objectContaining({
                        receiveId: 'receive-1',
                        comments: 'restock',
                        createdBy: { id: 'e1', name: 'Emp 1' },
                        lines: [
                            expect.objectContaining({
                                id: 'line-1',
                                productId: 'p-1',
                                received: 5,
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
            payload: [{ productId: 'p-1', newCount: 15 }],
        });
        expect(mockedQuery).toHaveBeenCalledWith(expect.anything(), 'receive-1');
        expect(mockedSave).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'receive-1',
                status: 'COMPLETED',
                comments: 'restock',
            })
        );
    });

    it('persists drafts locally without calling the finalization query', async () => {
        mockedSave.mockImplementation(async (value) => ({
            ...value,
            id: value.id || 'draft-1',
        }));

        const saved = await InventoryReceiveService.save(
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
                        received: 2,
                        comments: '',
                        inventoryReceiveLineInventoryReceiveId: '',
                    },
                ],
            } as any,
            false
        );

        expect(saved).toBe(true);
        expect(mockedGraphql).not.toHaveBeenCalled();
        expect(mockedSave).toHaveBeenCalled();
    });

    it('creates a local completed receive when finalizing a brand-new receive', async () => {
        mockedQuery
            .mockResolvedValueOnce(undefined)
            .mockResolvedValueOnce([]);
        mockedSave.mockImplementation(async (value) => ({
            ...value,
            id: value.id || 'receive-2',
        }));
        mockedGraphql.mockResolvedValue({
            data: {
                finalizeInventoryReceive: {
                    sourceId: 'receive-2',
                    sourceType: 'INVENTORY_RECEIVE',
                    status: 'APPLIED',
                    appliedAt: '2026-04-17T10:00:00.000Z',
                    error: null,
                    affectedProducts: [],
                },
            },
        });

        const saved = await InventoryReceiveService.save(
            dispatch,
            {
                comments: 'restock',
                status: 'COMPLETED',
                createdBy: { id: 'e1', name: 'Emp 1' },
                lines: [
                    {
                        productId: 'p-1',
                        productName: 'Apple',
                        unitOfMeasure: 'EA',
                        received: 5,
                        comments: '',
                        inventoryReceiveLineInventoryReceiveId: '',
                    },
                ],
            } as any,
            true
        );

        expect(saved).toBe(true);
        expect(mockedSave).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'receive-2',
                status: 'COMPLETED',
                comments: 'restock',
            })
        );
        expect(mockedSave).toHaveBeenCalledWith(
            expect.not.objectContaining({
                id: undefined,
            })
        );
        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: expect.stringContaining('/add'),
            })
        );
    });

    it('surfaces finalization errors to the user and returns false', async () => {
        mockedGraphql.mockRejectedValueOnce(
            new Error('conditional request failed')
        );

        const saved = await InventoryReceiveService.save(
            dispatch,
            {
                id: 'receive-1',
                comments: 'restock',
                status: 'COMPLETED',
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
            } as any,
            true
        );

        expect(saved).toBe(false);
        expect(mockedAlert).toHaveBeenCalledWith(
            'Unable to finalize inventory receive',
            'conditional request failed'
        );
    });

    it('returns false when AppSync reports GraphQL errors', async () => {
        mockedGraphql.mockResolvedValueOnce({
            errors: [{ message: 'Inventory document already finalized' }],
        });

        const saved = await InventoryReceiveService.save(
            dispatch,
            {
                id: 'receive-1',
                comments: 'restock',
                status: 'COMPLETED',
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
            } as any,
            true
        );

        expect(saved).toBe(false);
        expect(mockedAlert).toHaveBeenCalledWith(
            'Unable to finalize inventory receive',
            'Inventory document already finalized'
        );
    });

    it('deletes receive headers and lines together', async () => {
        mockedQuery
            .mockResolvedValueOnce({ id: 'receive-1' })
            .mockResolvedValueOnce([{ id: 'line-1' }, { id: 'line-2' }]);

        await InventoryReceiveService.delete('receive-1');

        expect(mockedQuery).toHaveBeenCalledTimes(2);
        expect(DataStore.delete).toHaveBeenCalledTimes(3);
    });
});
