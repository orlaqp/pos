import {
    subscribeToInventoryCountChanges,
    subscribeToInventoryCountLineChanges,
    subscribeToInventoryReceiveChanges,
    subscribeToInventoryReceiveLineChanges,
} from './data-store-sync';

const mockSubscribe = jest.fn();

jest.mock('@pos/shared/utils', () => ({
    logSyncDebug: jest.fn(),
    sortDescListBy: jest.fn(),
    startSyncMeasure: jest.fn(() => jest.fn()),
    trackSyncSubscription: jest.fn(() => jest.fn()),
}));

jest.mock('@pos/shared/amplify', () => ({
    getDataStoreLifecycleState: jest.fn(() => 'started'),
    DataStore: {
        query: jest.fn(),
        observeQuery: jest.fn(() => ({
            subscribe: mockSubscribe,
        })),
    },
}));

jest.mock('react-native', () => ({
    Alert: {
        alert: jest.fn(),
    },
}));

describe('inventory data-store sync', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSubscribe.mockReset();
    });

    it('hydrates inventory counts before sync completion', () => {
        const dispatch = jest.fn();
        let observer:
            | ((value: { isSynced: boolean; items: Array<{ id: string; createdAt: string }> }) => void)
            | undefined;

        mockSubscribe.mockImplementation((handlers: { next?: typeof observer }) => {
            observer = handlers.next;
            return { unsubscribe: jest.fn() };
        });

        subscribeToInventoryCountChanges(dispatch);
        observer?.({
            isSynced: false,
            items: [
                {
                    id: 'count-1',
                    comments: '',
                    status: 'IN_PROGRESS',
                    createdBy: { id: 'emp-1', name: 'Test User' },
                    createdAt: '2026-04-11T12:00:00.000Z',
                    updatedAt: '2026-04-11T12:00:00.000Z',
                },
            ],
        });

        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'inventoryCount/setAll',
            })
        );
    });

    it('hydrates inventory count lines before sync completion', () => {
        const dispatch = jest.fn();
        let observer:
            | ((value: { isSynced: boolean; items: Array<{ id: string; createdAt: string }> }) => void)
            | undefined;

        mockSubscribe.mockImplementation((handlers: { next?: typeof observer }) => {
            observer = handlers.next;
            return { unsubscribe: jest.fn() };
        });

        subscribeToInventoryCountLineChanges(dispatch);
        observer?.({
            isSynced: false,
            items: [
                {
                    id: 'count-line-1',
                    productId: 'product-1',
                    productName: 'Apple',
                    unitOfMeasure: 'EA',
                    current: 10,
                    newCount: 12,
                    comments: '',
                    inventoryCountLineInventoryCountId: 'count-1',
                    createdAt: '2026-04-11T12:00:00.000Z',
                    updatedAt: '2026-04-11T12:00:00.000Z',
                },
            ],
        });

        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'inventoryCount/setLines',
            })
        );
    });

    it('hydrates inventory receives before sync completion', () => {
        const dispatch = jest.fn();
        let observer:
            | ((value: { isSynced: boolean; items: Array<{ id: string; createdAt: string }> }) => void)
            | undefined;

        mockSubscribe.mockImplementation((handlers: { next?: typeof observer }) => {
            observer = handlers.next;
            return { unsubscribe: jest.fn() };
        });

        subscribeToInventoryReceiveChanges(dispatch);
        observer?.({
            isSynced: false,
            items: [
                {
                    id: 'receive-1',
                    comments: '',
                    status: 'IN_PROGRESS',
                    createdBy: { id: 'emp-1', name: 'Test User' },
                    createdAt: '2026-04-11T12:00:00.000Z',
                    updatedAt: '2026-04-11T12:00:00.000Z',
                },
            ],
        });

        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'inventoryReceive/setAll',
            })
        );
    });

    it('hydrates inventory receive lines before sync completion', () => {
        const dispatch = jest.fn();
        let observer:
            | ((value: { isSynced: boolean; items: Array<{ id: string; createdAt: string }> }) => void)
            | undefined;

        mockSubscribe.mockImplementation((handlers: { next?: typeof observer }) => {
            observer = handlers.next;
            return { unsubscribe: jest.fn() };
        });

        subscribeToInventoryReceiveLineChanges(dispatch);
        observer?.({
            isSynced: false,
            items: [
                {
                    id: 'receive-line-1',
                    productId: 'product-1',
                    productName: 'Apple',
                    unitOfMeasure: 'EA',
                    current: 9,
                    received: 5,
                    comments: '',
                    inventoryReceiveLineInventoryReceiveId: 'receive-1',
                    createdAt: '2026-04-11T12:00:00.000Z',
                    updatedAt: '2026-04-11T12:00:00.000Z',
                },
            ],
        });

        expect(dispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'inventoryReceive/setLines',
            })
        );
    });
});
