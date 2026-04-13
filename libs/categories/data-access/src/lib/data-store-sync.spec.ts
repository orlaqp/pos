import { DataStore } from '@pos/shared/amplify';
import { syncCategories, subscribeToCategoryChanges } from './data-store-sync';

const mockSubscribe = jest.fn();

jest.mock('@pos/shared/utils', () => ({
    sortListBy: jest.fn(),
    logSyncDebug: jest.fn(),
    startSyncMeasure: jest.fn(() => jest.fn()),
    trackSyncSubscription: jest.fn(() => jest.fn()),
}));

jest.mock('@pos/shared/amplify', () => ({
    DataStore: {
        observeQuery: jest.fn(() => ({
            subscribe: mockSubscribe,
        })),
    },
}));

describe('categories data-store sync', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSubscribe.mockReset();
    });

    it('hydrates categories from the first observeQuery emission', () => {
        const dispatch = jest.fn();
        const unsubscribe = jest.fn();
        let observer:
            | ((value: { isSynced: boolean; items: any[] }) => void)
            | undefined;

        mockSubscribe.mockImplementation((callback: typeof observer) => {
            observer = callback as typeof observer;
            return { unsubscribe };
        });

        const subscription = subscribeToCategoryChanges(dispatch);
        observer?.({
            isSynced: false,
            items: [{ id: 'category-1', name: 'Produce' }],
        });

        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'categories/setAll',
            })
        );
        subscription.unsubscribe();
        expect(unsubscribe).toHaveBeenCalledTimes(1);
    });

    it('uses observeQuery for one-shot category sync', () => {
        const dispatch = jest.fn();
        const unsubscribe = jest.fn();

        mockSubscribe.mockImplementation(
            (callback: (value: { items: any[] }) => void) => {
                callback({
                    items: [{ id: 'category-1', name: 'Produce' }],
                } as any);
                return { unsubscribe };
            }
        );

        syncCategories(dispatch);

        expect(DataStore.observeQuery).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'categories/setAll',
            })
        );
        expect(unsubscribe).toHaveBeenCalledTimes(1);
    });

    it('shares a single live category subscription across callers', () => {
        const dispatch = jest.fn();
        const unsubscribe = jest.fn();

        mockSubscribe.mockImplementation(() => ({ unsubscribe }));

        const firstSub = subscribeToCategoryChanges(dispatch);
        const secondSub = subscribeToCategoryChanges(dispatch);

        expect(DataStore.observeQuery).toHaveBeenCalledTimes(1);

        firstSub.unsubscribe();
        expect(unsubscribe).not.toHaveBeenCalled();

        secondSub.unsubscribe();
        expect(unsubscribe).toHaveBeenCalledTimes(1);
    });
});
