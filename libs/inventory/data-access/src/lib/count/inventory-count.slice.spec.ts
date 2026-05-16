jest.mock('./inventory-count.service', () => ({
    InventoryCountService: {
        getAll: jest.fn(),
    },
}));

import {
    fetchInventoryCount,
    initialInventoryCountState,
    inventoryCountActions,
    inventoryCountReducer,
} from './inventory-count.slice';

describe('inventoryCountSlice chronology', () => {
    it('keeps filtered counts in newest-first chronological order', () => {
        const state = inventoryCountReducer(
            initialInventoryCountState,
            inventoryCountActions.setAll([
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

    it('keeps composed line details when fetchInventoryCount completes later', () => {
        const withLines = inventoryCountReducer(
            initialInventoryCountState,
            inventoryCountActions.setLines([
                {
                    id: 'line-1',
                    inventoryCountLineInventoryCountId: 'count-1',
                    productId: 'p-1',
                    productName: 'Apple',
                    unitOfMeasure: 'EA',
                    current: 5,
                    newCount: 7,
                    comments: 'counted',
                },
            ] as any)
        );

        const fetched = inventoryCountReducer(
            withLines,
            fetchInventoryCount.fulfilled(
                [
                    {
                        id: 'count-1',
                        comments: 'cycle count',
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

        expect(fetched.entities['count-1']?.lines).toEqual([
            expect.objectContaining({
                id: 'line-1',
                productId: 'p-1',
                newCount: 7,
            }),
        ]);
    });
});
