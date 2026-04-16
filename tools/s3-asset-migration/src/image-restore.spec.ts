jest.mock('./asset-s3', () => ({
  createDefaultLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
  })),
}));

import { promises as fs } from 'fs';
import { GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

import { runImageRestore } from './image-restore';
import type {
  ImageRestoreDependencies,
  ImageRestoreOptions,
} from './image-types';

const baseOptions: ImageRestoreOptions = {
  env: 'prod',
  profile: 'pos',
  manifestPath: '/tmp/manifest.json',
  models: ['products', 'categories'],
  apply: false,
  dryRun: true,
};

describe('runImageRestore', () => {
  beforeEach(() => {
    jest.spyOn(fs, 'readFile').mockResolvedValue(
      JSON.stringify({
        entries: [
          {
            model: 'products',
            recordId: 'prod-1',
            tenantId: 'tenant-1',
            originalKey: 'tenant-1/products/demo.jpg',
            newKey: 'tenant-1/products/demo.bg-removed.png',
            status: 'updated',
          },
          {
            model: 'categories',
            recordId: 'cat-1',
            tenantId: 'tenant-1',
            originalKey: 'tenant-1/categories/demo.jpg',
            newKey: 'tenant-1/categories/demo.bg-removed.png',
            status: 'updated',
          },
        ],
      }),
      'utf8' as never
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const createDeps = (): Partial<ImageRestoreDependencies> => ({
    cf: {} as never,
    dynamo: {} as never,
    documentClient: {
      send: jest.fn().mockImplementation(async (command) => {
        if (command instanceof GetCommand) {
          const recordId = command.input.Key?.id;
          if (recordId === 'prod-1') {
            return {
              Item: {
                id: 'prod-1',
                tenantId: 'tenant-1',
                picture: 'tenant-1/products/demo.bg-removed.png',
                _version: 3,
              },
            };
          }

          if (recordId === 'cat-1') {
            return {
              Item: {
                id: 'cat-1',
                tenantId: 'tenant-1',
                picture: 'tenant-1/categories/demo.bg-removed.png',
                _version: 4,
              },
            };
          }

          return {};
        }

        if (command instanceof UpdateCommand) {
          return { Attributes: {} };
        }

        return {};
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
  });

  it('reports dry-run restore candidates without updating records', async () => {
    const deps = createDeps();

    const report = await runImageRestore(baseOptions, deps);

    expect(report.counts.eligible).toBe(2);
    expect(report.counts.restored).toBe(0);
    expect(report.entries.map((entry) => entry.status)).toEqual([
      'dry-run',
      'dry-run',
    ]);
    expect((deps.documentClient?.send as jest.Mock).mock.calls).toHaveLength(2);
  });

  it('restores original picture keys in apply mode', async () => {
    const deps = createDeps();

    const report = await runImageRestore(
      {
        ...baseOptions,
        apply: true,
        dryRun: false,
      },
      deps
    );

    expect(report.counts.restored).toBe(2);
    expect(report.entries.every((entry) => entry.status === 'restored')).toBe(
      true
    );

    const updateCall = (deps.documentClient?.send as jest.Mock).mock.calls
      .map(([command]) => command)
      .find((command) => command instanceof UpdateCommand);
    expect(updateCall.input.TableName).toBe('Product-prod');
    expect(updateCall.input.ExpressionAttributeValues[':picture']).toBe(
      'tenant-1/products/demo.jpg'
    );
    expect(updateCall.input.ExpressionAttributeValues[':expectedPicture']).toBe(
      'tenant-1/products/demo.bg-removed.png'
    );
  });

  it('skips records whose current picture no longer matches the manifest new key', async () => {
    const deps = createDeps();
    (deps.documentClient?.send as jest.Mock)
      .mockReset()
      .mockImplementation(async (command) => {
        if (command instanceof GetCommand) {
          const recordId = command.input.Key?.id;
          if (recordId === 'prod-1') {
            return {
              Item: {
                id: 'prod-1',
                tenantId: 'tenant-1',
                picture: 'tenant-1/products/demo.jpg',
                _version: 3,
              },
            };
          }

          if (recordId === 'cat-1') {
            return {
              Item: {
                id: 'cat-1',
                tenantId: 'tenant-1',
                picture: 'tenant-1/categories/demo.bg-removed.png',
                _version: 4,
              },
            };
          }

          return {};
        }

        if (command instanceof UpdateCommand) {
          return { Attributes: {} };
        }

        return {};
      });

    const report = await runImageRestore(
      {
        ...baseOptions,
        apply: true,
        dryRun: false,
      },
      deps
    );

    expect(report.counts.skipped).toBe(1);
    expect(report.counts.restored).toBe(1);
    expect(report.entries[0]?.error).toBe(
      'Current picture does not match manifest newKey'
    );
  });
});
