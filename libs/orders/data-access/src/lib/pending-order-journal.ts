import AsyncStorage from '@react-native-async-storage/async-storage';
import { OrderStatus } from '@pos/shared/models';

const PENDING_ORDER_JOURNAL_KEY = 'pending-order-journal-v1';

export type PendingOrderSyncState =
    | 'local_only'
    | 'sync_pending'
    | 'synced'
    | 'sync_failed';

export interface PendingOrderCartLine {
    identifier?: string;
    quantity: number;
    product: Record<string, unknown>;
}

export interface PendingOrderCartState {
    id?: string;
    orderNo?: string;
    header?: Record<string, unknown>;
    items?: PendingOrderCartLine[];
    footer?: Record<string, unknown>;
    payments?: Array<Record<string, unknown>>;
    [key: string]: unknown;
}

export interface PendingOrderJournalEntry {
    orderId: string;
    orderNo?: string;
    tenantId?: string;
    statusTarget: OrderStatus | keyof typeof OrderStatus;
    cart: PendingOrderCartState;
    payments?: Array<Record<string, unknown>>;
    employee?: {
        id?: string;
        name?: string;
    };
    createdAt: string;
    updatedAt: string;
    syncState: PendingOrderSyncState;
    lastError?: string;
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

const writeJournal = async (entries: PendingOrderJournalEntry[]) => {
    await AsyncStorage.setItem(
        PENDING_ORDER_JOURNAL_KEY,
        JSON.stringify(entries)
    );
};

export const readPendingOrderJournal = async () => {
    const raw = await AsyncStorage.getItem(PENDING_ORDER_JOURNAL_KEY);
    return parseJournal(raw);
};

export const upsertPendingOrderJournalEntry = async (
    entry: PendingOrderJournalEntry
) => {
    const entries = await readPendingOrderJournal();
    const nextEntries = [
        entry,
        ...entries.filter((item) => item.orderId !== entry.orderId),
    ];
    await writeJournal(nextEntries);
    return nextEntries;
};

export const removePendingOrderJournalEntry = async (orderId: string) => {
    const entries = await readPendingOrderJournal();
    const nextEntries = entries.filter((item) => item.orderId !== orderId);
    await writeJournal(nextEntries);
    return nextEntries;
};

export const markPendingOrderJournalEntry = async (
    orderId: string,
    updates: Partial<
        Pick<PendingOrderJournalEntry, 'syncState' | 'lastError' | 'updatedAt'>
    >
) => {
    const entries = await readPendingOrderJournal();
    const nextEntries = entries.map((entry) =>
        entry.orderId === orderId
            ? {
                  ...entry,
                  ...updates,
                  updatedAt: updates.updatedAt ?? new Date().toISOString(),
              }
            : entry
    );
    await writeJournal(nextEntries);
    return nextEntries;
};

export const reconcilePendingOrderJournal = async (options: {
    knownOrderIds: string[];
    outboxEmpty: boolean;
}) => {
    const entries = await readPendingOrderJournal();
    const knownOrderIds = new Set(options.knownOrderIds);
    const removedOrderIds: string[] = [];

    const nextEntries = entries.filter((entry) => {
        const isKnown = knownOrderIds.has(entry.orderId);
        if (options.outboxEmpty && isKnown) {
            removedOrderIds.push(entry.orderId);
            return false;
        }

        return true;
    });

    if (removedOrderIds.length > 0) {
        await writeJournal(nextEntries);
    }

    return {
        entries: nextEntries,
        removedOrderIds,
    };
};

export const clearPendingOrderJournal = async () => {
    await AsyncStorage.removeItem(PENDING_ORDER_JOURNAL_KEY);
};
