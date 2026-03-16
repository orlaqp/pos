import { CloudFormationClient } from '@aws-sdk/client-cloudformation';
import { fromIni } from '@aws-sdk/credential-provider-ini';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

import { loadEnvConfig, resolveEnvironment } from './amplify-env';
import { createInitialReport, logPreflight, logReport } from './reporter';
import { assertAllowedEnvironments, assertDistinctTables } from './safety';
import { DynamoSourceReader } from './source-reader';
import { DynamoTargetWriter } from './target-writer';
import { createModelSpecs } from './transforms';
import {
  LEGACY_MODEL_NAMES,
  type Dependencies,
  type LegacyModelName,
  type Logger,
  type MigrationOptions,
  type MigrationReport,
} from './types';

const defaultLogger: Logger = {
  info: (message: string) => console.log(message),
  error: (message: string) => console.error(message),
};

const HEARTBEAT_INTERVAL_MS = 15_000;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const RECENT_TRANSACTION_MODELS: ReadonlySet<string> = new Set([
  'Order',
  'InventoryCount',
  'InventoryReceive',
] as const);
const PARENT_DEPENDENCIES: Partial<Record<LegacyModelName, LegacyModelName[]>> = {
  InventoryCountLine: ['InventoryCount'],
  InventoryReceiveLine: ['InventoryReceive'],
};

type ParentRetentionState = {
  InventoryCount: Set<string>;
  InventoryReceive: Set<string>;
};

const isAuthorizationError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes('is not authorized to perform') ||
    message.includes('AccessDeniedException') ||
    message.includes('not authorized')
  );
};

