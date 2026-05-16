import { DataStore } from '@pos/shared/amplify';
import {
    ensureOrderSyncHealthy,
    mergeSyncedOrders,
    subscribeToOrderChanges,
} from './data-store-sync';

jest.mock('react-native-localize', () => ({
    findBestLanguageTag: () => null,
}));

jest.mock('react-native-device-info', () => ({
    __esModule: true,
    default: {
        getUniqueIdSync: () => 'device-1',
    },
}));

const mockSubscribe = jest.fn();

jest.mock('@pos/shared/utils', () => ({
    sortByCreatedAt: jest.fn(),
    logSyncDebug: jest.fn(),
    startSyncMeasure: jest.fn(() => jest.fn()),
    trackSyncSubscription: jest.fn(() => jest.fn()),
}));

jest.mock('@pos/shared/amplify', () => ({
    DataStore: {
        query: jest.fn(),
        observeQuery: jest.fn(() => ({
            subscribe: mockSubscribe,
        })),
    },
}));

describe('orders data-store sync', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useRealTimers();
        mockSubscribe.mockReset();
    });

    it('merges open and recent closed orders without duplicates', () => {
        const openOrders = [
            { id: 'open-1', status: 'OPEN' },
            { id: 'shared-1', status: 'OPEN' },
        ] as any[];

        const recentClosedOrders = [
            { id: 'paid-1', status: 'PAID' },
            { id: 'shared-1', status: 'PAID' },
        ] as any[];

        expect(mergeSyncedOrders(openOrders, recentClosedOrders)).toEqual([
            { id: 'open-1', status: 'OPEN' },
            { id: 'shared-1', status: 'PAID' },
            { id: 'paid-1', status: 'PAID' },
        ]);
    });

    it('shares a single observeQuery across multiple subscribers', () => {
        const dispatch = jest.fn();
        const unsubscribe = jest.fn();

        mockSubscribe.mockImplementation(() => ({ unsubscribe }));

        const firstSub = subscribeToOrderChanges(dispatch);
        const secondSub = subscribeToOrderChanges(dispatch);

        expect(DataStore.observeQuery).toHaveBeenCalledTimes(1);

        firstSub.unsubscribe();
        expect(unsubscribe).not.toHaveBeenCalled();

        secondSub.unsubscribe();
        expect(unsubscribe).toHaveBeenCalledTimes(1);
    });

    it('does not restart shared order sync when no callers remain', async () => {
        const dispatch = jest.fn();

        await expect(ensureOrderSyncHealthy(dispatch)).resolves.toBe(false);
        expect(DataStore.observeQuery).not.toHaveBeenCalled();
    });

    it('recovers an order sync that previously received snapshots but has gone silent too long', async () => {
        jest.useFakeTimers();
        const dispatch = jest.fn();
        const unsubscribe = jest.fn();
        let observer:
            | {
                  next?: (value: { isSynced: boolean; items: any[] }) => void;
              }
            | undefined;

        mockSubscribe.mockImplementation((value: typeof observer) => {
            observer = value;
            return { unsubscribe };
        });

        const subscription = subscribeToOrderChanges(dispatch);
        observer?.next?.({
            isSynced: true,
            items: [{ id: 'open-1', status: 'OPEN' }] as any[],
        });

        jest.advanceTimersByTime(5 * 60_000 + 1);
        await ensureOrderSyncHealthy(dispatch, { tenantId: 'tenant-1' });
        jest.advanceTimersByTime(1_000);

        expect(DataStore.observeQuery).toHaveBeenCalledTimes(2);

        subscription.unsubscribe();
        jest.useRealTimers();
    });
});
