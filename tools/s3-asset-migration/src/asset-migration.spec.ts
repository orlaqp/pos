jest.mock('./asset-storage-env', () => ({
  resolveStorageEnvironment: jest.fn(),
}));

jest.mock('../../dynamo-migration/src/amplify-env', () => ({
  resolveEnvironment: jest.fn(),
}));

jest.mock('./asset-s3', () => ({
  AssetSourceReader: jest.fn(),
  AssetTargetWriter: jest.fn(),
  createDefaultLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
  })),
}));

import { resolveStorageEnvironment } from './asset-storage-env';
import { resolveEnvironment } from '../../dynamo-migration/src/amplify-env';
import { AssetSourceReader, AssetTargetWriter } from './asset-s3';
import { runAssetMigration } from './asset-migration';
import type { AssetMigrationOptions, StorageEnvironment } from './asset-types';

const mockedResolveStorageEnvironment = jest.mocked(resolveStorageEnvironment);
const mockedResolveEnvironment = jest.mocked(resolveEnvironment);
const mockedAssetSourceReader = jest.mocked(AssetSourceReader);
const mockedAssetTargetWriter = jest.mocked(AssetTargetWriter);

const baseOptions: AssetMigrationOptions = {
  sourceEnv: 'develop',
  targetEnv: 'ebtdev',
  sourceProfile: 'src',
  targetProfile: 'dst',
  dryRun: true,
  apply: false,
  parallelObjects: 2,
  prefixes: ['public/products/', 'public/categories/'],
};

const sourceEnv: StorageEnvironment = {
  envName: 'develop',
  region: 'us-east-1',
  stackName: 'source-stack',
  profile: 'src',
  storageStackName: 'source-storage',
  bucketName: 'source-bucket',
};

const targetEnv: StorageEnvironment = {
  envName: 'ebtdev',
  region: 'us-east-1',
  stackName: 'target-stack',
  profile: 'dst',
  storageStackName: 'target-storage',
  bucketName: 'target-bucket',
};

