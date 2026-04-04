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
        let observer:
            | ((value: { isSynced: boolean; items: any[] }) => void)
            | undefined;

        mockSubscribe.mockImplementation((callback: typeof observer) => {
            observer = callback as typeof observer;
            return { unsubscribe: jest.fn() };
        });

        subscribeToGlobalSettingsChanges(dispatch);
        observer?.({
            isSynced: false,
            items: [{ id: 'settings-1', enforceSalesBasedOnInventory: true }],
        });

        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'settings/setGlobalSettings',
            })
        );
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
});
