import {
    clearPendingOrderJournal,
    markPendingOrderJournalEntry,
    readPendingOrderJournal,
    reconcilePendingOrderJournal,
    removePendingOrderJournalEntry,
    upsertPendingOrderJournalEntry,
} from './pending-order-journal';

describe('pending-order-journal', () => {
    it('returns no entries when journal persistence is disabled', async () => {
        const entries = await readPendingOrderJournal({ tenantId: 'tenant-1' });
        expect(entries).toEqual([]);
    });

    it('treats upsert, mark, and remove as no-ops', async () => {
        await expect(
            upsertPendingOrderJournalEntry({
                orderId: 'order-1',
                orderNo: '1001',
                tenantId: 'tenant-1',
                statusTarget: 'OPEN',
                cart: { id: 'order-1', items: [], footer: {} as any } as any,
                createdAt: '2026-04-01T00:00:00.000Z',
                updatedAt: '2026-04-01T00:00:00.000Z',
                syncState: 'local_only',
            })
        ).resolves.toEqual([]);

        await expect(
            markPendingOrderJournalEntry(
                'order-1',
                { syncState: 'sync_failed' },
                { tenantId: 'tenant-1' }
            )
        ).resolves.toEqual([]);

        await expect(
            removePendingOrderJournalEntry('order-1', { tenantId: 'tenant-1' })
        ).resolves.toEqual([]);
    });

    it('returns an empty reconcile result', async () => {
        await expect(
            reconcilePendingOrderJournal({
                knownOrderIds: ['order-1'],
                outboxEmpty: true,
                tenantId: 'tenant-1',
            })
        ).resolves.toEqual({
            entries: [],
            syncedOrderIds: [],
        });
    });

    it('clears successfully as a no-op', async () => {
        await expect(clearPendingOrderJournal()).resolves.toBeUndefined();
    });
});
