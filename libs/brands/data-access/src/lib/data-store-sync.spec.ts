import { DataStore } from '@pos/shared/amplify';
import { syncBrands, subscribeToBrandChanges } from './data-store-sync';

const mockSubscribe = jest.fn();

jest.mock('@pos/shared/utils', () => ({
    sortListBy: jest.fn(),
}));

jest.mock('@pos/shared/amplify', () => ({
    DataStore: {
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

        mockSubscribe.mockImplementation((callback: typeof observer) => {
            observer = callback as typeof observer;
            return { unsubscribe: jest.fn() };
        });

        subscribeToBrandChanges(dispatch);
        observer?.({
            isSynced: false,
            items: [{ id: 'brand-1', name: 'House' }],
        });

        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'brands/setAll',
            })
        );
    });

    it('uses observeQuery for one-shot brand sync', () => {
        const dispatch = jest.fn();
        const unsubscribe = jest.fn();

        mockSubscribe.mockImplementation(
            (callback: (value: { items: any[] }) => void) => {
                callback({
                    items: [{ id: 'brand-1', name: 'House' }],
                } as any);
                return { unsubscribe };
            }
        );

        syncBrands(dispatch);

        expect(DataStore.observeQuery).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'brands/setAll',
            })
        );
        expect(unsubscribe).toHaveBeenCalledTimes(1);
    });
});
