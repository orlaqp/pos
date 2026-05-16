import { DataStore } from '@pos/shared/amplify';
import {
    ensureProductSyncHealthy,
    subscribeToProductChanges,
    syncProducts,
} from './data-store-sync';

const mockObserveSubscribe = jest.fn();

jest.mock('@pos/shared/utils', () => ({
    sortListBy: jest.fn(),
    logSyncDebug: jest.fn(),
    startSyncMeasure: jest.fn(() => jest.fn()),
    trackSyncSubscription: jest.fn(() => jest.fn()),
}));

jest.mock('@pos/shared/amplify', () => ({
    DataStore: {
        query: jest.fn(),
        observeQuery: jest.fn(() => ({
            subscribe: mockObserveSubscribe,
        })),
    },
}));

describe('products data-store sync', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useRealTimers();
        mockObserveSubscribe.mockReset();
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

        const subscription = subscribeToProductChanges(dispatch);
        observer?.next?.({ isSynced: false, items: products });

        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'products/setAll',
            })
        );
        subscription.unsubscribe();
    });

    it('uses query for one-shot product sync', async () => {
        const dispatch = jest.fn();
        const products = [
            {
                id: 'product-1',
                name: 'Apple',
                quantity: 10,
                updatedAt: '2026-04-03T10:00:00.000Z',
            },
        ] as any[];

        (DataStore.query as jest.Mock).mockResolvedValueOnce(products);

        await syncProducts(dispatch);

        expect(DataStore.query).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'products/setAll',
            })
        );
    });

    it('shares one observeQuery across callers and replays cached data', () => {
        const firstDispatch = jest.fn();
        const secondDispatch = jest.fn();
        const observeUnsubscribe = jest.fn();
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

        const firstSub = subscribeToProductChanges(firstDispatch, 'tenant-1');
        observeObserver?.next?.({ isSynced: true, items: products });
        firstDispatch.mockClear();

        const secondSub = subscribeToProductChanges(secondDispatch, 'tenant-1');

        expect(DataStore.observeQuery).toHaveBeenCalledTimes(1);
        expect(secondDispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'products/setAll',
            })
        );

        firstSub.unsubscribe();
        expect(observeUnsubscribe).not.toHaveBeenCalled();

        secondSub.unsubscribe();
        expect(observeUnsubscribe).toHaveBeenCalledTimes(1);
    });

    it('does not restart shared product sync when no callers remain', async () => {
        const dispatch = jest.fn();

        await expect(ensureProductSyncHealthy(dispatch)).resolves.toBe(false);
        expect(DataStore.observeQuery).not.toHaveBeenCalled();
    });

    it('recovers a product sync that previously received signals but has gone silent too long', async () => {
        jest.useFakeTimers();
        const dispatch = jest.fn();
        const observeUnsubscribe = jest.fn();
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

        const subscription = subscribeToProductChanges(dispatch, 'tenant-1');
        observeObserver?.next?.({ isSynced: true, items: products });

        jest.advanceTimersByTime(5 * 60_000 + 1);
        await ensureProductSyncHealthy(dispatch, { tenantId: 'tenant-1' });
        jest.advanceTimersByTime(1_000);

        expect(DataStore.observeQuery).toHaveBeenCalledTimes(2);

        subscription.unsubscribe();
        jest.useRealTimers();
    });
});
