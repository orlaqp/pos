import { API, DataStore } from '@pos/shared/amplify';
import {
    syncProducts,
    subscribeToProductChanges,
} from './data-store-sync';

const mockObserveSubscribe = jest.fn();
const mockRealtimeSubscribe = jest.fn();

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
        mockObserveSubscribe.mockReset();
        mockRealtimeSubscribe.mockReset();
    });

    it('hydrates from the first observeQuery emission even before sync completes', async () => {
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
            | ((value: { isSynced: boolean; items: any[] }) => void)
            | undefined;
        mockObserveSubscribe.mockImplementation((callback: typeof observer) => {
            observer = callback as typeof observer;
            return { unsubscribe: jest.fn() };
        });
        mockRealtimeSubscribe.mockReturnValue({ unsubscribe: jest.fn() });
        (API.graphql as jest.Mock).mockReturnValue({
            subscribe: mockRealtimeSubscribe,
        });

        subscribeToProductChanges(dispatch);
        observer?.({ isSynced: false, items: products });

        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'products/setAll',
            })
        );
    });

    it('uses observeQuery for one-shot product sync without DataStore.query', async () => {
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

    it('keeps the realtime patch subscription wired alongside observeQuery', () => {
        const dispatch = jest.fn();
        const unsubscribe = jest.fn();
        mockObserveSubscribe.mockReturnValue({ unsubscribe });
        mockRealtimeSubscribe.mockReturnValue({ unsubscribe: jest.fn() });
        (API.graphql as jest.Mock).mockReturnValue({
            subscribe: mockRealtimeSubscribe,
        });

        subscribeToProductChanges(dispatch);

        expect(API.graphql).toHaveBeenCalledTimes(1);
        expect(mockRealtimeSubscribe).toHaveBeenCalledTimes(1);
    });
});
