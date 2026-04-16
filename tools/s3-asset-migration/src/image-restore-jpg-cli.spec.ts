import { parseImageRestoreJpgArgs } from './image-restore-jpg-cli';

describe('parseImageRestoreJpgArgs', () => {
  it('parses required arguments and defaults to dry-run', () => {
    expect(
      parseImageRestoreJpgArgs(['--env', 'prod', '--profile', 'pos'])
    ).toEqual({
      env: 'prod',
      profile: 'pos',
      tenantId: undefined,
      models: ['products', 'categories'],
      apply: false,
      dryRun: true,
    });
  });

  it('parses optional filters and apply mode', () => {
    expect(
      parseImageRestoreJpgArgs([
        '--env',
        'develop',
        '--profile',
        'pos',
        '--tenant-id',
        'tenant-1',
        '--models',
        'products',
        '--apply',
        'true',
      ])
    ).toEqual({
      env: 'develop',
      profile: 'pos',
      tenantId: 'tenant-1',
      models: ['products'],
      apply: true,
      dryRun: false,
    });
  });

  it('requires env and profile', () => {
    expect(() => parseImageRestoreJpgArgs(['--env', 'prod'])).toThrow(
      'Missing required arguments: --env --profile'
    );
  });
});
