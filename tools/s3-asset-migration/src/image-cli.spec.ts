import { parseImageArgs } from './image-cli';

describe('parseImageArgs', () => {
  it('parses required flags with dry-run defaults', () => {
    expect(
      parseImageArgs(['--env', 'prod', '--profile', 'pos'])
    ).toEqual(
      expect.objectContaining({
        env: 'prod',
        profile: 'pos',
        models: ['products', 'categories'],
        apply: false,
        dryRun: true,
      })
    );
  });

  it('parses optional flags', () => {
    expect(
      parseImageArgs([
        '--env',
        'prod',
        '--profile',
        'pos',
        '--tenant-id',
        'tenant-1',
        '--models',
        'categories',
        '--output-dir',
        '/tmp/images',
        '--limit',
        '5',
        '--apply',
      ])
    ).toEqual(
      expect.objectContaining({
        tenantId: 'tenant-1',
        models: ['categories'],
        outputDir: '/tmp/images',
        limit: 5,
        apply: true,
        dryRun: false,
      })
    );
  });

  it('rejects invalid model filters', () => {
    expect(() =>
      parseImageArgs([
        '--env',
        'prod',
        '--profile',
        'pos',
        '--models',
        'products,stores',
      ])
    ).toThrow('--models must be a comma-separated subset of: products, categories');
  });
});
