import { CloudFormationClient } from '@aws-sdk/client-cloudformation';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  ScanCommand,
  UpdateCommand,
  type ScanCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { fromIni } from '@aws-sdk/credential-provider-ini';

import { createDefaultLogger } from './asset-s3';
import { resolveModelTables } from './image-migration';
import type {
  ImageModel,
  ImageReferenceRecord,
  ImageRestoreJpgDependencies,
  ImageRestoreJpgEntry,
  ImageRestoreJpgOptions,
  ImageRestoreJpgReport,
} from './image-types';

const MIGRATED_SUFFIX = '.bg-removed.png';

const createDocumentClient = (client: DynamoDBClient) =>
  DynamoDBDocumentClient.from(client, {
    marshallOptions: {
      removeUndefinedValues: true,
      convertClassInstanceToMap: true,
    },
  });

const createDependencies = (
  options: ImageRestoreJpgOptions
): ImageRestoreJpgDependencies => {
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

const normalizePictureKey = (key: string) => key.trim().replace(/^\/+/, '');

export const isRollbackCandidatePictureKey = (key: string) =>
  normalizePictureKey(key).toLowerCase().endsWith(MIGRATED_SUFFIX);

export const deriveJpgPictureKey = (pictureKey: string) => {
  const normalized = normalizePictureKey(pictureKey);
  if (!normalized.toLowerCase().endsWith(MIGRATED_SUFFIX)) {
    throw new Error('Picture key does not end with .bg-removed.png');
  }

  return `${normalized.slice(0, -MIGRATED_SUFFIX.length)}.jpg`;
};

const getTableName = (
  tables: {
    Product?: { physicalTableName: string };
    Category?: { physicalTableName: string };
  },
  model: ImageModel
) => {
  const tableKey = model === 'products' ? 'Product' : 'Category';
  const tableName = tables[tableKey]?.physicalTableName;

  if (!tableName) {
    throw new Error(`Unable to resolve ${tableKey} table`);
  }

  return tableName;
};

const scanMigratedImageRecords = async (
  client: DynamoDBDocumentClient,
  tableName: string,
  tenantId?: string
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
        isRollbackCandidatePictureKey(item.picture)
      ) {
        items.push(item);
      }
    }

    exclusiveStartKey = response.LastEvaluatedKey as Record<string, unknown> | undefined;
  } while (exclusiveStartKey);

  return items;
};

const updatePictureReference = async (
  client: DynamoDBDocumentClient,
  tableName: string,
  record: ImageReferenceRecord,
  targetKey: string
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
    ':picture': targetKey,
    ':expectedPicture': record.picture,
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
        id: record.id,
      },
      UpdateExpression:
        'SET #picture = :picture, updatedAt = :updatedAt, #version = :nextVersion, #lastChangedAt = :lastChangedAt',
      ConditionExpression: conditions.join(' AND '),
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    })
  );
};

export const runImageRestoreJpg = async (
  options: ImageRestoreJpgOptions,
  providedDependencies?: Partial<ImageRestoreJpgDependencies>
): Promise<ImageRestoreJpgReport> => {
  const dependencies = {
    ...createDependencies(options),
    ...providedDependencies,
  } as ImageRestoreJpgDependencies;

  const documentClient =
    dependencies.documentClient ?? createDocumentClient(dependencies.dynamo);
  const resolvedTables =
    dependencies.resolvedTables ??
    (await resolveModelTables(dependencies.cf, options.env));

  const report: ImageRestoreJpgReport = {
    preflight: {
      env: options.env,
      profile: options.profile,
      tenantId: options.tenantId ?? null,
      models: options.models,
      dryRun: options.dryRun,
    },
    entries: [],
    counts: {
      discovered: 0,
      eligible: 0,
      updated: 0,
      skipped: 0,
      failed: 0,
    },
  };

  for (const model of options.models) {
    const tableName = getTableName(resolvedTables, model);
    const records = await scanMigratedImageRecords(
      documentClient,
      tableName,
      options.tenantId
    );
    report.counts.discovered += records.length;
    report.counts.eligible += records.length;

    for (const record of records) {
      const entry: ImageRestoreJpgEntry = {
        model,
        recordId: record.id,
        tenantId: record.tenantId ?? null,
        currentKey:
          typeof record.picture === 'string' ? normalizePictureKey(record.picture) : null,
        targetKey: null,
        status: 'skipped',
      };

      try {
        if (!record.picture || !isRollbackCandidatePictureKey(record.picture)) {
          entry.error = 'Picture key is not a migrated .bg-removed.png value';
          report.counts.skipped += 1;
          report.entries.push(entry);
          continue;
        }

        const targetKey = deriveJpgPictureKey(record.picture);
        entry.targetKey = targetKey;

        if (options.dryRun) {
          entry.status = 'dry-run';
          report.entries.push(entry);
          continue;
        }

        await updatePictureReference(documentClient, tableName, record, targetKey);
        entry.status = 'updated';
        report.counts.updated += 1;
        report.entries.push(entry);
      } catch (error) {
        entry.status = 'failed';
        entry.error = error instanceof Error ? error.message : String(error);
        report.counts.failed += 1;
        report.entries.push(entry);
      }
    }
  }

  return report;
};
