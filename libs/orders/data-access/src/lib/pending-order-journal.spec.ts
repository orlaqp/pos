/* eslint-disable @typescript-eslint/no-explicit-any */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    readPendingOrderJournal,
    reconcilePendingOrderJournal,
    upsertPendingOrderJournalEntry,
} from './pending-order-journal';

describe('pending-order-journal', () => {
    beforeEach(async () => {
        await AsyncStorage.removeItem('pending-order-journal-v1');
    });

    it('upserts and reads back pending orders', async () => {
        await upsertPendingOrderJournalEntry({
            orderId: 'order-1',
            orderNo: '1001',
            tenantId: 'tenant-1',
            statusTarget: 'OPEN',
            cart: { id: 'order-1', items: [], footer: {} as any } as any,
            createdAt: '2026-04-01T00:00:00.000Z',
            updatedAt: '2026-04-01T00:00:00.000Z',
            syncState: 'local_only',
        });

        const entries = await readPendingOrderJournal();
        expect(entries).toHaveLength(1);
        expect(entries[0].orderId).toBe('order-1');
        expect(entries[0].syncState).toBe('local_only');
    });

    it('removes synced entries once the outbox is empty and the order is known locally', async () => {
        await upsertPendingOrderJournalEntry({
            orderId: 'order-1',
            orderNo: '1001',
            tenantId: 'tenant-1',
            statusTarget: 'PAID',
            cart: { id: 'order-1', items: [], footer: {} as any } as any,
            createdAt: '2026-04-01T00:00:00.000Z',
            updatedAt: '2026-04-01T00:00:00.000Z',
            syncState: 'sync_pending',
        });

        const result = await reconcilePendingOrderJournal({
            knownOrderIds: ['order-1'],
            outboxEmpty: true,
        });

        expect(result.removedOrderIds).toEqual(['order-1']);
        expect(result.entries).toEqual([]);
    });
});
