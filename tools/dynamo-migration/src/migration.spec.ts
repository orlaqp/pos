jest.mock('./amplify-env', () => ({
  resolveEnvironment: jest.fn(),
}));

jest.mock('./source-reader', () => ({
  DynamoSourceReader: jest.fn(),
}));

jest.mock('./target-writer', () => ({
  DynamoTargetWriter: jest.fn(),
}));

import { resolveEnvironment } from './amplify-env';
import { runMigration } from './migration';
import { DynamoSourceReader } from './source-reader';
import { DynamoTargetWriter } from './target-writer';
import type { MigrationOptions, ResolvedEnvironment } from './types';

const mockedResolveEnvironment = jest.mocked(resolveEnvironment);
const mockedSourceReader = jest.mocked(DynamoSourceReader);
const mockedTargetWriter = jest.mocked(DynamoTargetWriter);

const baseOptions: MigrationOptions = {
  sourceEnv: 'develop',
  targetEnv: 'ebtdev',
  sourceProfile: 'src',
  targetProfile: 'dst',
  tenantId: 'tenant-9',
  sourceTenantId: 'tenant-1',
  targetTenantId: 'tenant-9',
  dryRun: false,
  models: ['Store'],
  parallelModels: 1,
};

const sourceEnv: ResolvedEnvironment = {
  envName: 'develop',
  region: 'us-east-1',
  stackName: 'source-stack',
  profile: 'src',
  tables: {
    Store: {
      modelName: 'Store',
      logicalResourceId: 'Store',
      physicalTableName: 'Store-source',
    },
  },
};

const targetEnv: ResolvedEnvironment = {
  envName: 'ebtdev',
  region: 'us-east-1',
  stackName: 'target-stack',
  profile: 'dst',
  tables: {
    Store: {
      modelName: 'Store',
      logicalResourceId: 'Store',
      physicalTableName: 'Store-target',
    },
  },
};

