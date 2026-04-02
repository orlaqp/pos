jest.mock('./inventory-receive.service', () => ({
    InventoryReceiveService: {
        getAll: jest.fn(),
    },
}));

import {
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
});
