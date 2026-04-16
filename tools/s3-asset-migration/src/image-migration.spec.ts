jest.mock('./asset-storage-env', () => ({
  resolveStorageEnvironment: jest.fn(),
}));

import { resolveStorageEnvironment } from './asset-storage-env';
import {
  deriveProcessedPictureKey,
  isMigratedPictureKey,
  runImageMigration,
} from './image-migration';
import type {
  ImageMigrationDependencies,
  ImageMigrationOptions,
  ImageMigrationRuntime,
} from './image-types';

const mockedResolveStorageEnvironment = jest.mocked(resolveStorageEnvironment);

const baseOptions: ImageMigrationOptions = {
  env: 'prod',
  profile: 'pos',
  models: ['products', 'categories'],
  apply: false,
  dryRun: true,
};

describe('image key helpers', () => {
  it('derives deterministic bg-removed png keys', () => {
    expect(
      deriveProcessedPictureKey('tenant-1/products/demo.jpg')
    ).toBe('tenant-1/products/demo.bg-removed.png');
  });

  it('detects already migrated keys', () => {
    expect(isMigratedPictureKey('tenant-1/products/demo.bg-removed.png')).toBe(true);
    expect(isMigratedPictureKey('tenant-1/products/demo.jpg')).toBe(false);
  });
});

describe('runImageMigration', () => {
  beforeEach(() => {
    mockedResolveStorageEnvironment.mockResolvedValue({
      envName: 'prod',
      region: 'us-east-1',
      stackName: 'stack',
      profile: 'pos',
      storageStackName: 'storage-stack',
      bucketName: 'assets-bucket',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createRuntime = (): ImageMigrationRuntime => ({
    ensureDir: jest.fn().mockResolvedValue(undefined),
    writeFile: jest.fn().mockResolvedValue(undefined),
    readFile: jest.fn().mockResolvedValue(Buffer.from('processed')),
    statFile: jest.fn().mockResolvedValue({ size: 100 }),
    downloadObject: jest.fn().mockResolvedValue(Buffer.from('original')),
    uploadObject: jest.fn().mockResolvedValue(undefined),
    invokeWorker: jest.fn().mockResolvedValue({
      success: true,
      width: 100,
      height: 100,
      originalBytes: 8,
      processedBytes: 6,
    }),
  });

  const createDeps = (
    runtime: ImageMigrationRuntime
  ): Partial<ImageMigrationDependencies> => ({
    cf: {} as never,
    dynamo: {} as never,
    s3: {} as never,
    documentClient: {
      send: jest
        .fn()
        .mockResolvedValueOnce({
          Items: [
            {
              id: 'prod-1',
              tenantId: 'tenant-1',
              picture: 'tenant-1/products/demo.jpg',
              _version: 3,
            },
          ],
        })
        .mockResolvedValueOnce({
          Items: [
            {
              id: 'cat-1',
              tenantId: 'tenant-1',
              picture: 'tenant-1/categories/demo.jpg',
              _version: 4,
            },
          ],
        })
        .mockResolvedValue({
          Attributes: {},
        }),
    } as never,
    logger: {
      info: jest.fn(),
      error: jest.fn(),
    },
    resolvedTables: {
      Product: { physicalTableName: 'Product-prod' },
      Category: { physicalTableName: 'Category-prod' },
    },
    runtime,
  });

  it('processes records in dry-run mode without uploading or updating records', async () => {
    const runtime = createRuntime();
    const deps = createDeps(runtime);

    const report = await runImageMigration(
      {
        ...baseOptions,
        outputDir: '/tmp/image-bg-removal',
      },
      deps
    );

    expect(runtime.downloadObject).toHaveBeenCalledTimes(2);
    expect(runtime.invokeWorker).toHaveBeenCalledTimes(2);
    expect(runtime.uploadObject).not.toHaveBeenCalled();
    expect((deps.documentClient?.send as jest.Mock).mock.calls).toHaveLength(2);
    expect(report.entries.map((entry) => entry.status)).toEqual(['dry-run', 'dry-run']);
  });

  it('uploads derived pngs and updates only the record picture fields in apply mode', async () => {
    const runtime = createRuntime();
    const deps = createDeps(runtime);

    const report = await runImageMigration(
      {
        ...baseOptions,
        outputDir: '/tmp/image-bg-removal',
        apply: true,
        dryRun: false,
      },
      deps
    );

    expect(runtime.uploadObject).toHaveBeenNthCalledWith(
      1,
      'assets-bucket',
      'public/tenant-1/products/demo.bg-removed.png',
      expect.any(Buffer),
      'image/png'
    );
    expect(runtime.uploadObject).toHaveBeenNthCalledWith(
      2,
      'assets-bucket',
      'public/tenant-1/categories/demo.bg-removed.png',
      expect.any(Buffer),
      'image/png'
    );

    const updateCall = (deps.documentClient?.send as jest.Mock).mock.calls[2]?.[0];
    expect(updateCall.input.TableName).toBe('Product-prod');
    expect(updateCall.input.ExpressionAttributeValues[':picture']).toBe(
      'tenant-1/products/demo.bg-removed.png'
    );
    expect(report.counts.updated).toBe(2);
    expect(report.entries.every((entry) => entry.status === 'updated')).toBe(true);
  });
});
