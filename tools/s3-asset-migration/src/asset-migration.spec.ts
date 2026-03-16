jest.mock('./asset-storage-env', () => ({
  resolveStorageEnvironment: jest.fn(),
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
import { AssetSourceReader, AssetTargetWriter } from './asset-s3';
import { runAssetMigration } from './asset-migration';
import type { AssetMigrationOptions, StorageEnvironment } from './asset-types';

const mockedResolveStorageEnvironment = jest.mocked(resolveStorageEnvironment);
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

    const report = await runAssetMigration(baseOptions, {
      sourceCf: {} as never,
      targetCf: {} as never,
      sourceS3: {} as never,
      targetS3: {} as never,
      logger: {
        info: jest.fn(),
        error: jest.fn(),
      },
    });

    expect(copyObject).not.toHaveBeenCalled();
    expect(report.prefixes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          prefix: 'public/products/',
          listedObjects: 2,
          copiedObjects: 0,
        }),
        expect.objectContaining({
          prefix: 'public/categories/',
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

    const report = await runAssetMigration(
      { ...baseOptions, dryRun: false, apply: true },
      {
        sourceCf: {} as never,
        targetCf: {} as never,
        sourceS3: {} as never,
        targetS3: {} as never,
        logger: {
          info: jest.fn(),
          error: jest.fn(),
        },
      }
    );

    expect(copyObject).toHaveBeenCalledWith('public/products/a.jpg');
    expect(copyObject).toHaveBeenCalledWith('public/products/b.jpg');
    expect(copyObject).toHaveBeenCalledWith('public/categories/b.jpg');
    expect(report.prefixes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          prefix: 'public/products/',
          copiedObjects: 2,
          copiedBytes: 225,
        }),
        expect.objectContaining({
          prefix: 'public/categories/',
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

    const report = await runAssetMigration(
      { ...baseOptions, dryRun: false, apply: true, prefixes: ['public/products/'] },
      {
        sourceCf: {} as never,
        targetCf: {} as never,
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
});
