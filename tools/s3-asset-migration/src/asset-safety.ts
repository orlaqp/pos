import { SOURCE_ENV, TARGET_ENVS, type AssetMigrationOptions, type StorageEnvironment } from './asset-types';

export const assertAllowedAssetEnvironments = (options: AssetMigrationOptions) => {
  if (options.sourceEnv === options.targetEnv) {
    throw new Error('Source and target environments must be different');
  }

  if (options.targetEnv === SOURCE_ENV) {
    throw new Error('Target environment cannot be develop');
  }

  if (options.sourceEnv !== SOURCE_ENV) {
    throw new Error(`Source environment must be "${SOURCE_ENV}"`);
  }

  if (!TARGET_ENVS.includes(options.targetEnv as (typeof TARGET_ENVS)[number])) {
    throw new Error(`Target environment must be one of: ${TARGET_ENVS.join(', ')}`);
  }
};

export const assertDistinctBuckets = (
  source: StorageEnvironment,
  target: StorageEnvironment
) => {
  if (source.bucketName === target.bucketName) {
    throw new Error(
      `Source and target resolve to the same physical bucket "${source.bucketName}"`
    );
  }
};

export const assertWriteTargetBucket = (
  bucketName: string,
  source: StorageEnvironment,
  target: StorageEnvironment
) => {
  if (bucketName === source.bucketName) {
    throw new Error(`Refusing to write to source bucket "${bucketName}"`);
  }

  if (bucketName !== target.bucketName) {
    throw new Error(`Refusing to write to non-target bucket "${bucketName}"`);
  }
};
