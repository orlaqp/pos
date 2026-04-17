import { parseAssetArgs } from './asset-cli';

describe('parseAssetArgs', () => {
  it('normalizes custom prefixes and preserves multiple values', () => {
    expect(
      parseAssetArgs([
        '--source-env',
        'develop',
        '--target-env',
        'prod',
        '--source-profile',
        'src',
        '--target-profile',
        'dst',
        '--target-tenant-id',
        'tenant-9',
        '--apply',
        '--prefixes',
        'public/products,protected/store-assets/',
      ])
    ).toEqual(
      expect.objectContaining({
        targetTenantId: 'tenant-9',
        prefixes: ['public/products/', 'protected/store-assets/'],
      })
    );
  });

  it('rejects an empty prefixes flag', () => {
    expect(() =>
      parseAssetArgs([
        '--source-env',
        'develop',
        '--target-env',
        'prod',
        '--source-profile',
        'src',
        '--target-profile',
        'dst',
        '--prefixes',
        '   ',
      ])
    ).toThrow('--prefixes must include at least one prefix');
  });

  it('parses ignore-missing-source-assets', () => {
    expect(
      parseAssetArgs([
        '--source-env',
        'develop',
        '--target-env',
        'prod',
        '--source-profile',
        'src',
        '--target-profile',
        'dst',
        '--ignore-missing-source-assets',
      ])
    ).toEqual(
      expect.objectContaining({
        ignoreMissingSourceAssets: true,
      })
    );
  });

  it('accepts prod to uat with separate tenant ids', () => {
    expect(
      parseAssetArgs([
        '--source-env',
        'prod',
        '--target-env',
        'uat',
        '--source-profile',
        'src',
        '--target-profile',
        'dst',
        '--source-tenant-id',
        'tenant-source',
        '--target-tenant-id',
        'tenant-target',
        '--apply',
      ])
    ).toEqual(
      expect.objectContaining({
        sourceEnv: 'prod',
        targetEnv: 'uat',
        sourceTenantId: 'tenant-source',
        targetTenantId: 'tenant-target',
        apply: true,
        dryRun: false,
      })
    );
  });
});
