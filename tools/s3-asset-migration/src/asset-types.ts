import type { CloudFormationClient } from '@aws-sdk/client-cloudformation';
import type { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import type { S3Client } from '@aws-sdk/client-s3';

export const SOURCE_ENV = 'develop';
export const TARGET_ENVS = ['ebtdev', 'prod'] as const;
export const DEFAULT_PARALLEL_OBJECTS = 16;
export const DEFAULT_PREFIXES = ['public/products/', 'public/categories/'] as const;

export type AssetPrefix = string;

export type StorageEnvConfig = {
  envName: string;
  region: string;
  stackName: string;
  amplifyAppId: string;
};

export type StorageEnvironment = {
  envName: string;
  region: string;
  stackName: string;
  profile: string;
  storageStackName: string;
  bucketName: string;
};

export type AssetMigrationOptions = {
  sourceEnv: string;
  targetEnv: string;
  sourceProfile: string;
  targetProfile: string;
  sourceTenantId?: string;
  targetTenantId?: string;
  ignoreMissingSourceAssets?: boolean;
  dryRun: boolean;
  apply: boolean;
  parallelObjects: number;
  prefixes: AssetPrefix[];
};

export type AssetPrefixProgress = {
  prefix: AssetPrefix;
  listedObjects: number;
  listedBytes: number;
  copiedObjects: number;
  copiedBytes: number;
  failedObjects: number;
  pages: number;
};

export type AssetPrefixReport = {
  prefix: AssetPrefix;
  listedObjects: number;
  listedBytes: number;
  copiedObjects: number;
  copiedBytes: number;
  failedObjects: number;
};

export type AssetFailure = {
  prefix: AssetPrefix;
  key: string;
  reason: string;
};

export type AssetMigrationReport = {
  preflight: {
    sourceEnv: string;
    sourceStack: string;
    sourceProfile: string;
    sourceBucket: string;
    targetEnv: string;
    targetStack: string;
    targetProfile: string;
    targetBucket: string;
    sourceTenantId: string | null;
    targetTenantId: string | null;
    selectionMode: 'prefix-scan' | 'source-record-keys' | 'tenant-record-keys';
    prefixes: AssetPrefix[];
    dryRun: boolean;
    parallelObjects: number;
    overwrite: boolean;
    ignoreMissingSourceAssets: boolean;
  };
  prefixes: AssetPrefixReport[];
  failures: AssetFailure[];
};

export type Logger = {
  info: (message: string) => void;
  error: (message: string) => void;
};

export type Dependencies = {
  sourceCf: CloudFormationClient;
  targetCf: CloudFormationClient;
  sourceDynamo: DynamoDBClient;
  sourceDocumentClient?: DynamoDBDocumentClient;
  sourceS3: S3Client;
  targetS3: S3Client;
  logger: Logger;
};

export type ListedObject = {
  key: string;
  size: number;
  targetKey?: string;
};

export type AssetReferenceRecord = {
  id: string;
  tenantId: string;
  picture?: string | null;
};
