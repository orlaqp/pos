import { promisify, TextEncoder } from 'util';
import { execFile as execFileCb } from 'child_process';
import * as path from 'path';
import { promises as fs } from 'fs';
import { existsSync } from 'fs';

import {
  CloudFormationClient,
  DescribeStackResourcesCommand,
} from '@aws-sdk/client-cloudformation';
import { fromIni } from '@aws-sdk/credential-provider-ini';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import {
  DynamoDBDocumentClient,
  ScanCommand,
  UpdateCommand,
  type ScanCommandInput,
} from '@aws-sdk/lib-dynamodb';

import { resolveStorageEnvironment } from './asset-storage-env';
import { createDefaultLogger } from './asset-s3';
import {
  ALLOWED_IMAGE_ENVS,
  type DiscoveredImageReference,
  type ImageManifestEntry,
  type ImageMigrationDependencies,
  type ImageMigrationOptions,
  type ImageMigrationReport,
  type ImageMigrationRuntime,
  type ImageReferenceRecord,
  type PythonWorkerResult,
} from './image-types';
import { createInitialImageReport, logImagePreflight, logImageReport } from './image-reporter';

const execFile = promisify(execFileCb);
const ACCESS_PREFIXES = ['public/', 'protected/', 'private/'] as const;
const TEAM_PROVIDER_INFO_PATH = path.resolve(
  process.cwd(),
  'apps/mobile-ui/amplify/team-provider-info.json'
);
const textEncoder = new TextEncoder();

const timestampDirectory = () => new Date().toISOString().replace(/[:.]/g, '-');

const createDocumentClient = (client: DynamoDBClient) =>
  DynamoDBDocumentClient.from(client, {
    marshallOptions: {
      removeUndefinedValues: true,
      convertClassInstanceToMap: true,
    },
  });

const isAllowedEnv = (env: string) =>
  ALLOWED_IMAGE_ENVS.includes(env as (typeof ALLOWED_IMAGE_ENVS)[number]);

const assertAllowedImageEnvironment = (options: ImageMigrationOptions) => {
  if (!isAllowedEnv(options.env)) {
    throw new Error(`--env must be one of: ${ALLOWED_IMAGE_ENVS.join(', ')}`);
  }
};

const normalizePictureKey = (key: string) => key.trim().replace(/^\/+/, '');

const toS3Key = (pictureKey: string) => {
  const normalized = normalizePictureKey(pictureKey);
  if (ACCESS_PREFIXES.some((prefix) => normalized.startsWith(prefix))) {
    return normalized;
  }

  return `public/${normalized}`;
};

export const isMigratedPictureKey = (key: string) =>
  normalizePictureKey(key).toLowerCase().endsWith('.bg-removed.png');

export const deriveProcessedPictureKey = (pictureKey: string) => {
  const normalized = normalizePictureKey(pictureKey);
  const extension = path.posix.extname(normalized);
  const base = extension ? normalized.slice(0, -extension.length) : normalized;
  return `${base}.bg-removed.png`;
};

const ensureParentDir = async (runtime: ImageMigrationRuntime, filePath: string) => {
  await runtime.ensureDir(path.dirname(filePath));
};

const streamToBuffer = async (body: unknown): Promise<Buffer> => {
  if (Buffer.isBuffer(body)) {
    return body;
  }

  if (body instanceof Uint8Array) {
    return Buffer.from(body);
  }

  if (body && typeof body === 'object' && 'transformToByteArray' in body) {
    const output = await (
      body as { transformToByteArray: () => Promise<Uint8Array> }
    ).transformToByteArray();
    return Buffer.from(output);
  }

  if (body && typeof body === 'object' && Symbol.asyncIterator in body) {
    const chunks: Uint8Array[] = [];
    let totalLength = 0;

    for await (const chunk of body as AsyncIterable<Buffer | Uint8Array | string>) {
      if (typeof chunk === 'string') {
        const encoded = textEncoder.encode(chunk);
        chunks.push(encoded);
        totalLength += encoded.byteLength;
        continue;
      }

      if (Buffer.isBuffer(chunk)) {
        const normalized = new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength);
        chunks.push(normalized);
        totalLength += normalized.byteLength;
        continue;
      }

      chunks.push(chunk);
      totalLength += chunk.byteLength;
    }

    const merged = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      merged.set(chunk, offset);
      offset += chunk.byteLength;
    }

    return Buffer.from(merged.buffer, merged.byteOffset, merged.byteLength);
  }

  throw new Error('Unsupported S3 body type');
};

