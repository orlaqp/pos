import { API, DataStore } from '@pos/shared/amplify';
import {
    ensureProductSyncHealthy,
    subscribeToProductChanges,
    syncProducts,
} from './data-store-sync';

const mockObserveSubscribe = jest.fn();
const mockRealtimeSubscribe = jest.fn();

jest.mock('@pos/shared/utils', () => ({
    sortListBy: jest.fn(),
    logSyncDebug: jest.fn(),
    startSyncMeasure: jest.fn(() => jest.fn()),
    trackSyncSubscription: jest.fn(() => jest.fn()),
}));

jest.mock('@pos/shared/amplify', () => ({
    DataStore: {
        observeQuery: jest.fn(() => ({
            subscribe: mockObserveSubscribe,
        })),
    },
    API: {
        graphql: jest.fn(() => ({
            subscribe: mockRealtimeSubscribe,
        })),
    },
}));

jest.mock('@pos/auth/data-access', () => ({
    getCurrentTenantId: jest.fn(() => 'tenant-1'),
}));

describe('products data-store sync', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useRealTimers();
        mockObserveSubscribe.mockReset();
        mockRealtimeSubscribe.mockReset();
    });

    it('hydrates from the first observeQuery emission even before sync completes', () => {
        const dispatch = jest.fn();
        const products = [
            {
                id: 'product-1',
                name: 'Apple',
                quantity: 10,
                updatedAt: '2026-04-03T10:00:00.000Z',
            },
        ] as any[];

        let observer:
            | {
                  next?: (value: { isSynced: boolean; items: any[] }) => void;
              }
            | undefined;
        mockObserveSubscribe.mockImplementation((value: typeof observer) => {
            observer = value;
            return { unsubscribe: jest.fn() };
        });
        mockRealtimeSubscribe.mockReturnValue({ unsubscribe: jest.fn() });

        const subscription = subscribeToProductChanges(dispatch);
        observer?.next?.({ isSynced: false, items: products });

        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'products/setAll',
            })
        );
        subscription.unsubscribe();
    });

    it('uses observeQuery for one-shot product sync without DataStore.query', () => {
        const dispatch = jest.fn();
        const unsubscribe = jest.fn();
        const products = [
            {
                id: 'product-1',
                name: 'Apple',
                quantity: 10,
                updatedAt: '2026-04-03T10:00:00.000Z',
            },
        ] as any[];

        mockObserveSubscribe.mockImplementation(
            (callback: (value: { items: any[] }) => void) => {
                callback({ items: products } as any);
                return { unsubscribe };
            }
        );

        syncProducts(dispatch);

        expect(DataStore.observeQuery).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'products/setAll',
            })
        );
        expect(unsubscribe).toHaveBeenCalledTimes(1);
    });

    it('shares one observeQuery and one realtime subscription across callers and replays cached data', () => {
        const firstDispatch = jest.fn();
        const secondDispatch = jest.fn();
        const observeUnsubscribe = jest.fn();
        const realtimeUnsubscribe = jest.fn();
        const products = [
            {
                id: 'product-1',
                name: 'Apple',
                quantity: 10,
                updatedAt: '2026-04-03T10:00:00.000Z',
            },
        ] as any[];

        let observeObserver:
            | {
                  next?: (value: { isSynced: boolean; items: any[] }) => void;
              }
            | undefined;

        mockObserveSubscribe.mockImplementation((value: typeof observeObserver) => {
            observeObserver = value;
            return { unsubscribe: observeUnsubscribe };
        });
        mockRealtimeSubscribe.mockReturnValue({ unsubscribe: realtimeUnsubscribe });

        const firstSub = subscribeToProductChanges(firstDispatch);
        observeObserver?.next?.({ isSynced: true, items: products });
        firstDispatch.mockClear();

        const secondSub = subscribeToProductChanges(secondDispatch);

        expect(DataStore.observeQuery).toHaveBeenCalledTimes(1);
        expect(API.graphql).toHaveBeenCalledTimes(1);
        expect(mockRealtimeSubscribe).toHaveBeenCalledTimes(1);
        expect(secondDispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'products/setAll',
            })
        );

        firstSub.unsubscribe();
        expect(observeUnsubscribe).not.toHaveBeenCalled();
        expect(realtimeUnsubscribe).not.toHaveBeenCalled();

        secondSub.unsubscribe();
        expect(observeUnsubscribe).toHaveBeenCalledTimes(1);
        expect(realtimeUnsubscribe).toHaveBeenCalledTimes(1);
    });

    it('does not restart shared product sync when no callers remain', async () => {
        const dispatch = jest.fn();

        await expect(ensureProductSyncHealthy(dispatch)).resolves.toBe(false);
        expect(DataStore.observeQuery).not.toHaveBeenCalled();
        expect(API.graphql).not.toHaveBeenCalled();
    });
});
