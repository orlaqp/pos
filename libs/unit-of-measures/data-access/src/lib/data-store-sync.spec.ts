import { DataStore } from '@pos/shared/amplify';
import {
    syncUnitOfMeasures,
    subscribeToUnitOfMeasureChanges,
} from './data-store-sync';

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

describe('unit-of-measures data-store sync', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSubscribe.mockReset();
    });

    it('hydrates units from the first observeQuery emission even before sync completes', () => {
        const dispatch = jest.fn();
        let observer:
            | ((value: { isSynced: boolean; items: any[] }) => void)
            | undefined;

        mockSubscribe.mockImplementation((handlers: { next?: typeof observer }) => {
            observer = handlers.next;
            return { unsubscribe: jest.fn() };
        });

        const subscription = subscribeToUnitOfMeasureChanges(dispatch);
        observer?.({
            isSynced: false,
            items: [{ id: 'uom-1', name: 'Each' }],
        });

        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'unitOfMeasures/setAll',
            })
        );
        subscription.unsubscribe();
    });

    it('uses query for one-shot unit-of-measure sync', async () => {
        const dispatch = jest.fn();
        (DataStore.query as jest.Mock).mockResolvedValueOnce([
            { id: 'uom-1', name: 'Each' },
        ]);

        await syncUnitOfMeasures(dispatch);

        expect(DataStore.query).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'unitOfMeasures/setAll',
            })
        );
    });

    it('shares a single unit-of-measure subscription across callers and replays cached data', () => {
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

        const firstSub = subscribeToUnitOfMeasureChanges(firstDispatch);
        observer?.({
            isSynced: true,
            items: [{ id: 'uom-1', name: 'Each' }],
        });
        firstDispatch.mockClear();

        const secondSub = subscribeToUnitOfMeasureChanges(secondDispatch);

        expect(DataStore.observeQuery).toHaveBeenCalledTimes(1);
        expect(secondDispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'unitOfMeasures/setAll',
            })
        );

        firstSub.unsubscribe();
        expect(unsubscribe).not.toHaveBeenCalled();

        secondSub.unsubscribe();
        expect(unsubscribe).toHaveBeenCalledTimes(1);
    });
});