const createDefaultRuntime = (client: S3Client): ImageMigrationRuntime => {
  const workerPath = path.resolve(
    __dirname,
    '..',
    'python',
    'remove_background.py'
  );
  const venvPython = path.resolve(__dirname, '..', 'python', '.venv', 'bin', 'python');
  const pythonExecutable = process.env.PYTHON || (existsSync(venvPython) ? venvPython : 'python3');

  return {
    ensureDir: async (dirPath) => {
      await fs.mkdir(dirPath, { recursive: true });
    },
    writeFile: async (filePath, data) => {
      if (typeof data === 'string') {
        await fs.writeFile(filePath, data);
        return;
      }

      await fs.writeFile(filePath, new Uint8Array(data));
    },
    readFile: (filePath) => fs.readFile(filePath),
    statFile: async (filePath) => {
      const stats = await fs.stat(filePath);
      return { size: stats.size };
    },
    downloadObject: async (bucketName, key) => {
      const response = await client.send(
        new GetObjectCommand({
          Bucket: bucketName,
          Key: key,
        })
      );

      return streamToBuffer(response.Body);
    },
    uploadObject: async (bucketName, key, data, contentType) => {
      await client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: new Uint8Array(data),
          ContentType: contentType,
          CacheControl: 'public, max-age=31536000',
        })
      );
    },
    invokeWorker: async (inputPath, outputPath) => {
      try {
        const { stdout } = await execFile(pythonExecutable, [
          workerPath,
          inputPath,
          outputPath,
        ]);

        const parsed = JSON.parse(stdout || '{}') as PythonWorkerResult;
        if (!parsed.success) {
          throw new Error(parsed.error || 'Background removal worker failed');
        }

        return parsed;
      } catch (error) {
        const stdout =
          error && typeof error === 'object' && 'stdout' in error
            ? String((error as { stdout?: unknown }).stdout || '')
            : '';
        const stderr =
          error && typeof error === 'object' && 'stderr' in error
            ? String((error as { stderr?: unknown }).stderr || '')
            : '';
        const combined = [stderr.trim(), stdout.trim()].filter(Boolean).join('\n');
        const message =
          combined ||
          (error instanceof Error ? error.message : String(error)) ||
          'Background removal worker failed';

        throw new Error(message);
      }
    },
  };
};

const createDependencies = (
  options: ImageMigrationOptions
): ImageMigrationDependencies => {
  const cf = new CloudFormationClient({
    region: 'us-east-1',
    credentials: fromIni({ profile: options.profile }),
  });
  const dynamo = new DynamoDBClient({
    region: 'us-east-1',
    credentials: fromIni({ profile: options.profile }),
  });
  const s3 = new S3Client({
    region: 'us-east-1',
    credentials: fromIni({ profile: options.profile }),
  });

  return {
    cf,
    dynamo,
    s3,
    logger: createDefaultLogger(),
  };
};

const loadEnvStackName = async (envName: string) => {
  const raw = await fs.readFile(TEAM_PROVIDER_INFO_PATH, 'utf8');
  const parsed = JSON.parse(raw) as Record<
    string,
    { awscloudformation?: { StackName?: string } }
  >;
  const stackName = parsed[envName]?.awscloudformation?.StackName;

  if (!stackName) {
    throw new Error(`Unable to resolve Amplify environment "${envName}" from team-provider-info.json`);
  }

  return stackName;
};

export const resolveModelTables = async (
  cf: CloudFormationClient,
  envName: string
): Promise<{
  Product?: { physicalTableName: string };
  Category?: { physicalTableName: string };
}> => {
  const tables: {
    Product?: { physicalTableName: string };
    Category?: { physicalTableName: string };
  } = {};
  const stackName = await loadEnvStackName(envName);
  const queue = [stackName];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.pop();
    if (!current || visited.has(current)) {
      continue;
    }

    visited.add(current);

    const response = await cf.send(
      new DescribeStackResourcesCommand({
        StackName: current,
      })
    );

    for (const resource of response.StackResources ?? []) {
      const resourceType = resource.ResourceType ?? '';
      const logicalResourceId = resource.LogicalResourceId ?? '';
      const physicalResourceId = resource.PhysicalResourceId ?? '';

      if (resourceType === 'AWS::CloudFormation::Stack' && physicalResourceId) {
        queue.push(physicalResourceId);
        continue;
      }

      if (resourceType !== 'AWS::DynamoDB::Table' || !physicalResourceId) {
        continue;
      }

      if (
        !tables.Product &&
        logicalResourceId.toLowerCase().includes('product')
      ) {
        tables.Product = { physicalTableName: physicalResourceId };
      }

      if (
        !tables.Category &&
        logicalResourceId.toLowerCase().includes('category')
      ) {
        tables.Category = { physicalTableName: physicalResourceId };
      }
    }
  }

  return tables;
};

