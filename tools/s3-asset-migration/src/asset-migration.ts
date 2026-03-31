import { CloudFormationClient } from '@aws-sdk/client-cloudformation';
import { fromIni } from '@aws-sdk/credential-provider-ini';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { S3Client } from '@aws-sdk/client-s3';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

import { createInitialAssetReport, createPrefixReport, logAssetPreflight, logAssetReport } from './asset-reporter';
import { AssetSourceReader, AssetTargetWriter, createDefaultLogger } from './asset-s3';
import { assertAllowedAssetEnvironments, assertDistinctBuckets } from './asset-safety';
import { resolveStorageEnvironment } from './asset-storage-env';
import { resolveEnvironment } from '../../dynamo-migration/src/amplify-env';
import type {
  AssetReferenceRecord,
  AssetMigrationOptions,
  Dependencies,
  AssetFailure,
} from './asset-types';

const HEARTBEAT_INTERVAL_MS = 15_000;

const formatDuration = (startedAt: number) => {
  const elapsedMs = Date.now() - startedAt;
  const totalSeconds = Math.max(0, Math.round(elapsedMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
};

const runWithConcurrency = async <T>(
  items: T[],
  concurrency: number,
  task: (item: T) => Promise<void>
) => {
  const workerCount = Math.max(1, Math.min(concurrency, items.length || 1));
  let nextIndex = 0;

  const runWorker = async () => {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      await task(items[currentIndex]);
    }
  };

  await Promise.all(Array.from({ length: workerCount }, () => runWorker()));
};

const createDependencies = (options: AssetMigrationOptions): Dependencies => {
  const sourceCf = new CloudFormationClient({
    region: 'us-east-1',
    credentials: fromIni({ profile: options.sourceProfile }),
  });
  const targetCf = new CloudFormationClient({
    region: 'us-east-1',
    credentials: fromIni({ profile: options.targetProfile }),
  });
  const sourceS3 = new S3Client({
    region: 'us-east-1',
    credentials: fromIni({ profile: options.sourceProfile }),
  });
  const sourceDynamo = new DynamoDBClient({
    region: 'us-east-1',
    credentials: fromIni({ profile: options.sourceProfile }),
  });
  const targetS3 = new S3Client({
    region: 'us-east-1',
    credentials: fromIni({ profile: options.targetProfile }),
  });

  return {
    sourceCf,
    targetCf,
    sourceDynamo,
    sourceS3,
    targetS3,
    logger: createDefaultLogger(),
  };
};

const createDocumentClient = (client: DynamoDBClient) =>
  DynamoDBDocumentClient.from(client, {
    marshallOptions: {
      removeUndefinedValues: true,
      convertClassInstanceToMap: true,
    },
  });

const scanAssetKeys = async (
  client: DynamoDBDocumentClient,
  tableName: string,
  tenantId?: string
) => {
  const keys: string[] = [];
  let exclusiveStartKey: Record<string, unknown> | undefined;

  do {
    const response = await client.send(
      new ScanCommand({
        TableName: tableName,
        ...(tenantId
          ? {
              FilterExpression: 'tenantId = :tenantId',
              ExpressionAttributeValues: {
                ':tenantId': tenantId,
              },
            }
          : {}),
        ProjectionExpression: 'id, tenantId, picture',
        ExclusiveStartKey: exclusiveStartKey,
      })
    );

    const items = (response.Items as AssetReferenceRecord[] | undefined) ?? [];
    keys.push(
      ...items
        .map((item) => item.picture)
        .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    );

    exclusiveStartKey = response.LastEvaluatedKey as Record<string, unknown> | undefined;
  } while (exclusiveStartKey);

  return keys;
};

const normalizeAssetKey = (key: string) => {
  const trimmed = key.trim().replace(/^\/+/, '');
  if (trimmed.startsWith('public/') || trimmed.startsWith('protected/') || trimmed.startsWith('private/')) {
    return trimmed;
  }

  return `public/${trimmed}`;
};

const extractAssetSuffix = (key: string, kind: 'products' | 'categories') => {
  const normalized = normalizeAssetKey(key);
  const matcher = new RegExp(`(?:^|/)${kind}/(.+)$`);
  const match = normalized.match(matcher);
  if (match?.[1]) {
    return match[1];
  }

  const fallback = normalized.split('/').pop();
  if (!fallback) {
    throw new Error(`Unable to derive ${kind} asset suffix from "${key}"`);
  }

  return fallback;
};

const buildTargetAssetKey = (
  sourceKey: string,
  kind: 'products' | 'categories',
  targetTenantId: string | undefined
) => {
  if (!targetTenantId) {
    return normalizeAssetKey(sourceKey);
  }

  return `public/${targetTenantId}/${kind}/${extractAssetSuffix(sourceKey, kind)}`;
};

const derivePrefixFromKey = (key: string) => {
  const parts = key.split('/');
  if (parts.length < 2) {
    return 'unscoped/';
  }

  if (
    (parts[0] === 'public' || parts[0] === 'protected' || parts[0] === 'private') &&
    (parts[1] === 'products' || parts[1] === 'categories')
  ) {
    return `${parts[0]}/${parts[1]}/`;
  }

  if (
    (parts[0] === 'public' || parts[0] === 'protected' || parts[0] === 'private') &&
    parts.length >= 3
  ) {
    return `${parts[0]}/${parts[1]}/${parts[2]}/`;
  }

  return `${parts[0]}/${parts[1]}/`;
};

const collectTenantAssetObjects = async (
  options: AssetMigrationOptions,
  dependencies: Dependencies,
  sourceReader: AssetSourceReader,
  sourceBucketName: string
) => {
  const sourceEnv = await resolveEnvironment(
    dependencies.sourceCf,
    options.sourceProfile,
    options.sourceEnv
  );
  const documentClient =
    dependencies.sourceDocumentClient ?? createDocumentClient(dependencies.sourceDynamo);
  const modelTables = ['Product', 'Category'] as const;
  const rawKeys: string[] = [];

  for (const modelName of modelTables) {
    const tableName = sourceEnv.tables[modelName]?.physicalTableName;
    if (!tableName) {
      throw new Error(`Unable to resolve ${modelName} table for tenant-aware asset migration`);
    }

    const modelKeys = await scanAssetKeys(
      documentClient,
      tableName,
      options.sourceTenantId
    );
    dependencies.logger.info(
      `[source-assets] ${modelName}: found ${modelKeys.length} referenced picture key(s)${
        options.sourceTenantId ? ` for tenant ${options.sourceTenantId}` : ''
      }`
    );
    rawKeys.push(...modelKeys);
  }

  const normalizedKeys = Array.from(new Set(rawKeys.map(normalizeAssetKey))).filter((key) =>
    options.prefixes.some((prefix) => key.startsWith(prefix))
  );

  dependencies.logger.info(
    `[source-assets] retained ${normalizedKeys.length} unique asset key(s) after prefix filtering`
  );

  const statResults = await Promise.allSettled(
    normalizedKeys.map(async (key) => {
      const object = await sourceReader.statObject(sourceBucketName, key);
      const kind = key.includes('/categories/') ? 'categories' : 'products';
      return {
        ...object,
        targetKey: buildTargetAssetKey(key, kind, options.targetTenantId),
      };
    })
  );

  const objects = statResults
    .filter(
      (
        result
      ): result is PromiseFulfilledResult<{ key: string; size: number; targetKey: string }> =>
        result.status === 'fulfilled'
    )
    .map((result) => result.value);

  const failures: AssetFailure[] = statResults
    .map((result, index) => {
      if (result.status === 'fulfilled') {
        return null;
      }

      return {
        prefix: derivePrefixFromKey(buildTargetAssetKey(
          normalizedKeys[index],
          normalizedKeys[index].includes('/categories/') ? 'categories' : 'products',
          options.targetTenantId
        )),
        key: normalizedKeys[index],
        reason:
          result.reason instanceof Error
            ? `Unable to inspect source asset "${normalizedKeys[index]}": ${result.reason.message}`
            : `Unable to inspect source asset "${normalizedKeys[index]}": ${String(result.reason)}`,
      };
    })
    .filter((failure): failure is AssetFailure => failure !== null);

  if (failures.length > 0 && options.ignoreMissingSourceAssets) {
    for (const failure of failures) {
      dependencies.logger.error(`[ignored-missing-source-asset] ${failure.reason}`);
    }
  }

  return {
    objectsByPrefix: objects.reduce<Record<string, typeof objects>>((groups, object) => {
      const prefix = derivePrefixFromKey(object.targetKey || object.key);
      groups[prefix] = groups[prefix] || [];
      groups[prefix].push(object);
      return groups;
    }, {}),
    failures,
  };
};

export const runAssetMigration = async (
  options: AssetMigrationOptions,
  providedDependencies?: Partial<Dependencies>
) => {
  assertAllowedAssetEnvironments(options);

  const dependencies =
    providedDependencies?.sourceCf &&
    providedDependencies?.targetCf &&
    providedDependencies?.sourceDynamo &&
    providedDependencies?.sourceS3 &&
    providedDependencies?.targetS3 &&
    providedDependencies?.logger
      ? (providedDependencies as Dependencies)
      : ({
          ...createDependencies(options),
          ...providedDependencies,
        } as Dependencies);

  const sourceEnv = await resolveStorageEnvironment(
    dependencies.sourceCf,
    options.sourceProfile,
    options.sourceEnv
  );
  const targetEnv = await resolveStorageEnvironment(
    dependencies.targetCf,
    options.targetProfile,
    options.targetEnv
  );

  assertDistinctBuckets(sourceEnv, targetEnv);

  const report = createInitialAssetReport(options, sourceEnv, targetEnv);
  logAssetPreflight(dependencies.logger, report);

  const sourceReader = new AssetSourceReader(dependencies.sourceS3);
  const targetWriter = new AssetTargetWriter(
    dependencies.targetS3,
    sourceEnv,
    targetEnv
  );
  const assetSelection = await collectTenantAssetObjects(
    options,
    dependencies,
    sourceReader,
    sourceEnv.bucketName
  );
  const tenantObjectsByPrefix = assetSelection.objectsByPrefix;
  report.failures.push(...assetSelection.failures);

  const activePrefixes = tenantObjectsByPrefix
    ? Object.keys(tenantObjectsByPrefix).sort()
    : options.prefixes;

  for (const prefix of activePrefixes) {
    const prefixReport = createPrefixReport(prefix);
    report.prefixes.push(prefixReport);
    const startedAt = Date.now();
    dependencies.logger.info(`Starting prefix ${prefix}`);

    const heartbeat = setInterval(() => {
      dependencies.logger.info(
        `[${prefix}] heartbeat after ${formatDuration(startedAt)}: listed=${prefixReport.listedObjects} copied=${prefixReport.copiedObjects} failed=${prefixReport.failedObjects}`
      );
    }, HEARTBEAT_INTERVAL_MS);

    try {
      const objects = tenantObjectsByPrefix?.[prefix]
        ? tenantObjectsByPrefix[prefix]
        : await sourceReader.listPrefix(
            sourceEnv.bucketName,
            prefix,
            (page, objectCount, totalObjects, totalBytes, hasMore) => {
              prefixReport.listedObjects = totalObjects;
              prefixReport.listedBytes = totalBytes;
              dependencies.logger.info(
                `[${prefix}] listed page ${page}: +${objectCount} objects (${totalObjects} total, ${totalBytes} bytes${hasMore ? ', more pages' : ''})`
              );
            }
          );
      prefixReport.listedObjects = objects.length;
      prefixReport.listedBytes = objects.reduce((total, object) => total + object.size, 0);
      if (tenantObjectsByPrefix?.[prefix]) {
        dependencies.logger.info(
          `[${prefix}] tenant-aware selection: ${prefixReport.listedObjects} object(s), ${prefixReport.listedBytes} bytes`
        );
      }

      if (!options.dryRun) {
        await runWithConcurrency(objects, options.parallelObjects, async (object) => {
          try {
            await targetWriter.copyObject(object.key, object.targetKey);
            prefixReport.copiedObjects += 1;
            prefixReport.copiedBytes += object.size;
          } catch (error) {
            prefixReport.failedObjects += 1;
            report.failures.push({
              prefix,
              key: object.key,
              reason: error instanceof Error ? error.message : String(error),
            });
          }
        });
      }
    } finally {
      clearInterval(heartbeat);
      dependencies.logger.info(
        `Finished prefix ${prefix} in ${formatDuration(startedAt)}: listed=${prefixReport.listedObjects} listedBytes=${prefixReport.listedBytes} copied=${prefixReport.copiedObjects} copiedBytes=${prefixReport.copiedBytes} failed=${prefixReport.failedObjects}`
      );
    }
  }

  logAssetReport(dependencies.logger, report);

  if (
    !options.dryRun &&
    report.failures.length > 0 &&
    !options.ignoreMissingSourceAssets
  ) {
    throw new Error(`Asset migration completed with ${report.failures.length} failure(s)`);
  }

  return report;
};
