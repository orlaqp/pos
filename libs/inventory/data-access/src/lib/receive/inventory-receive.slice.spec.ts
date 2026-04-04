jest.mock('./inventory-receive.service', () => ({
    InventoryReceiveService: {
        getAll: jest.fn(),
    },
}));

import {
    fetchInventoryReceive,
    initialInventoryReceiveState,
    inventoryReceiveActions,
    inventoryReceiveReducer,
} from './inventory-receive.slice';

describe('inventoryReceiveSlice chronology', () => {
    it('keeps filtered receives in newest-first chronological order', () => {
        const state = inventoryReceiveReducer(
            initialInventoryReceiveState,
            inventoryReceiveActions.setAll([
                {
                    id: 'oldest',
                    comments: 'older',
                    status: 'COMPLETED',
                    lines: [],
                    createdBy: { name: 'A' },
                    createdAt: '2026-03-01T10:00:00.000Z',
                },
                {
                    id: 'newest',
                    comments: 'newer',
                    status: 'COMPLETED',
                    lines: [],
                    createdBy: { name: 'B' },
                    createdAt: '2026-03-03T10:00:00.000Z',
                },
                {
                    id: 'middle',
                    comments: 'middle',
                    status: 'COMPLETED',
                    lines: [],
                    createdBy: { name: 'C' },
                    createdAt: '2026-03-02T10:00:00.000Z',
                },
            ])
        );

        expect(state.filteredList?.map((item) => item.id)).toEqual([
            'newest',
            'middle',
            'oldest',
        ]);
    });

    it('keeps composed line details when fetchInventoryReceive completes later', () => {
        const withLines = inventoryReceiveReducer(
            initialInventoryReceiveState,
            inventoryReceiveActions.setLines([
                {
                    id: 'line-1',
                    inventoryReceiveLineInventoryReceiveId: 'receive-1',
                    productId: 'p-1',
                    productName: 'Apple',
                    unitOfMeasure: 'EA',
                    current: 5,
                    received: 2,
                    comments: 'received',
                },
            ] as any)
        );

        const fetched = inventoryReceiveReducer(
            withLines,
            fetchInventoryReceive.fulfilled(
                [
                    {
                        id: 'receive-1',
                        comments: 'delivery',
                        status: 'COMPLETED',
                        lines: [],
                        createdBy: { name: 'A' },
                        createdAt: '2026-03-03T10:00:00.000Z',
                    },
                ] as any,
                '',
                undefined
            )
        );

        expect(fetched.entities['receive-1']?.lines).toEqual([
            expect.objectContaining({
                id: 'line-1',
                productId: 'p-1',
                received: 2,
            }),
        ]);
    });
});