const scanImageRecords = async (
  client: DynamoDBDocumentClient,
  tableName: string,
  tenantId?: string,
  limit?: number
) => {
  const items: ImageReferenceRecord[] = [];
  let exclusiveStartKey: Record<string, unknown> | undefined;

  do {
    const input: ScanCommandInput = {
      TableName: tableName,
      ProjectionExpression: 'id, tenantId, picture, #version',
      ExpressionAttributeNames: {
        '#version': '_version',
      },
      ExclusiveStartKey: exclusiveStartKey,
      ...(tenantId
        ? {
            FilterExpression: 'tenantId = :tenantId',
            ExpressionAttributeValues: {
              ':tenantId': tenantId,
            },
          }
        : {}),
    };

    const response = await client.send(new ScanCommand(input));
    const pageItems = (response.Items as ImageReferenceRecord[] | undefined) ?? [];

    for (const item of pageItems) {
      if (
        typeof item.picture === 'string' &&
        item.picture.trim().length > 0 &&
        !isMigratedPictureKey(item.picture)
      ) {
        items.push(item);
      }

      if (limit && items.length >= limit) {
        return items.slice(0, limit);
      }
    }

    exclusiveStartKey = response.LastEvaluatedKey as Record<string, unknown> | undefined;
  } while (exclusiveStartKey);

  return items;
};

const discoverReferences = async (
  options: ImageMigrationOptions,
  tables: {
    Product?: { physicalTableName: string };
    Category?: { physicalTableName: string };
  },
  documentClient: DynamoDBDocumentClient,
  logger: { info: (message: string) => void }
): Promise<DiscoveredImageReference[]> => {
  const discovered: DiscoveredImageReference[] = [];

  for (const model of options.models) {
    const tableKey = model === 'products' ? 'Product' : 'Category';
    const tableName = tables[tableKey]?.physicalTableName;

    if (!tableName) {
      throw new Error(`Unable to resolve ${tableKey} table for env "${options.env}"`);
    }

    const remainingLimit =
      typeof options.limit === 'number'
        ? Math.max(options.limit - discovered.length, 0)
        : undefined;

    if (remainingLimit === 0) {
      break;
    }

    const records = await scanImageRecords(
      documentClient,
      tableName,
      options.tenantId,
      remainingLimit
    );

    logger.info(
      `[image-bg-removal] ${tableKey}: discovered ${records.length} record(s)${
        options.tenantId ? ` for tenant ${options.tenantId}` : ''
      }`
    );

    discovered.push(
      ...records.map((record) => {
        const originalPictureKey = normalizePictureKey(record.picture || '');
        const derivedPictureKey = deriveProcessedPictureKey(originalPictureKey);

        return {
          model,
          tableName,
          id: record.id,
          tenantId: record.tenantId ?? null,
          originalPictureKey,
          normalizedSourceKey: toS3Key(originalPictureKey),
          derivedPictureKey,
          derivedS3Key: toS3Key(derivedPictureKey),
          version:
            typeof record._version === 'number'
              ? record._version
              : record._version == null
              ? null
              : Number(record._version),
        };
      })
    );
  }

  return discovered.slice(0, options.limit ?? discovered.length);
};

