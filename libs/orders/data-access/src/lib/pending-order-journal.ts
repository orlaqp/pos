import { OrderStatus } from '@pos/shared/models';

export interface PendingOrderCartPayment {
    type: string;
    amount: number;
}

export interface PendingOrderCartState {
    id?: string;
    orderNo?: string;
    [key: string]: unknown;
}

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
    cart: PendingOrderCartState;
    payments?: PendingOrderCartPayment[];
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

const EMPTY_ENTRIES: PendingOrderJournalEntry[] = [];
const EMPTY_RECONCILE_RESULT = {
    entries: EMPTY_ENTRIES,
    syncedOrderIds: [] as string[],
};

export const readPendingOrderJournal = async (
    options?: PendingOrderJournalReadOptions
) => {
    void options;
    return EMPTY_ENTRIES;
};

export const upsertPendingOrderJournalEntry = async (
    entry: PendingOrderJournalEntry
) => {
    void entry;
    return EMPTY_ENTRIES;
};

export const removePendingOrderJournalEntry = async (
    orderId: string,
    options?: { tenantId?: string }
) => {
    void orderId;
    void options;
    return EMPTY_ENTRIES;
};

export const markPendingOrderJournalEntry = async (
    orderId: string,
    updates: Partial<
        Pick<PendingOrderJournalEntry, 'syncState' | 'lastError' | 'updatedAt'>
    >,
    options?: { tenantId?: string }
) => {
    void orderId;
    void updates;
    void options;
    return EMPTY_ENTRIES;
};

export const reconcilePendingOrderJournal = async (options: {
    knownOrderIds: string[];
    outboxEmpty: boolean;
    tenantId?: string;
}) => {
    void options;
    return EMPTY_RECONCILE_RESULT;
};

export const clearPendingOrderJournal = async () => undefined;
