import { ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

import {
  deriveJpgPictureKey,
  isRollbackCandidatePictureKey,
  runImageRestoreJpg,
} from './image-restore-jpg';
import type {
  ImageRestoreJpgDependencies,
  ImageRestoreJpgOptions,
} from './image-types';

const baseOptions: ImageRestoreJpgOptions = {
  env: 'prod',
  profile: 'pos',
  models: ['products', 'categories'],
  apply: false,
  dryRun: true,
};

describe('image restore jpg helpers', () => {
  it('detects migrated keys', () => {
    expect(
      isRollbackCandidatePictureKey('tenant-1/products/demo.bg-removed.png')
    ).toBe(true);
    expect(isRollbackCandidatePictureKey('tenant-1/products/demo.jpg')).toBe(
      false
    );
  });

  it('derives jpg keys from migrated png keys', () => {
    expect(
      deriveJpgPictureKey('tenant-1/products/demo.bg-removed.png')
    ).toBe('tenant-1/products/demo.jpg');
  });

  it('rejects non-migrated keys', () => {
    expect(() => deriveJpgPictureKey('tenant-1/products/demo.png')).toThrow(
      'Picture key does not end with .bg-removed.png'
    );
  });
});

describe('runImageRestoreJpg', () => {
  const createDeps = (): Partial<ImageRestoreJpgDependencies> => ({
    cf: {} as never,
    dynamo: {} as never,
    documentClient: {
      send: jest.fn().mockImplementation(async (command) => {
        if (command instanceof ScanCommand) {
          if (command.input.TableName === 'Product-prod') {
            return {
              Items: [
                {
                  id: 'prod-1',
                  tenantId: 'tenant-1',
                  picture: 'tenant-1/products/demo.bg-removed.png',
                  _version: 3,
                },
              ],
            };
          }

          if (command.input.TableName === 'Category-prod') {
            return {
              Items: [
                {
                  id: 'cat-1',
                  tenantId: 'tenant-1',
                  picture: 'tenant-1/categories/demo.bg-removed.png',
                  _version: 4,
                },
              ],
            };
          }
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

  it('reports dry-run jpg rollback candidates without updating records', async () => {
    const deps = createDeps();

    const report = await runImageRestoreJpg(baseOptions, deps);

    expect(report.counts.discovered).toBe(2);
    expect(report.counts.eligible).toBe(2);
    expect(report.counts.updated).toBe(0);
    expect(report.entries.map((entry) => entry.status)).toEqual([
      'dry-run',
      'dry-run',
    ]);
    expect(report.entries[0]?.targetKey).toBe('tenant-1/products/demo.jpg');
    expect((deps.documentClient?.send as jest.Mock).mock.calls).toHaveLength(2);
  });

  it('updates picture keys to jpg in apply mode', async () => {
    const deps = createDeps();

    const report = await runImageRestoreJpg(
      {
        ...baseOptions,
        apply: true,
        dryRun: false,
      },
      deps
    );

    expect(report.counts.updated).toBe(2);
    expect(report.entries.every((entry) => entry.status === 'updated')).toBe(
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

  it('skips records that no longer look migrated', async () => {
    const deps = createDeps();
    (deps.documentClient?.send as jest.Mock).mockReset().mockImplementation(async (command) => {
      if (command instanceof ScanCommand) {
        if (command.input.TableName === 'Product-prod') {
          return {
            Items: [
              {
                id: 'prod-1',
                tenantId: 'tenant-1',
                picture: 'tenant-1/products/demo.jpg',
                _version: 3,
              },
            ],
          };
        }

        if (command.input.TableName === 'Category-prod') {
          return {
            Items: [
              {
                id: 'cat-1',
                tenantId: 'tenant-1',
                picture: 'tenant-1/categories/demo.bg-removed.png',
                _version: 4,
              },
            ],
          };
        }
      }

      if (command instanceof UpdateCommand) {
        return { Attributes: {} };
      }

      return {};
    });

    const report = await runImageRestoreJpg(
      {
        ...baseOptions,
        apply: true,
        dryRun: false,
      },
      deps
    );

    expect(report.counts.discovered).toBe(1);
    expect(report.counts.updated).toBe(1);
    expect(report.entries).toHaveLength(1);
  });
});
