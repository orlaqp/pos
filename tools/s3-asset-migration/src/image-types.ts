import type { CloudFormationClient } from '@aws-sdk/client-cloudformation';
import type { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import type { S3Client } from '@aws-sdk/client-s3';

import type { Logger } from './asset-types';

export const ALLOWED_IMAGE_ENVS = ['develop', 'ebtdev', 'prod'] as const;
export const IMAGE_MODELS = ['products', 'categories'] as const;

export type ImageModel = (typeof IMAGE_MODELS)[number];

export type ImageMigrationOptions = {
  env: string;
  profile: string;
  tenantId?: string;
  models: ImageModel[];
  outputDir?: string;
  limit?: number;
  dryRun: boolean;
  apply: boolean;
};

export type ImageReferenceRecord = {
  id: string;
  tenantId?: string | null;
  picture?: string | null;
  _version?: number | null;
};

export type DiscoveredImageReference = {
  model: ImageModel;
  tableName: string;
  id: string;
  tenantId: string | null;
  originalPictureKey: string;
  normalizedSourceKey: string;
  derivedPictureKey: string;
  derivedS3Key: string;
  version: number | null;
};

export type PythonWorkerResult = {
  success: boolean;
  width: number;
  height: number;
  originalBytes: number;
  processedBytes: number;
  error?: string;
};

export type ImageManifestStatus =
  | 'skipped'
  | 'dry-run'
  | 'updated'
  | 'failed';

export type ImageManifestEntry = {
  model: ImageModel;
  recordId: string;
  tenantId: string | null;
  originalKey: string;
  backupPath: string;
  processedPath: string;
  newKey: string;
  originalBytes: number | null;
  processedBytes: number | null;
  status: ImageManifestStatus;
  error?: string;
};

export type ImageMigrationReport = {
  preflight: {
    env: string;
    profile: string;
    bucket: string;
    tenantId: string | null;
    models: ImageModel[];
    dryRun: boolean;
    limit: number | null;
    outputDir: string;
  };
  entries: ImageManifestEntry[];
  counts: {
    discovered: number;
    processed: number;
    skipped: number;
    failed: number;
    updated: number;
  };
  manifestPath: string;
};

export type ImageMigrationRuntime = {
  ensureDir: (dirPath: string) => Promise<void>;
  writeFile: (filePath: string, data: Buffer | string) => Promise<void>;
  readFile: (filePath: string) => Promise<Buffer>;
  statFile: (filePath: string) => Promise<{ size: number }>;
  downloadObject: (bucketName: string, key: string) => Promise<Buffer>;
  uploadObject: (
    bucketName: string,
    key: string,
    data: Buffer,
    contentType: string
  ) => Promise<void>;
  invokeWorker: (inputPath: string, outputPath: string) => Promise<PythonWorkerResult>;
};

export type ImageMigrationDependencies = {
  cf: CloudFormationClient;
  dynamo: DynamoDBClient;
  documentClient?: DynamoDBDocumentClient;
  s3: S3Client;
  logger: Logger;
  resolvedTables?: {
    Product?: { physicalTableName: string };
    Category?: { physicalTableName: string };
  };
  runtime?: ImageMigrationRuntime;
};

export type ImageRestoreOptions = {
  env: string;
  profile: string;
  manifestPath: string;
  tenantId?: string;
  models: ImageModel[];
  dryRun: boolean;
  apply: boolean;
};

export type ImageRestoreManifestEntry = Pick<
  ImageManifestEntry,
  'model' | 'recordId' | 'tenantId' | 'originalKey' | 'newKey' | 'status'
>;

export type ImageRestoreEntryStatus =
  | 'skipped'
  | 'dry-run'
  | 'restored'
  | 'failed';

export type ImageRestoreEntry = {
  model: ImageModel;
  recordId: string;
  tenantId: string | null;
  originalKey: string;
  newKey: string;
  currentKey: string | null;
  status: ImageRestoreEntryStatus;
  error?: string;
};

export type ImageRestoreReport = {
  preflight: {
    env: string;
    profile: string;
    manifestPath: string;
    tenantId: string | null;
    models: ImageModel[];
    dryRun: boolean;
  };
  entries: ImageRestoreEntry[];
  counts: {
    discovered: number;
    eligible: number;
    restored: number;
    skipped: number;
    failed: number;
  };
};

export type ImageRestoreDependencies = {
  cf: CloudFormationClient;
  dynamo: DynamoDBClient;
  documentClient?: DynamoDBDocumentClient;
  logger: Logger;
  resolvedTables?: {
    Product?: { physicalTableName: string };
    Category?: { physicalTableName: string };
  };
};

export type ImageRestoreJpgOptions = {
  env: string;
  profile: string;
  tenantId?: string;
  models: ImageModel[];
  dryRun: boolean;
  apply: boolean;
};

export type ImageRestoreJpgEntryStatus =
  | 'skipped'
  | 'dry-run'
  | 'updated'
  | 'failed';

export type ImageRestoreJpgEntry = {
  model: ImageModel;
  recordId: string;
  tenantId: string | null;
  currentKey: string | null;
  targetKey: string | null;
  status: ImageRestoreJpgEntryStatus;
  error?: string;
};

export type ImageRestoreJpgReport = {
  preflight: {
    env: string;
    profile: string;
    tenantId: string | null;
    models: ImageModel[];
    dryRun: boolean;
  };
  entries: ImageRestoreJpgEntry[];
  counts: {
    discovered: number;
    eligible: number;
    updated: number;
    skipped: number;
    failed: number;
  };
};

export type ImageRestoreJpgDependencies = {
  cf: CloudFormationClient;
  dynamo: DynamoDBClient;
  documentClient?: DynamoDBDocumentClient;
  logger: Logger;
  resolvedTables?: {
    Product?: { physicalTableName: string };
    Category?: { physicalTableName: string };
  };
};

export type ImageManifestDiscoveryOptions = {
  env: string;
  tenantId?: string;
  models: ImageModel[];
  roots?: string[];
  limit?: number;
  includeNonUpdated?: boolean;
};

export type ImageManifestCandidate = {
  manifestPath: string;
  outputDir: string | null;
  modifiedAt: string;
  matchedModels: ImageModel[];
  updatedEntries: number;
  totalEntries: number;
  preflight: {
    env: string | null;
    profile: string | null;
    tenantId: string | null;
    models: string[];
    dryRun: boolean | null;
  };
  counts: {
    discovered: number | null;
    processed: number | null;
    skipped: number | null;
    failed: number | null;
    updated: number | null;
  };
};

export type ImageManifestDiscoveryReport = {
  rootsSearched: string[];
  candidates: ImageManifestCandidate[];
};
