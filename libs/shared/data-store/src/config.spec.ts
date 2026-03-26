/* eslint-disable @typescript-eslint/no-var-requires */
const mockConfigure = jest.fn();
const mockSyncExpression = jest.fn((model: unknown, builder: unknown) => ({
    model,
    builder,
}));

jest.mock('@pos/shared/amplify', () => ({
    DataStore: {
        configure: (...args: unknown[]) => mockConfigure(...args),
    },
    syncExpression: (...args: unknown[]) => mockSyncExpression(...args),
}));

jest.mock('@pos/auth/data-access', () => ({
    getCurrentTenantId: jest.fn(() => 'tenant-123'),
}));

jest.mock('moment', () => {
    const subtract = jest.fn(() => ({
        toISOString: () => '2026-01-01T00:00:00.000Z',
    }));

    return () => ({
        subtract,
    });
});

const models = require('@pos/shared/models');
const { configureDataStore } = require('./config');

describe('configureDataStore', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('configures only date-window sync expressions for operational models', () => {
        configureDataStore();

        expect(mockConfigure).toHaveBeenCalledTimes(1);
        const options = mockConfigure.mock.calls[0][0];

        expect(options.syncExpressions).toHaveLength(5);
        expect(mockSyncExpression.mock.calls.map(([model]: [unknown]) => model)).toEqual([
            models.InventoryCount,
            models.InventoryCountLine,
            models.InventoryReceive,
            models.InventoryReceiveLine,
            models.Order,
        ]);
    });
});