describe('runAssetMigration', () => {
  beforeEach(() => {
    mockedResolveStorageEnvironment
      .mockResolvedValueOnce(sourceEnv)
      .mockResolvedValueOnce(targetEnv);
    mockedResolveEnvironment.mockResolvedValue({
      envName: 'develop',
      region: 'us-east-1',
      stackName: 'source-stack',
      profile: 'src',
      tables: {
        Product: {
          modelName: 'Product',
          logicalResourceId: 'Product',
          physicalTableName: 'Product-source',
        },
        Category: {
          modelName: 'Category',
          logicalResourceId: 'Category',
          physicalTableName: 'Category-source',
        },
      },
    } as never);
    mockedAssetSourceReader.mockImplementation(
      () =>
        ({
          listPrefix: jest.fn().mockImplementation((_bucketName, prefix) =>
            Promise.resolve(
              prefix === 'public/products/'
                ? [
                    { key: 'public/products/a.jpg', size: 100 },
                    { key: 'public/products/b.jpg', size: 125 },
                  ]
                : [{ key: 'public/categories/b.jpg', size: 200 }]
            )
          ),
          statObject: jest.fn().mockImplementation((_bucketName, key) =>
            Promise.resolve({ key, size: key.endsWith('a.jpg') ? 100 : 200 })
          ),
        }) as never
    );
    mockedAssetTargetWriter.mockImplementation(
      () =>
        ({
          copyObject: jest.fn().mockResolvedValue(undefined),
        }) as never
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('does not copy during dry run', async () => {
    const copyObject = jest.fn().mockResolvedValue(undefined);
    mockedAssetTargetWriter.mockImplementation(
      () =>
        ({
          copyObject,
        }) as never
    );

    const scanResponses = [
      {
        Items: [
          { id: 'prod-1', picture: 'products/a.jpg' },
          { id: 'prod-2', picture: 'products/b.jpg' },
        ],
      },
      {
        Items: [{ id: 'cat-1', picture: 'categories/b.jpg' }],
      },
    ];

    const report = await runAssetMigration(
      { ...baseOptions, targetTenantId: 'tenant-9' },
      {
      sourceCf: {} as never,
      targetCf: {} as never,
      sourceDynamo: {} as never,
      sourceDocumentClient: {
        send: jest.fn().mockImplementation(() => Promise.resolve(scanResponses.shift())),
      } as never,
      sourceS3: {} as never,
      targetS3: {} as never,
      logger: {
        info: jest.fn(),
        error: jest.fn(),
      },
      }
    );

    expect(copyObject).not.toHaveBeenCalled();
    expect(report.prefixes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          prefix: 'public/tenant-9/products/',
          listedObjects: 2,
          copiedObjects: 0,
        }),
        expect.objectContaining({
          prefix: 'public/tenant-9/categories/',
          listedObjects: 1,
          copiedObjects: 0,
        }),
      ])
    );
  });

  it('copies both prefixes during live run and preserves keys', async () => {
    const copyObject = jest.fn().mockResolvedValue(undefined);
    mockedAssetTargetWriter.mockImplementation(
      () =>
        ({
          copyObject,
        }) as never
    );

    const scanResponses = [
      {
        Items: [
          { id: 'prod-1', picture: 'products/a.jpg' },
          { id: 'prod-2', picture: 'products/b.jpg' },
        ],
      },
      {
        Items: [{ id: 'cat-1', picture: 'categories/b.jpg' }],
      },
    ];

    const report = await runAssetMigration(
      { ...baseOptions, dryRun: false, apply: true, targetTenantId: 'tenant-9' },
      {
        sourceCf: {} as never,
        targetCf: {} as never,
        sourceDynamo: {} as never,
        sourceDocumentClient: {
          send: jest.fn().mockImplementation(() => Promise.resolve(scanResponses.shift())),
        } as never,
        sourceS3: {} as never,
        targetS3: {} as never,
        logger: {
          info: jest.fn(),
          error: jest.fn(),
        },
      }
    );

    expect(copyObject).toHaveBeenCalledWith(
      'public/products/a.jpg',
      'public/tenant-9/products/a.jpg'
    );
    expect(copyObject).toHaveBeenCalledWith(
      'public/products/b.jpg',
      'public/tenant-9/products/b.jpg'
    );
    expect(copyObject).toHaveBeenCalledWith(
      'public/categories/b.jpg',
      'public/tenant-9/categories/b.jpg'
    );
    expect(report.prefixes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          prefix: 'public/tenant-9/products/',
          copiedObjects: 2,
          copiedBytes: 300,
        }),
        expect.objectContaining({
          prefix: 'public/tenant-9/categories/',
          copiedObjects: 1,
          copiedBytes: 200,
        }),
      ])
    );
  });

  it('records copy failures and reports them', async () => {
    const copyObject = jest.fn().mockResolvedValueOnce(undefined).mockRejectedValueOnce(
      new Error('copy failed')
    );
    mockedAssetTargetWriter.mockImplementation(
      () =>
        ({
          copyObject,
        }) as never
    );

    const scanResponses = [
      {
        Items: [
          { id: 'prod-1', picture: 'products/a.jpg' },
          { id: 'prod-2', picture: 'products/b.jpg' },
        ],
      },
      {
        Items: [{ id: 'cat-1', picture: 'categories/b.jpg' }],
      },
    ];

    const report = await runAssetMigration(
      {
        ...baseOptions,
        dryRun: false,
        apply: true,
        prefixes: ['public/products/'],
        targetTenantId: 'tenant-9',
      },
      {
        sourceCf: {} as never,
        targetCf: {} as never,
        sourceDynamo: {} as never,
        sourceDocumentClient: {
          send: jest.fn().mockImplementation(() => Promise.resolve(scanResponses.shift())),
        } as never,
        sourceS3: {} as never,
        targetS3: {} as never,
        logger: {
          info: jest.fn(),
          error: jest.fn(),
        },
      }
    ).catch((error) => {
      expect(error.message).toContain('Asset migration completed with');
      return null;
    });

    expect(copyObject).toHaveBeenCalled();
    expect(report).toBeNull();
  });

  it('copies only tenant-referenced keys when tenant id is provided', async () => {
    const copyObject = jest.fn().mockResolvedValue(undefined);
    mockedAssetTargetWriter.mockImplementation(
      () =>
        ({
          copyObject,
        }) as never
    );

    const scanResponses = [
      {
        Items: [
          { id: 'prod-1', tenantId: 'tenant-1', picture: 'products/a.jpg' },
          { id: 'prod-2', tenantId: 'tenant-1', picture: 'products/a.jpg' },
        ],
      },
      {
        Items: [{ id: 'cat-1', tenantId: 'tenant-1', picture: 'public/categories/b.jpg' }],
      },
    ];

    const report = await runAssetMigration(
      {
        ...baseOptions,
        dryRun: false,
        apply: true,
        sourceTenantId: 'tenant-1',
        targetTenantId: 'tenant-9',
      },
      {
        sourceCf: {} as never,
        targetCf: {} as never,
        sourceDynamo: {} as never,
        sourceDocumentClient: {
          send: jest.fn().mockImplementation(() => Promise.resolve(scanResponses.shift())),
        } as never,
        sourceS3: {} as never,
        targetS3: {} as never,
        logger: {
          info: jest.fn(),
          error: jest.fn(),
        },
      }
    );

    expect(copyObject).toHaveBeenCalledTimes(2);
    expect(copyObject).toHaveBeenCalledWith(
      'public/products/a.jpg',
      'public/tenant-9/products/a.jpg'
    );
    expect(copyObject).toHaveBeenCalledWith(
      'public/categories/b.jpg',
      'public/tenant-9/categories/b.jpg'
    );
    expect(report.prefixes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          prefix: 'public/tenant-9/products/',
          listedObjects: 1,
          copiedObjects: 1,
        }),
        expect.objectContaining({
          prefix: 'public/tenant-9/categories/',
          listedObjects: 1,
          copiedObjects: 1,
        }),
      ])
    );
  });

  it('can ignore missing source assets and complete the run', async () => {
    const copyObject = jest.fn().mockResolvedValue(undefined);
    mockedAssetTargetWriter.mockImplementation(
      () =>
        ({
          copyObject,
        }) as never
    );
    mockedAssetSourceReader.mockImplementation(
      () =>
        ({
          listPrefix: jest.fn(),
          statObject: jest.fn().mockImplementation((_bucketName, key) => {
            if (key === 'public/products/missing.jpg') {
              return Promise.reject(new Error('Not Found'));
            }

            return Promise.resolve({ key, size: 100 });
          }),
        }) as never
    );

    const logger = {
      info: jest.fn(),
      error: jest.fn(),
    };

    const scanResponses = [
      {
        Items: [
          { id: 'prod-1', picture: 'products/a.jpg' },
          { id: 'prod-2', picture: 'products/missing.jpg' },
        ],
      },
      {
        Items: [],
      },
    ];

    const report = await runAssetMigration(
      {
        ...baseOptions,
        dryRun: false,
        apply: true,
        targetTenantId: 'tenant-9',
        ignoreMissingSourceAssets: true,
      },
      {
        sourceCf: {} as never,
        targetCf: {} as never,
        sourceDynamo: {} as never,
        sourceDocumentClient: {
          send: jest.fn().mockImplementation(() => Promise.resolve(scanResponses.shift())),
        } as never,
        sourceS3: {} as never,
        targetS3: {} as never,
        logger,
      }
    );

    expect(copyObject).toHaveBeenCalledTimes(1);
    expect(copyObject).toHaveBeenCalledWith(
      'public/products/a.jpg',
      'public/tenant-9/products/a.jpg'
    );
    expect(report.failures).toEqual([
      expect.objectContaining({
        key: 'public/products/missing.jpg',
      }),
    ]);
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining('[ignored-missing-source-asset]')
    );
  });
});