const formatDuration = (startedAt: number) => {
  const elapsedMs = Date.now() - startedAt;
  const totalSeconds = Math.max(0, Math.round(elapsedMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
};

const getRecentCutoffIso = () =>
  new Date(Date.now() - THIRTY_DAYS_MS).toISOString();

const getString = (item: Record<string, unknown>, key: string) => {
  const value = item[key];
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
};

const isOnOrAfterIso = (value: string | null, cutoffIso: string) =>
  value !== null && value >= cutoffIso;

const filterSourceItems = (
  modelName: LegacyModelName,
  sourceItems: Record<string, unknown>[],
  cutoffIso: string,
  retentionState: ParentRetentionState
) => {
  if (modelName === 'Order') {
    return sourceItems.filter((item) =>
      isOnOrAfterIso(getString(item, 'createdAt') ?? getString(item, 'orderDate'), cutoffIso)
    );
  }

  if (modelName === 'InventoryCount') {
    const filtered = sourceItems.filter((item) =>
      isOnOrAfterIso(getString(item, 'createdAt'), cutoffIso)
    );
    retentionState.InventoryCount = new Set(
      filtered
        .map((item) => getString(item, 'id'))
        .filter((value): value is string => !!value)
    );
    return filtered;
  }

  if (modelName === 'InventoryCountLine') {
    return sourceItems.filter((item) => {
      const parentId = getString(item, 'inventoryCountLineInventoryCountId');
      return !!parentId && retentionState.InventoryCount.has(parentId);
    });
  }

  if (modelName === 'InventoryReceive') {
    const filtered = sourceItems.filter((item) =>
      isOnOrAfterIso(getString(item, 'createdAt'), cutoffIso)
    );
    retentionState.InventoryReceive = new Set(
      filtered
        .map((item) => getString(item, 'id'))
        .filter((value): value is string => !!value)
    );
    return filtered;
  }

  if (modelName === 'InventoryReceiveLine') {
    return sourceItems.filter((item) => {
      const parentId = getString(item, 'inventoryReceiveLineInventoryReceiveId');
      return !!parentId && retentionState.InventoryReceive.has(parentId);
    });
  }

  return sourceItems;
};

const runWithConcurrency = async (
  tasks: Array<() => Promise<void>>,
  concurrency: number
) => {
  const workerCount = Math.max(1, Math.min(concurrency, tasks.length || 1));
  let nextIndex = 0;

  const runWorker = async () => {
    while (nextIndex < tasks.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      await tasks[currentIndex]();
    }
  };

  await Promise.all(Array.from({ length: workerCount }, () => runWorker()));
};

const createDependencies = (
  options: MigrationOptions
): Dependencies => {
  const sourceConfig = loadEnvConfig(options.sourceEnv);
  const targetConfig = loadEnvConfig(options.targetEnv);
  const sourceCf = new CloudFormationClient({
    region: sourceConfig.region,
    credentials: fromIni({ profile: options.sourceProfile }),
  });
  const targetCf = new CloudFormationClient({
    region: targetConfig.region,
    credentials: fromIni({ profile: options.targetProfile }),
  });
  const sourceDynamo = new DynamoDBClient({
    region: sourceConfig.region,
    credentials: fromIni({ profile: options.sourceProfile }),
  });
  const targetDynamo = new DynamoDBClient({
    region: targetConfig.region,
    credentials: fromIni({ profile: options.targetProfile }),
  });

  return {
    sourceCf,
    targetCf,
    sourceDynamo,
    targetDynamo,
    logger: defaultLogger,
  };
};

export const runMigration = async (
  options: MigrationOptions,
  providedDependencies?: Partial<Dependencies>
): Promise<MigrationReport> => {
  assertAllowedEnvironments(options);

  const dependencies =
    providedDependencies?.sourceCf &&
    providedDependencies?.targetCf &&
    providedDependencies?.sourceDynamo &&
    providedDependencies?.targetDynamo &&
    providedDependencies?.logger
      ? (providedDependencies as Dependencies)
      : ({
          ...createDependencies(options),
          ...providedDependencies,
        } as Dependencies);

  const sourceEnv = await resolveEnvironment(
    dependencies.sourceCf,
    options.sourceProfile,
    options.sourceEnv
  );
  const targetEnv = await resolveEnvironment(
    dependencies.targetCf,
    options.targetProfile,
    options.targetEnv
  );

  assertDistinctTables(sourceEnv, targetEnv);

  const report = createInitialReport(options, sourceEnv, targetEnv);
  logPreflight(dependencies.logger, report);
  const sourceReader = new DynamoSourceReader(dependencies.sourceDynamo);
  const targetWriter = new DynamoTargetWriter(
    dependencies.targetDynamo,
    sourceEnv,
    targetEnv
  );
  const selectedModels =
    options.models && options.models.length > 0 ? options.models : [...LEGACY_MODEL_NAMES];
  const specs = createModelSpecs(selectedModels as LegacyModelName[]);
  const recentCutoffIso = getRecentCutoffIso();
  const retentionState: ParentRetentionState = {
    InventoryCount: new Set<string>(),
    InventoryReceive: new Set<string>(),
  };
  const modelReports = specs.map((spec) => {
    const sourceTable = sourceEnv.tables[spec.modelName]?.physicalTableName ?? null;
    const targetTable = targetEnv.tables[spec.modelName]?.physicalTableName ?? null;
    return {
      modelName: spec.modelName,
      sourceTable,
      targetTable,
      scanned: 0,
      filtered: 0,
      transformed: 0,
      written: 0,
      skipped: 0,
      failed: 0,
    };
  });

  report.models.push(...modelReports);
  dependencies.logger.info(
    `Parallel model workers: ${options.parallelModels}`
  );
  dependencies.logger.info(
    `Selected models: ${specs.map((spec) => spec.modelName).join(', ')}`
  );
  dependencies.logger.info(
    `Recent transaction cutoff: ${recentCutoffIso} (applies to Order, InventoryCount, InventoryReceive, and dependent line tables)`
  );

  const completedModels = new Set<LegacyModelName>();
  const pendingSpecs = specs.map((spec, index) => ({ spec, index }));

  while (pendingSpecs.length > 0) {
    const readyBatch = pendingSpecs.filter(({ spec }) => {
      const dependenciesForSpec = PARENT_DEPENDENCIES[spec.modelName] ?? [];
      return dependenciesForSpec.every((dependency) => completedModels.has(dependency));
    });

    if (readyBatch.length === 0) {
      throw new Error(
        `Unable to schedule migration models because dependencies could not be resolved: ${pendingSpecs
          .map(({ spec }) => spec.modelName)
          .join(', ')}`
      );
    }

    await runWithConcurrency(
      readyBatch.map(({ spec, index }) => async () => {
      const modelReport = modelReports[index];
      const { sourceTable, targetTable } = modelReport;
      const startedAt = Date.now();
      dependencies.logger.info(
        `Starting model ${spec.modelName} [${index + 1}/${specs.length}] (${sourceTable ?? 'missing source'} -> ${targetTable ?? 'missing target'})`
      );

      const heartbeat = setInterval(() => {
        dependencies.logger.info(
          `[${spec.modelName}] heartbeat after ${formatDuration(startedAt)}: scanned=${modelReport.scanned} transformed=${modelReport.transformed} written=${modelReport.written} skipped=${modelReport.skipped} failed=${modelReport.failed}`
        );
      }, HEARTBEAT_INTERVAL_MS);

      try {
        if (!sourceTable || !targetTable) {
          modelReport.failed += 1;
          report.failures.push({
            modelName: spec.modelName,
            id: 'MODEL',
            reason: `Missing ${!sourceTable ? 'source' : 'target'} table mapping`,
          });
          return;
        }

        const sourceItems = await sourceReader.scanTable(sourceTable, (progress) => {
          modelReport.scanned = progress.totalSoFar;
          dependencies.logger.info(
            `[${spec.modelName}] scanned page ${progress.page}: +${progress.itemCount} items (${progress.totalSoFar} total${progress.hasMore ? ', more pages' : ''})`
          );
        });
        modelReport.scanned = sourceItems.length;
        const filteredItems = filterSourceItems(
          spec.modelName,
          sourceItems,
          recentCutoffIso,
          retentionState
        );
        modelReport.filtered = filteredItems.length;
        if (RECENT_TRANSACTION_MODELS.has(spec.modelName)) {
          dependencies.logger.info(
            `[${spec.modelName}] retained ${filteredItems.length} of ${sourceItems.length} records after cutoff ${recentCutoffIso}`
          );
        } else if (
          spec.modelName === 'InventoryCountLine' ||
          spec.modelName === 'InventoryReceiveLine'
        ) {
          dependencies.logger.info(
            `[${spec.modelName}] retained ${filteredItems.length} of ${sourceItems.length} records based on migrated parent ids`
          );
        }

        for (const sourceItem of filteredItems) {
          const result = spec.transform(sourceItem, options.tenantId);

          if (result.status === 'skip') {
            modelReport.skipped += 1;
            report.failures.push({
              modelName: spec.modelName,
              id: typeof sourceItem.id === 'string' ? sourceItem.id : 'UNKNOWN',
              reason: result.reason,
            });
            continue;
          }

          modelReport.transformed += 1;

          if (options.dryRun) {
            continue;
          }

          try {
            await targetWriter.writeItem(targetTable, result.item);
            modelReport.written += 1;
          } catch (error) {
            modelReport.failed += 1;
            const reason = error instanceof Error ? error.message : String(error);
            report.failures.push({
              modelName: spec.modelName,
              id: typeof result.item.id === 'string' ? result.item.id : 'UNKNOWN',
              reason,
            });
            if (isAuthorizationError(error)) {
              throw new Error(
                `Authorization failure while writing ${spec.modelName} to ${targetTable}: ${reason}`
              );
            }
          }
        }
      } finally {
        clearInterval(heartbeat);
        dependencies.logger.info(
          `Finished model ${spec.modelName} in ${formatDuration(startedAt)}: scanned=${modelReport.scanned} filtered=${modelReport.filtered} transformed=${modelReport.transformed} written=${modelReport.written} skipped=${modelReport.skipped} failed=${modelReport.failed}`
        );
      }
      }),
      options.parallelModels
    );

    for (const { spec } of readyBatch) {
      completedModels.add(spec.modelName);
      const pendingIndex = pendingSpecs.findIndex(
        (pending) => pending.spec.modelName === spec.modelName
      );
      if (pendingIndex >= 0) {
        pendingSpecs.splice(pendingIndex, 1);
      }
    }
  }

  logReport(dependencies.logger, report);

  if (!options.dryRun && report.failures.length > 0) {
    throw new Error(`Migration completed with ${report.failures.length} failure(s)`);
  }

  return report;
};
