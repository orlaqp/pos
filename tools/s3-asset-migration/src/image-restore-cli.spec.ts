import { parseImageRestoreArgs } from './image-restore-cli';

describe('parseImageRestoreArgs', () => {
  it('parses required arguments and defaults to dry-run mode', () => {
    expect(
      parseImageRestoreArgs([
        '--env',
        'prod',
        '--profile',
        'pos',
        '--manifest-path',
        '/tmp/manifest.json',
      ])
    ).toEqual({
      env: 'prod',
      profile: 'pos',
      manifestPath: '/tmp/manifest.json',
      tenantId: undefined,
      models: ['products', 'categories'],
      apply: false,
      dryRun: true,
    });
  });

  it('supports filtering by model and apply mode', () => {
    expect(
      parseImageRestoreArgs([
        '--env',
        'prod',
        '--profile',
        'pos',
        '--manifest-path',
        '/tmp/manifest.json',
        '--models',
        'products',
        '--tenant-id',
        'tenant-1',
        '--apply',
        'true',
      ])
    ).toEqual({
      env: 'prod',
      profile: 'pos',
      manifestPath: '/tmp/manifest.json',
      tenantId: 'tenant-1',
      models: ['products'],
      apply: true,
      dryRun: false,
    });
  });

  it('requires manifest path', () => {
    expect(() =>
      parseImageRestoreArgs(['--env', 'prod', '--profile', 'pos'])
    ).toThrow('Missing required arguments: --env --profile --manifest-path');
  });
});
