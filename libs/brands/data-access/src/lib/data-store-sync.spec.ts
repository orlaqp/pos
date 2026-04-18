import { DataStore } from '@pos/shared/amplify';
import { syncBrands, subscribeToBrandChanges } from './data-store-sync';

const mockSubscribe = jest.fn();

jest.mock('@pos/shared/utils', () => ({
    sortListBy: jest.fn(),
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

describe('brands data-store sync', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSubscribe.mockReset();
    });

    it('hydrates brands from the first observeQuery emission even before sync completes', () => {
        const dispatch = jest.fn();
        let observer:
            | ((value: { isSynced: boolean; items: any[] }) => void)
            | undefined;

        mockSubscribe.mockImplementation((handlers: { next?: typeof observer }) => {
            observer = handlers.next;
            return { unsubscribe: jest.fn() };
        });

        const subscription = subscribeToBrandChanges(dispatch);
        observer?.({
            isSynced: false,
            items: [{ id: 'brand-1', name: 'House' }],
        });

        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'brands/setAll',
            })
        );
        subscription.unsubscribe();
    });

    it('uses query for one-shot brand sync', async () => {
        const dispatch = jest.fn();
        (DataStore.query as jest.Mock).mockResolvedValueOnce([
            { id: 'brand-1', name: 'House' },
        ]);

        await syncBrands(dispatch);

        expect(DataStore.query).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'brands/setAll',
            })
        );
    });

    it('shares a single brand subscription across callers and replays cached data', () => {
        const firstDispatch = jest.fn();
        const secondDispatch = jest.fn();
        const unsubscribe = jest.fn();
        let observer:
            | ((value: { isSynced: boolean; items: any[] }) => void)
            | undefined;

        mockSubscribe.mockImplementation((handlers: { next?: typeof observer }) => {
            observer = handlers.next;
            return { unsubscribe };
        });

        const firstSub = subscribeToBrandChanges(firstDispatch);
        observer?.({
            isSynced: true,
            items: [{ id: 'brand-1', name: 'House' }],
        });
        firstDispatch.mockClear();

        const secondSub = subscribeToBrandChanges(secondDispatch);

        expect(DataStore.observeQuery).toHaveBeenCalledTimes(1);
        expect(secondDispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'brands/setAll',
            })
        );

        firstSub.unsubscribe();
        expect(unsubscribe).not.toHaveBeenCalled();

        secondSub.unsubscribe();
        expect(unsubscribe).toHaveBeenCalledTimes(1);
    });
});
