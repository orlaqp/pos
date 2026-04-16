import { promises as fs } from 'fs';

import { CloudFormationClient } from '@aws-sdk/client-cloudformation';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { fromIni } from '@aws-sdk/credential-provider-ini';

import { createDefaultLogger } from './asset-s3';
import { resolveModelTables } from './image-migration';
import type {
  ImageRestoreDependencies,
  ImageRestoreEntry,
  ImageRestoreManifestEntry,
  ImageRestoreOptions,
  ImageRestoreReport,
  ImageReferenceRecord,
} from './image-types';

const createDocumentClient = (client: DynamoDBClient) =>
  DynamoDBDocumentClient.from(client, {
    marshallOptions: {
      removeUndefinedValues: true,
      convertClassInstanceToMap: true,
    },
  });

const createDependencies = (
  options: ImageRestoreOptions
): ImageRestoreDependencies => {
  const cf = new CloudFormationClient({
    region: 'us-east-1',
    credentials: fromIni({ profile: options.profile }),
  });
  const dynamo = new DynamoDBClient({
    region: 'us-east-1',
    credentials: fromIni({ profile: options.profile }),
  });

  return {
    cf,
    dynamo,
    documentClient: createDocumentClient(dynamo),
    logger: createDefaultLogger(),
  };
};

const readManifest = async (
  manifestPath: string
): Promise<ImageRestoreManifestEntry[]> => {
  const raw = await fs.readFile(manifestPath, 'utf8');
  const parsed = JSON.parse(raw) as { entries?: ImageRestoreManifestEntry[] };

  if (!Array.isArray(parsed.entries)) {
    throw new Error(`Manifest at ${manifestPath} is missing an entries array`);
  }

  return parsed.entries;
};

const getTableName = (
  tables: {
    Product?: { physicalTableName: string };
    Category?: { physicalTableName: string };
  },
  model: 'products' | 'categories'
) => {
  const tableKey = model === 'products' ? 'Product' : 'Category';
  const tableName = tables[tableKey]?.physicalTableName;

  if (!tableName) {
    throw new Error(`Unable to resolve ${tableKey} table`);
  }

  return tableName;
};

const fetchCurrentRecord = async (
  client: DynamoDBDocumentClient,
  tableName: string,
  recordId: string
) => {
  const response = await client.send(
    new GetCommand({
      TableName: tableName,
      Key: {
        id: recordId,
      },
      ProjectionExpression: 'id, tenantId, picture, #version',
      ExpressionAttributeNames: {
        '#version': '_version',
      },
    })
  );

  return (response.Item as ImageReferenceRecord | undefined) ?? undefined;
};

const restorePictureReference = async (
  client: DynamoDBDocumentClient,
  tableName: string,
  record: ImageReferenceRecord,
  entry: ImageRestoreManifestEntry
) => {
  const nextVersion =
    typeof record._version === 'number' && Number.isFinite(record._version)
      ? record._version + 1
      : 1;

  const expressionAttributeNames: Record<string, string> = {
    '#picture': 'picture',
    '#version': '_version',
    '#lastChangedAt': '_lastChangedAt',
  };

  const expressionAttributeValues: Record<string, unknown> = {
    ':picture': entry.originalKey,
    ':expectedPicture': entry.newKey,
    ':updatedAt': new Date().toISOString(),
    ':nextVersion': nextVersion,
    ':lastChangedAt': Date.now(),
  };

  const conditions = ['attribute_exists(id)', '#picture = :expectedPicture'];

  if (typeof record._version === 'number' && Number.isFinite(record._version)) {
    conditions.push('#version = :expectedVersion');
    expressionAttributeValues[':expectedVersion'] = record._version;
  }

  await client.send(
    new UpdateCommand({
      TableName: tableName,
      Key: {
        id: entry.recordId,
      },
      UpdateExpression:
        'SET #picture = :picture, updatedAt = :updatedAt, #version = :nextVersion, #lastChangedAt = :lastChangedAt',
      ConditionExpression: conditions.join(' AND '),
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    })
  );
};

export const runImageRestore = async (
  options: ImageRestoreOptions,
  providedDependencies?: Partial<ImageRestoreDependencies>
): Promise<ImageRestoreReport> => {
  const dependencies = {
    ...createDependencies(options),
    ...providedDependencies,
  } as ImageRestoreDependencies;

  const documentClient =
    dependencies.documentClient ?? createDocumentClient(dependencies.dynamo);
  const resolvedTables =
    dependencies.resolvedTables ??
    (await resolveModelTables(dependencies.cf, options.env));
  const manifestEntries = await readManifest(options.manifestPath);
  const filteredManifestEntries = manifestEntries.filter(
    (entry) =>
      entry.status === 'updated' &&
      options.models.includes(entry.model) &&
      (!options.tenantId || entry.tenantId === options.tenantId)
  );

  const report: ImageRestoreReport = {
    preflight: {
      env: options.env,
      profile: options.profile,
      manifestPath: options.manifestPath,
      tenantId: options.tenantId ?? null,
      models: options.models,
      dryRun: options.dryRun,
    },
    entries: [],
    counts: {
      discovered: manifestEntries.length,
      eligible: filteredManifestEntries.length,
      restored: 0,
      skipped: 0,
      failed: 0,
    },
  };

  for (const entry of filteredManifestEntries) {
    const restoreEntry: ImageRestoreEntry = {
      model: entry.model,
      recordId: entry.recordId,
      tenantId: entry.tenantId,
      originalKey: entry.originalKey,
      newKey: entry.newKey,
      currentKey: null,
      status: 'skipped',
    };

    try {
      const tableName = getTableName(resolvedTables, entry.model);
      const currentRecord = await fetchCurrentRecord(
        documentClient,
        tableName,
        entry.recordId
      );

      if (!currentRecord) {
        restoreEntry.error = 'Record not found';
        report.counts.skipped += 1;
        report.entries.push(restoreEntry);
        continue;
      }

      restoreEntry.currentKey =
        typeof currentRecord.picture === 'string' ? currentRecord.picture : null;

      if (
        options.tenantId &&
        currentRecord.tenantId &&
        currentRecord.tenantId !== options.tenantId
      ) {
        restoreEntry.error = 'Tenant mismatch';
        report.counts.skipped += 1;
        report.entries.push(restoreEntry);
        continue;
      }

      if (currentRecord.picture !== entry.newKey) {
        restoreEntry.error = 'Current picture does not match manifest newKey';
        report.counts.skipped += 1;
        report.entries.push(restoreEntry);
        continue;
      }

      if (options.dryRun) {
        restoreEntry.status = 'dry-run';
        report.entries.push(restoreEntry);
        continue;
      }

      await restorePictureReference(
        documentClient,
        tableName,
        currentRecord,
        entry
      );

      restoreEntry.status = 'restored';
      report.counts.restored += 1;
      report.entries.push(restoreEntry);
    } catch (error) {
      restoreEntry.status = 'failed';
      restoreEntry.error =
        error instanceof Error ? error.message : String(error);
      report.counts.failed += 1;
      report.entries.push(restoreEntry);
    }
  }

  return report;
};
