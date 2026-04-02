/* eslint-disable @typescript-eslint/no-explicit-any */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    markPendingOrderJournalEntry,
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

        const entries = await readPendingOrderJournal({ tenantId: 'tenant-1' });
        expect(entries).toHaveLength(1);
        expect(entries[0].orderId).toBe('order-1');
        expect(entries[0].syncState).toBe('local_only');
    });

    it('returns entries only for the requested tenant', async () => {
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
        await upsertPendingOrderJournalEntry({
            orderId: 'order-2',
            orderNo: '1002',
            tenantId: 'tenant-2',
            statusTarget: 'OPEN',
            cart: { id: 'order-2', items: [], footer: {} as any } as any,
            createdAt: '2026-04-01T00:00:00.000Z',
            updatedAt: '2026-04-01T00:00:00.000Z',
            syncState: 'local_only',
        });

        const tenantOneEntries = await readPendingOrderJournal({
            tenantId: 'tenant-1',
        });

        expect(tenantOneEntries).toHaveLength(1);
        expect(tenantOneEntries[0].orderId).toBe('order-1');
    });

    it('keeps only the newest 500 orders per tenant', async () => {
        for (let index = 0; index < 501; index += 1) {
            const timestamp = new Date(
                Date.UTC(2026, 3, 1, 0, 0, index)
            ).toISOString();
            await upsertPendingOrderJournalEntry({
                orderId: `order-${index}`,
                orderNo: `${1000 + index}`,
                tenantId: 'tenant-1',
                statusTarget: 'OPEN',
                cart: { id: `order-${index}`, items: [], footer: {} as any } as any,
                createdAt: timestamp,
                updatedAt: timestamp,
                syncState: 'local_only',
            });
        }

        const entries = await readPendingOrderJournal({ tenantId: 'tenant-1' });

        expect(entries).toHaveLength(500);
        expect(entries.some((entry) => entry.orderId === 'order-500')).toBe(true);
        expect(entries.some((entry) => entry.orderId === 'order-0')).toBe(false);
    });

    it('marks synced entries once the outbox is empty and the order is known locally', async () => {
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
            tenantId: 'tenant-1',
        });

        expect(result.syncedOrderIds).toEqual(['order-1']);
        expect(result.entries).toHaveLength(1);
        expect(result.entries[0].syncState).toBe('synced');
    });

    it('updates only entries for the matching tenant', async () => {
        await upsertPendingOrderJournalEntry({
            orderId: 'shared-order',
            orderNo: '1001',
            tenantId: 'tenant-1',
            statusTarget: 'OPEN',
            cart: { id: 'shared-order', items: [], footer: {} as any } as any,
            createdAt: '2026-04-01T00:00:00.000Z',
            updatedAt: '2026-04-01T00:00:00.000Z',
            syncState: 'local_only',
        });
        await upsertPendingOrderJournalEntry({
            orderId: 'shared-order',
            orderNo: '2001',
            tenantId: 'tenant-2',
            statusTarget: 'OPEN',
            cart: { id: 'shared-order', items: [], footer: {} as any } as any,
            createdAt: '2026-04-01T00:00:00.000Z',
            updatedAt: '2026-04-01T00:00:00.000Z',
            syncState: 'local_only',
        });

        await markPendingOrderJournalEntry(
            'shared-order',
            { syncState: 'sync_failed' },
            { tenantId: 'tenant-1' }
        );

        const tenantOneEntries = await readPendingOrderJournal({
            tenantId: 'tenant-1',
        });
        const tenantTwoEntries = await readPendingOrderJournal({
            tenantId: 'tenant-2',
        });

        expect(tenantOneEntries[0].syncState).toBe('sync_failed');
        expect(tenantTwoEntries[0].syncState).toBe('local_only');
    });
});
