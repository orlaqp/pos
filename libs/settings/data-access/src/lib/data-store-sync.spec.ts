import { DataStore } from '@pos/shared/amplify';
import {
    syncGlobalSettings,
    subscribeToGlobalSettingsChanges,
} from './data-store-sync';

const mockSubscribe = jest.fn();

jest.mock('@pos/shared/utils', () => ({
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

describe('settings data-store sync', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSubscribe.mockReset();
    });

    it('hydrates global settings from the first observeQuery emission even before sync completes', () => {
        const dispatch = jest.fn();
        const unsubscribe = jest.fn();
        let observer:
            | ((value: { isSynced: boolean; items: any[] }) => void)
            | undefined;

        mockSubscribe.mockImplementation((handlers: { next?: typeof observer }) => {
            observer = handlers.next;
            return { unsubscribe };
        });

        const subscription = subscribeToGlobalSettingsChanges(dispatch);
        observer?.({
            isSynced: false,
            items: [{ id: 'settings-1', enforceSalesBasedOnInventory: true }],
        });

        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'settings/setGlobalSettings',
            })
        );
        subscription.unsubscribe();
        expect(unsubscribe).toHaveBeenCalledTimes(1);
    });

    it('uses query for one-shot global settings sync', async () => {
        const dispatch = jest.fn();
        (DataStore.query as jest.Mock).mockResolvedValueOnce([
            { id: 'settings-1', enforceSalesBasedOnInventory: true },
        ]);

        await syncGlobalSettings(dispatch);

        expect(DataStore.query).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'settings/setGlobalSettings',
            })
        );
    });

    it('shares a single live global settings subscription across callers', () => {
        const dispatch = jest.fn();
        const unsubscribe = jest.fn();

        mockSubscribe.mockImplementation(() => ({ unsubscribe }));

        const firstSub = subscribeToGlobalSettingsChanges(dispatch);
        const secondSub = subscribeToGlobalSettingsChanges(dispatch);

        expect(DataStore.observeQuery).toHaveBeenCalledTimes(1);

        firstSub.unsubscribe();
        expect(unsubscribe).not.toHaveBeenCalled();

        secondSub.unsubscribe();
        expect(unsubscribe).toHaveBeenCalledTimes(1);
    });

    it('filters deleted global settings tombstones from sync updates', () => {
        const dispatch = jest.fn();
        const unsubscribe = jest.fn();
        let observer:
            | ((value: { isSynced: boolean; items: any[] }) => void)
            | undefined;

        mockSubscribe.mockImplementation((handlers: { next?: typeof observer }) => {
            observer = handlers.next;
            return { unsubscribe };
        });

        const subscription = subscribeToGlobalSettingsChanges(dispatch);
        observer?.({
            isSynced: true,
            items: [
                { id: 'deleted-settings', enforceSalesBasedOnInventory: false, _deleted: true },
                { id: 'live-settings', enforceSalesBasedOnInventory: true, _deleted: false },
            ],
        });

        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'settings/setGlobalSettings',
                payload: expect.objectContaining({ enforceSalesBasedOnInventory: true }),
            })
        );

        subscription.unsubscribe();
        expect(unsubscribe).toHaveBeenCalledTimes(1);
    });
});