describe('runMigration', () => {
  beforeEach(() => {
    mockedResolveEnvironment
      .mockResolvedValueOnce(sourceEnv)
      .mockResolvedValueOnce(targetEnv);
    mockedSourceReader.mockImplementation(
      () =>
        ({
          scanTable: jest.fn().mockResolvedValue([{ id: 'store-1', name: 'Main' }]),
        }) as never
    );
    mockedTargetWriter.mockImplementation(
      () =>
        ({
          writeItem: jest.fn().mockResolvedValue(undefined),
        }) as never
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('performs a one-way migration write', async () => {
    const writeItem = jest.fn().mockResolvedValue(undefined);
    mockedTargetWriter.mockImplementation(
      () =>
        ({
          writeItem,
        }) as never
    );

    const report = await runMigration(baseOptions, {
      sourceCf: {} as never,
      targetCf: {} as never,
      sourceDynamo: {} as never,
      targetDynamo: {} as never,
      logger: {
        info: jest.fn(),
        error: jest.fn(),
      },
    });

    expect(writeItem).toHaveBeenCalledWith(
      'Store-target',
      expect.objectContaining({
        id: 'store-1',
        tenantId: 'tenant-9',
      })
    );
    expect(report.models[0]).toEqual(
      expect.objectContaining({
        modelName: 'Store',
        scanned: 1,
        filtered: 1,
        transformed: 1,
        written: 1,
      })
    );
  });

  it('passes the source tenant id into source scans', async () => {
    const scanTable = jest.fn().mockResolvedValue([{ id: 'store-1', name: 'Main' }]);
    mockedSourceReader.mockImplementation(
      () =>
        ({
          scanTable,
        }) as never
    );

    await runMigration(baseOptions, {
      sourceCf: {} as never,
      targetCf: {} as never,
      sourceDynamo: {} as never,
      targetDynamo: {} as never,
      logger: {
        info: jest.fn(),
        error: jest.fn(),
      },
    });

    expect(scanTable).toHaveBeenCalledWith(
      'Store-source',
      'tenant-1',
      expect.any(Function)
    );
  });

  it('does not write during dry run', async () => {
    const writeItem = jest.fn().mockResolvedValue(undefined);
    mockedTargetWriter.mockImplementation(
      () =>
        ({
          writeItem,
        }) as never
    );

    const report = await runMigration(
      {
        ...baseOptions,
        dryRun: true,
      },
      {
        sourceCf: {} as never,
        targetCf: {} as never,
        sourceDynamo: {} as never,
        targetDynamo: {} as never,
        logger: {
          info: jest.fn(),
          error: jest.fn(),
        },
      }
    );

    expect(writeItem).not.toHaveBeenCalled();
    expect(report.models[0].written).toBe(0);
    expect(report.models[0].filtered).toBe(1);
    expect(report.models[0].transformed).toBe(1);
  });

  it('fails fast on authorization errors', async () => {
    const writeItem = jest
      .fn()
      .mockRejectedValue(
        new Error(
          'User: arn:aws:iam::123:user/test is not authorized to perform: dynamodb:PutItem'
        )
      );
    mockedTargetWriter.mockImplementation(
      () =>
        ({
          writeItem,
        }) as never
    );

    await expect(
      runMigration(baseOptions, {
        sourceCf: {} as never,
        targetCf: {} as never,
        sourceDynamo: {} as never,
        targetDynamo: {} as never,
        logger: {
          info: jest.fn(),
          error: jest.fn(),
        },
      })
    ).rejects.toThrow('Authorization failure while writing Store');
  });

  it('keeps only recent inventory counts and matching count lines', async () => {
    mockedResolveEnvironment
      .mockReset()
      .mockResolvedValueOnce({
        ...sourceEnv,
        tables: {
          InventoryCount: {
            modelName: 'InventoryCount',
            logicalResourceId: 'InventoryCount',
            physicalTableName: 'InventoryCount-source',
          },
          InventoryCountLine: {
            modelName: 'InventoryCountLine',
            logicalResourceId: 'InventoryCountLine',
            physicalTableName: 'InventoryCountLine-source',
          },
        },
      })
      .mockResolvedValueOnce({
        ...targetEnv,
        tables: {
          InventoryCount: {
            modelName: 'InventoryCount',
            logicalResourceId: 'InventoryCount',
            physicalTableName: 'InventoryCount-target',
          },
          InventoryCountLine: {
            modelName: 'InventoryCountLine',
            logicalResourceId: 'InventoryCountLine',
            physicalTableName: 'InventoryCountLine-target',
          },
        },
      });

    const scanTable = jest.fn().mockImplementation((tableName: string) => {
      if (tableName === 'InventoryCount-source') {
        return Promise.resolve([
          { id: 'old-count', createdAt: '2024-01-01T00:00:00.000Z' },
          { id: 'recent-count', createdAt: new Date().toISOString() },
        ]);
      }

      if (tableName === 'InventoryCountLine-source') {
        return Promise.resolve([
          {
            id: 'old-line',
            inventoryCountLineInventoryCountId: 'old-count',
          },
          {
            id: 'recent-line',
            inventoryCountLineInventoryCountId: 'recent-count',
          },
        ]);
      }

      return Promise.resolve([]);
    });

    const writeItem = jest.fn().mockResolvedValue(undefined);
    mockedSourceReader.mockImplementation(
      () =>
        ({
          scanTable,
        }) as never
    );
    mockedTargetWriter.mockImplementation(
      () =>
        ({
          writeItem,
        }) as never
    );

    const report = await runMigration(
      {
        ...baseOptions,
        models: ['InventoryCount', 'InventoryCountLine'],
        years: 1,
      },
      {
        sourceCf: {} as never,
        targetCf: {} as never,
        sourceDynamo: {} as never,
        targetDynamo: {} as never,
        logger: {
          info: jest.fn(),
          error: jest.fn(),
        },
      }
    );

    expect(writeItem).toHaveBeenCalledTimes(2);
    expect(writeItem).toHaveBeenNthCalledWith(
      1,
      'InventoryCount-target',
      expect.objectContaining({ id: 'recent-count', tenantId: 'tenant-9' })
    );
    expect(writeItem).toHaveBeenNthCalledWith(
      2,
      'InventoryCountLine-target',
      expect.objectContaining({ id: 'recent-line', tenantId: 'tenant-9' })
    );
    expect(report.models).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          modelName: 'InventoryCount',
          scanned: 2,
          filtered: 1,
          written: 1,
        }),
        expect.objectContaining({
          modelName: 'InventoryCountLine',
          scanned: 2,
          filtered: 1,
          written: 1,
        }),
      ])
    );
  });

  it('migrates full operational history when years is omitted', async () => {
    mockedResolveEnvironment
      .mockReset()
      .mockResolvedValueOnce({
        ...sourceEnv,
        tables: {
          Order: {
            modelName: 'Order',
            logicalResourceId: 'Order',
            physicalTableName: 'Order-source',
          },
        },
      })
      .mockResolvedValueOnce({
        ...targetEnv,
        tables: {
          Order: {
            modelName: 'Order',
            logicalResourceId: 'Order',
            physicalTableName: 'Order-target',
          },
        },
      });

    const writeItem = jest.fn().mockResolvedValue(undefined);
    mockedSourceReader.mockImplementation(
      () =>
        ({
          scanTable: jest.fn().mockResolvedValue([
            { id: 'old-order', createdAt: '2020-01-01T00:00:00.000Z' },
            { id: 'recent-order', createdAt: new Date().toISOString() },
          ]),
        }) as never
    );
    mockedTargetWriter.mockImplementation(
      () =>
        ({
          writeItem,
        }) as never
    );

    const report = await runMigration(
      {
        ...baseOptions,
        models: ['Order'],
      },
      {
        sourceCf: {} as never,
        targetCf: {} as never,
        sourceDynamo: {} as never,
        targetDynamo: {} as never,
        logger: {
          info: jest.fn(),
          error: jest.fn(),
        },
      }
    );

    expect(writeItem).toHaveBeenCalledTimes(2);
    expect(report.models[0]).toEqual(
      expect.objectContaining({
        modelName: 'Order',
        scanned: 2,
        filtered: 2,
        written: 2,
      })
    );
  });

  it('filters operational history by days when requested', async () => {
    mockedResolveEnvironment
      .mockReset()
      .mockResolvedValueOnce({
        ...sourceEnv,
        tables: {
          Order: {
            modelName: 'Order',
            logicalResourceId: 'Order',
            physicalTableName: 'Order-source',
          },
        },
      })
      .mockResolvedValueOnce({
        ...targetEnv,
        tables: {
          Order: {
            modelName: 'Order',
            logicalResourceId: 'Order',
            physicalTableName: 'Order-target',
          },
        },
      });

    const writeItem = jest.fn().mockResolvedValue(undefined);
    const now = Date.now();
    const withinOneDay = new Date(now - 6 * 60 * 60 * 1000).toISOString();
    const olderThanOneDay = new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString();
    mockedSourceReader.mockImplementation(
      () =>
        ({
          scanTable: jest.fn().mockResolvedValue([
            { id: 'older-order', createdAt: olderThanOneDay },
            { id: 'today-order', createdAt: withinOneDay },
          ]),
        }) as never
    );
    mockedTargetWriter.mockImplementation(
      () =>
        ({
          writeItem,
        }) as never
    );

    const report = await runMigration(
      {
        ...baseOptions,
        models: ['Order'],
        days: 1,
      },
      {
        sourceCf: {} as never,
        targetCf: {} as never,
        sourceDynamo: {} as never,
        targetDynamo: {} as never,
        logger: {
          info: jest.fn(),
          error: jest.fn(),
        },
      }
    );

    expect(writeItem).toHaveBeenCalledTimes(1);
    expect(writeItem).toHaveBeenCalledWith(
      'Order-target',
      expect.objectContaining({ id: 'today-order', tenantId: 'tenant-9' })
    );
    expect(report.models[0]).toEqual(
      expect.objectContaining({
        modelName: 'Order',
        scanned: 2,
        filtered: 1,
        written: 1,
      })
    );
  });
});
