/* eslint-disable @typescript-eslint/no-var-requires */
const mockConfigure = jest.fn();
const mockStop = jest.fn(() => Promise.resolve());
const mockStart = jest.fn(() => Promise.resolve());
const mockSyncExpression = jest.fn((model: unknown, builder: unknown) => ({
    model,
    builder,
}));

jest.mock('@pos/shared/amplify', () => ({
    DataStore: {
        configure: (...args: unknown[]) => mockConfigure(...args),
        stop: (...args: unknown[]) => mockStop(...args),
        start: (...args: unknown[]) => mockStart(...args),
    },
    syncExpression: (...args: unknown[]) => mockSyncExpression(...args),
}));

jest.mock('@pos/auth/data-access', () => ({
    getCurrentTenantId: jest.fn(() => 'tenant-123'),
}));

const mockSubtract = jest.fn(() => ({
    toISOString: () => '2026-01-01T00:00:00.000Z',
}));
const mockAdd = jest.fn(() => ({
    toISOString: () => '2026-04-01T00:00:00.000Z',
}));

jest.mock('moment', () => {
    return () => ({
        subtract: mockSubtract,
        add: mockAdd,
    });
});

const models = require('@pos/shared/models');
const {
    configureDataStore,
    enableInventorySync,
    resetInventorySyncForTests,
} = require('./config');

describe('configureDataStore', () => {
    const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
    const consoleWarnSpy = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => undefined);

    beforeEach(() => {
        jest.clearAllMocks();
        resetInventorySyncForTests();
    });

    afterAll(() => {
        consoleErrorSpy.mockRestore();
        consoleWarnSpy.mockRestore();
    });

    it('configures only date-window sync expressions for operational models', () => {
        configureDataStore();

        expect(mockConfigure).toHaveBeenCalledTimes(1);
        const options = mockConfigure.mock.calls[0][0];

        expect(typeof options.conflictHandler).toBe('function');
        expect(options.syncExpressions).toHaveLength(5);
        expect(mockSyncExpression.mock.calls.map(([model]: [unknown]) => model)).toEqual([
            models.InventoryCount,
            models.InventoryCountLine,
            models.InventoryReceive,
            models.InventoryReceiveLine,
            models.Order,
        ]);
        expect(mockAdd).toHaveBeenCalledTimes(1);
        expect(mockAdd).toHaveBeenCalledWith(1, 'day');
        expect(mockSubtract).toHaveBeenCalledTimes(1);
        expect(mockSubtract).toHaveBeenNthCalledWith(1, 3, 'days');
    });

    it('rehydrates tenantId during conflict resolution when local model is missing it', async () => {
        configureDataStore();

        const options = mockConfigure.mock.calls[0][0];
        class MockProduct {
            tenantId?: string;
            _version?: number;
            constructor(init: Record<string, unknown>) {
                Object.assign(this, init);
            }
        }

        const resolved = await options.conflictHandler({
            modelConstructor: MockProduct,
            localModel: { id: 'prod-1', name: 'Test Product' },
            remoteModel: { id: 'prod-1', tenantId: 'tenant-remote', _version: 11 },
        });

        expect(resolved).toBeInstanceOf(MockProduct);
        expect(resolved).toMatchObject({
            id: 'prod-1',
            name: 'Test Product',
            tenantId: 'tenant-remote',
            _version: 11,
        });
    });

    it('reconfigures and restarts DataStore when inventory sync is enabled on demand', async () => {
        await enableInventorySync();

        expect(mockStop).toHaveBeenCalledTimes(1);
        expect(mockStart).toHaveBeenCalledTimes(1);
        expect(mockConfigure).toHaveBeenCalledTimes(1);
        expect(mockSubtract).toHaveBeenCalledWith(15, 'days');
        expect(mockSubtract).toHaveBeenCalledWith(3, 'days');
    });

    it('downgrades conditional sync conflicts to warnings to avoid redboxes', () => {
        configureDataStore();

        const options = mockConfigure.mock.calls[0][0];
        options.errorHandler({
            message: 'The conditional request failed',
            operation: 'Update',
            model: 'Product',
        });

        expect(consoleWarnSpy).toHaveBeenCalledWith(
            'DataStore sync conflict',
            expect.stringContaining('The conditional request failed')
        );
        expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('still reports non-conflict sync failures as errors', () => {
        configureDataStore();

        const options = mockConfigure.mock.calls[0][0];
        options.errorHandler({
            message: 'Network error',
            operation: 'Sync',
            model: 'Order',
        });

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'DataStore sync error',
            expect.stringContaining('Network error')
        );
    });
});