const updatePictureReference = async (
  client: DynamoDBDocumentClient,
  reference: DiscoveredImageReference
) => {
  const nextVersion =
    typeof reference.version === 'number' && Number.isFinite(reference.version)
      ? reference.version + 1
      : 1;

  const expressionAttributeNames: Record<string, string> = {
    '#picture': 'picture',
    '#version': '_version',
    '#lastChangedAt': '_lastChangedAt',
  };

  const expressionAttributeValues: Record<string, unknown> = {
    ':picture': reference.derivedPictureKey,
    ':updatedAt': new Date().toISOString(),
    ':nextVersion': nextVersion,
    ':lastChangedAt': Date.now(),
  };

  const conditions = ['attribute_exists(id)'];

  if (typeof reference.version === 'number' && Number.isFinite(reference.version)) {
    conditions.push('#version = :expectedVersion');
    expressionAttributeValues[':expectedVersion'] = reference.version;
  }

  await client.send(
    new UpdateCommand({
      TableName: reference.tableName,
      Key: {
        id: reference.id,
      },
      UpdateExpression:
        'SET #picture = :picture, updatedAt = :updatedAt, #version = :nextVersion, #lastChangedAt = :lastChangedAt',
      ConditionExpression: conditions.join(' AND '),
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    })
  );
};

const createLocalPaths = (
  outputDir: string,
  reference: DiscoveredImageReference
) => {
  const backupPath = path.join(
    outputDir,
    'backups',
    reference.model,
    reference.id,
    reference.originalPictureKey
  );
  const processedPath = path.join(
    outputDir,
    'processed',
    reference.model,
    reference.id,
    reference.derivedPictureKey
  );

  return { backupPath, processedPath };
};

export const runImageMigration = async (
  options: ImageMigrationOptions,
  providedDependencies?: Partial<ImageMigrationDependencies>
): Promise<ImageMigrationReport> => {
  assertAllowedImageEnvironment(options);

  const dependencies = {
    ...createDependencies(options),
    ...providedDependencies,
  } as ImageMigrationDependencies;

  const runtime = dependencies.runtime ?? createDefaultRuntime(dependencies.s3);
  const storageEnv = await resolveStorageEnvironment(
    dependencies.cf,
    options.profile,
    options.env
  );
  const resolvedTables =
    dependencies.resolvedTables ?? (await resolveModelTables(dependencies.cf, options.env));
  const documentClient =
    dependencies.documentClient ?? createDocumentClient(dependencies.dynamo);
  const outputDir =
    options.outputDir ||
    path.resolve(process.cwd(), 'tools-output', 'image-bg-removal', timestampDirectory());
  const manifestPath = path.join(outputDir, 'manifest.json');
  const report = createInitialImageReport(
    options,
    storageEnv.bucketName,
    outputDir,
    manifestPath
  );

  await runtime.ensureDir(outputDir);
  logImagePreflight(report);

  const references = await discoverReferences(
    options,
    resolvedTables,
    documentClient,
    dependencies.logger
  );
  report.counts.discovered = references.length;

  for (const reference of references) {
    const { backupPath, processedPath } = createLocalPaths(outputDir, reference);
    const entry: ImageManifestEntry = {
      model: reference.model,
      recordId: reference.id,
      tenantId: reference.tenantId,
      originalKey: reference.originalPictureKey,
      backupPath,
      processedPath,
      newKey: reference.derivedPictureKey,
      originalBytes: null,
      processedBytes: null,
      status: 'failed',
    };

    report.entries.push(entry);

    try {
      await ensureParentDir(runtime, backupPath);
      await ensureParentDir(runtime, processedPath);

      const originalBytes = await runtime.downloadObject(
        storageEnv.bucketName,
        reference.normalizedSourceKey
      );
      entry.originalBytes = originalBytes.length;

      await runtime.writeFile(backupPath, originalBytes);

      const workerResult = await runtime.invokeWorker(backupPath, processedPath);
      entry.processedBytes = workerResult.processedBytes;

      if (options.dryRun) {
        entry.status = 'dry-run';
        report.counts.processed += 1;
        continue;
      }

      const processedBytes = await runtime.readFile(processedPath);

      await runtime.uploadObject(
        storageEnv.bucketName,
        reference.derivedS3Key,
        processedBytes,
        'image/png'
      );

      await updatePictureReference(documentClient, reference);
      entry.status = 'updated';
      report.counts.processed += 1;
      report.counts.updated += 1;
    } catch (error) {
      entry.status = 'failed';
      entry.error = error instanceof Error ? error.message : String(error);
      report.counts.failed += 1;
      dependencies.logger.error(
        `[image-bg-removal] ${reference.model}:${reference.id} failed - ${entry.error}`
      );
    }
  }

  report.counts.skipped = report.entries.filter((entry) => entry.status === 'skipped').length;

  await runtime.writeFile(manifestPath, `${JSON.stringify(report, null, 2)}\n`);
  logImageReport(report);

  return report;
};
