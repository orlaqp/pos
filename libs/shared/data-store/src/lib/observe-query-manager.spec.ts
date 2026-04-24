import { createSharedObserveQueryManager } from './observe-query-manager';

jest.mock('@pos/shared/utils', () => ({
    trackSyncSubscription: () => jest.fn(),
}));

let mockLifecycleState = 'stopped';

jest.mock('@pos/shared/amplify', () => ({
    getDataStoreLifecycleState: () => mockLifecycleState,
}));

describe('createSharedObserveQueryManager', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        mockLifecycleState = 'stopped';
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    it('defers subscription while DataStore is settling', () => {
        const dispatch = jest.fn();
        const observeQuery = jest.fn(() => ({
            subscribe: jest.fn(() => ({ unsubscribe: jest.fn() })),
        }));

        const manager = createSharedObserveQueryManager({
            model: 'inventoryCounts',
            trackKey: 'inventory.counts.observeQuery',
            observeQuery,
            mapSnapshot: (emission) => emission.items,
            publishSnapshot: jest.fn(),
        });

        mockLifecycleState = 'stopping';
        manager.subscribe(dispatch as never);

        expect(observeQuery).not.toHaveBeenCalled();

        mockLifecycleState = 'started';
        jest.advanceTimersByTime(1000);

        expect(observeQuery).toHaveBeenCalledTimes(1);
    });

    it('recovers from retryable observe setup errors', () => {
        const dispatch = jest.fn();
        const observeQuery = jest
            .fn()
            .mockImplementationOnce(() => ({
                subscribe: () => {
                    throw new Error(
                        'DataStoreStateError: Tried to execute `DataStore.observe()` while DataStore was "Stopping".'
                    );
                },
            }))
            .mockImplementation(() => ({
                subscribe: jest.fn(() => ({ unsubscribe: jest.fn() })),
            }));

        const manager = createSharedObserveQueryManager({
            model: 'inventoryCounts',
            trackKey: 'inventory.counts.observeQuery',
            observeQuery,
            mapSnapshot: (emission) => emission.items,
            publishSnapshot: jest.fn(),
        });

        manager.subscribe(dispatch as never);

        expect(observeQuery).toHaveBeenCalledTimes(1);

        jest.advanceTimersByTime(1000);

        expect(observeQuery).toHaveBeenCalledTimes(2);
    });
});
