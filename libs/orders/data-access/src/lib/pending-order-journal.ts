import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CartPayment, CartState } from '@pos/sales/data-access';
import { OrderStatus } from '@pos/shared/models';

const PENDING_ORDER_JOURNAL_KEY = 'pending-order-journal-v1';
const PENDING_ORDER_JOURNAL_LIMIT = 500;

export type PendingOrderSyncState =
    | 'local_only'
    | 'sync_pending'
    | 'synced'
    | 'sync_failed';

export interface PendingOrderJournalEntry {
    orderId: string;
    orderNo?: string;
    tenantId?: string;
    statusTarget: OrderStatus | keyof typeof OrderStatus;
    cart: CartState;
    payments?: CartPayment[];
    employee?: {
        id?: string;
        name?: string;
    };
    createdAt: string;
    updatedAt: string;
    syncState: PendingOrderSyncState;
    lastError?: string;
}

interface PendingOrderJournalReadOptions {
    tenantId?: string;
    limit?: number;
}

const parseJournal = (raw: string | null): PendingOrderJournalEntry[] => {
    if (!raw) return [];

    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const matchesTenant = (
    entry: PendingOrderJournalEntry,
    tenantId?: string
) => !tenantId || entry.tenantId === tenantId;

const toTimestamp = (value?: string) => {
    if (!value) return 0;
    const timestamp = Date.parse(value);
    return Number.isNaN(timestamp) ? 0 : timestamp;
};

const sortEntries = (entries: PendingOrderJournalEntry[]) =>
    [...entries].sort((left, right) => {
        const rightTimestamp = Math.max(
            toTimestamp(right.updatedAt),
            toTimestamp(right.createdAt)
        );
        const leftTimestamp = Math.max(
            toTimestamp(left.updatedAt),
            toTimestamp(left.createdAt)
        );

        return rightTimestamp - leftTimestamp;
    });

const compactJournal = (entries: PendingOrderJournalEntry[]) => {
    const entriesByTenant = new Map<string, PendingOrderJournalEntry[]>();

    entries.forEach((entry) => {
        const tenantKey = entry.tenantId || '__unknown__';
        const currentEntries = entriesByTenant.get(tenantKey) ?? [];
        currentEntries.push(entry);
        entriesByTenant.set(tenantKey, currentEntries);
    });

    return Array.from(entriesByTenant.values()).flatMap((tenantEntries) =>
        sortEntries(tenantEntries).slice(0, PENDING_ORDER_JOURNAL_LIMIT)
    );
};

const filterJournal = (
    entries: PendingOrderJournalEntry[],
    options?: PendingOrderJournalReadOptions
) =>
    sortEntries(entries.filter((entry) => matchesTenant(entry, options?.tenantId))).slice(
        0,
        options?.limit ?? PENDING_ORDER_JOURNAL_LIMIT
    );

const writeJournal = async (entries: PendingOrderJournalEntry[]) => {
    await AsyncStorage.setItem(
        PENDING_ORDER_JOURNAL_KEY,
        JSON.stringify(compactJournal(entries))
    );
};

export const readPendingOrderJournal = async (
    options?: PendingOrderJournalReadOptions
) => {
    const raw = await AsyncStorage.getItem(PENDING_ORDER_JOURNAL_KEY);
    return filterJournal(parseJournal(raw), options);
};

export const upsertPendingOrderJournalEntry = async (
    entry: PendingOrderJournalEntry
) => {
    const entries = parseJournal(
        await AsyncStorage.getItem(PENDING_ORDER_JOURNAL_KEY)
    );
    const nextEntries = [
        entry,
        ...entries.filter(
            (item) =>
                item.orderId !== entry.orderId ||
                item.tenantId !== entry.tenantId
        ),
    ];
    await writeJournal(nextEntries);
    return filterJournal(nextEntries, { tenantId: entry.tenantId });
};

export const removePendingOrderJournalEntry = async (
    orderId: string,
    options?: { tenantId?: string }
) => {
    const entries = parseJournal(
        await AsyncStorage.getItem(PENDING_ORDER_JOURNAL_KEY)
    );
    const nextEntries = entries.filter(
        (item) =>
            item.orderId !== orderId || !matchesTenant(item, options?.tenantId)
    );
    await writeJournal(nextEntries);
    return filterJournal(nextEntries, options);
};

export const markPendingOrderJournalEntry = async (
    orderId: string,
    updates: Partial<
        Pick<PendingOrderJournalEntry, 'syncState' | 'lastError' | 'updatedAt'>
    >,
    options?: { tenantId?: string }
) => {
    const entries = parseJournal(
        await AsyncStorage.getItem(PENDING_ORDER_JOURNAL_KEY)
    );
    const nextEntries = entries.map((entry) =>
        entry.orderId === orderId && matchesTenant(entry, options?.tenantId)
            ? {
                  ...entry,
                  ...updates,
                  updatedAt: updates.updatedAt ?? new Date().toISOString(),
              }
            : entry
    );
    await writeJournal(nextEntries);
    return filterJournal(nextEntries, options);
};

export const reconcilePendingOrderJournal = async (options: {
    knownOrderIds: string[];
    outboxEmpty: boolean;
    tenantId?: string;
}) => {
    const entries = parseJournal(
        await AsyncStorage.getItem(PENDING_ORDER_JOURNAL_KEY)
    );
    const knownOrderIds = new Set(options.knownOrderIds);
    const syncedOrderIds: string[] = [];

    const nextEntries = entries.map((entry) => {
        const isKnown = knownOrderIds.has(entry.orderId);
        const shouldMarkSynced =
            options.outboxEmpty &&
            isKnown &&
            matchesTenant(entry, options.tenantId) &&
            entry.syncState !== 'synced';

        if (!shouldMarkSynced) {
            return entry;
        }

        syncedOrderIds.push(entry.orderId);
        return {
            ...entry,
            syncState: 'synced' as const,
            lastError: undefined,
            updatedAt: new Date().toISOString(),
        };
    });

    if (syncedOrderIds.length > 0) {
        await writeJournal(nextEntries);
    }

    return {
        entries: filterJournal(nextEntries, options),
        syncedOrderIds,
    };
};

export const clearPendingOrderJournal = async () => {
    await AsyncStorage.removeItem(PENDING_ORDER_JOURNAL_KEY);
};
