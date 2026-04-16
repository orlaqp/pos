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
