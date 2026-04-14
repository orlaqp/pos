import { DataStore } from '@pos/shared/amplify';
import {
    syncGlobalSettings,
    subscribeToGlobalSettingsChanges,
} from './data-store-sync';

const mockSubscribe = jest.fn();

jest.mock('@pos/shared/amplify', () => ({
    DataStore: {
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

        mockSubscribe.mockImplementation((callback: typeof observer) => {
            observer = callback as typeof observer;
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

    it('uses observeQuery for one-shot global settings sync', () => {
        const dispatch = jest.fn();
        const unsubscribe = jest.fn();

        mockSubscribe.mockImplementation(
            (callback: (value: { items: any[] }) => void) => {
                callback({
                    items: [
                        { id: 'settings-1', enforceSalesBasedOnInventory: true },
                    ],
                } as any);
                return { unsubscribe };
            }
        );

        syncGlobalSettings(dispatch);

        expect(DataStore.observeQuery).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'settings/setGlobalSettings',
            })
        );
        expect(unsubscribe).toHaveBeenCalledTimes(1);
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

        mockSubscribe.mockImplementation((callback: typeof observer) => {
            observer = callback as typeof observer;
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
