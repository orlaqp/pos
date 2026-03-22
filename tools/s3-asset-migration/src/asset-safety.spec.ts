import { assertAllowedAssetEnvironments, assertDistinctBuckets } from './asset-safety';
import type { AssetMigrationOptions, StorageEnvironment } from './asset-types';

const baseOptions: AssetMigrationOptions = {
  sourceEnv: 'develop',
  targetEnv: 'ebtdev',
  sourceProfile: 'src',
  targetProfile: 'dst',
  dryRun: true,
  apply: false,
  parallelObjects: 16,
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

describe('asset safety', () => {
  it('accepts prod as a valid target env', () => {
    expect(() =>
      assertAllowedAssetEnvironments({ ...baseOptions, targetEnv: 'prod' })
    ).not.toThrow();
  });

  it('rejects same env', () => {
    expect(() =>
      assertAllowedAssetEnvironments({ ...baseOptions, targetEnv: 'develop' })
    ).toThrow('Source and target environments must be different');
  });

  it('rejects target develop', () => {
    expect(() =>
      assertAllowedAssetEnvironments({ ...baseOptions, targetEnv: 'develop', sourceEnv: 'dev' })
    ).toThrow('Target environment cannot be develop');
  });

  it('rejects unsupported target env', () => {
    expect(() =>
      assertAllowedAssetEnvironments({ ...baseOptions, targetEnv: 'staging' })
    ).toThrow('Target environment must be one of: ebtdev, prod');
  });

  it('rejects shared bucket', () => {
    expect(() =>
      assertDistinctBuckets(sourceEnv, { ...targetEnv, bucketName: 'source-bucket' })
    ).toThrow('Source and target resolve to the same physical bucket');
  });
});
