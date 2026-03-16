import { CloudFormationClient } from '@aws-sdk/client-cloudformation';
import { fromIni } from '@aws-sdk/credential-provider-ini';
import { S3Client } from '@aws-sdk/client-s3';

import { createInitialAssetReport, createPrefixReport, logAssetPreflight, logAssetReport } from './asset-reporter';
import { AssetSourceReader, AssetTargetWriter, createDefaultLogger } from './asset-s3';
import { assertAllowedAssetEnvironments, assertDistinctBuckets } from './asset-safety';
import { resolveStorageEnvironment } from './asset-storage-env';
import type {
  AssetMigrationOptions,
  AssetPrefixReport,
  Dependencies,
  ListedObject,
  Logger,
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
  const targetS3 = new S3Client({
    region: 'us-east-1',
    credentials: fromIni({ profile: options.targetProfile }),
  });

  return {
    sourceCf,
    targetCf,
    sourceS3,
    targetS3,
    logger: createDefaultLogger(),
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

  for (const prefix of options.prefixes) {
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
      const objects = await sourceReader.listPrefix(
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

      if (!options.dryRun) {
        await runWithConcurrency(objects, options.parallelObjects, async (object) => {
          try {
            await targetWriter.copyObject(object.key);
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

  if (!options.dryRun && report.failures.length > 0) {
    throw new Error(`Asset migration completed with ${report.failures.length} failure(s)`);
  }

  return report;
};
