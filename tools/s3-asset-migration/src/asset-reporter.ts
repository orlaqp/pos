import type {
  AssetMigrationOptions,
  AssetMigrationReport,
  AssetPrefix,
  AssetPrefixReport,
  Logger,
  StorageEnvironment,
} from './asset-types';

export const createInitialAssetReport = (
  options: AssetMigrationOptions,
  source: StorageEnvironment,
  target: StorageEnvironment
): AssetMigrationReport => ({
  preflight: {
    sourceEnv: source.envName,
    sourceStack: source.stackName,
    sourceProfile: options.sourceProfile,
    sourceBucket: source.bucketName,
    targetEnv: target.envName,
    targetStack: target.stackName,
    targetProfile: options.targetProfile,
    targetBucket: target.bucketName,
    sourceTenantId: options.sourceTenantId ?? null,
    targetTenantId: options.targetTenantId ?? null,
    prefixes: options.prefixes,
    dryRun: options.dryRun,
    parallelObjects: options.parallelObjects,
    overwrite: true,
    ignoreMissingSourceAssets: options.ignoreMissingSourceAssets ?? false,
    selectionMode: options.sourceTenantId ? 'tenant-record-keys' : 'source-record-keys',
  },
  prefixes: [],
  failures: [],
});

export const createPrefixReport = (prefix: AssetPrefix): AssetPrefixReport => ({
  prefix,
  listedObjects: 0,
  listedBytes: 0,
  copiedObjects: 0,
  copiedBytes: 0,
  failedObjects: 0,
});

export const logAssetPreflight = (logger: Logger, report: AssetMigrationReport) => {
  logger.info(`Source env: ${report.preflight.sourceEnv}`);
  logger.info(`Source stack: ${report.preflight.sourceStack}`);
  logger.info(`Source profile: ${report.preflight.sourceProfile}`);
  logger.info(`Source bucket: ${report.preflight.sourceBucket}`);
  logger.info(`Target env: ${report.preflight.targetEnv}`);
  logger.info(`Target stack: ${report.preflight.targetStack}`);
  logger.info(`Target profile: ${report.preflight.targetProfile}`);
  logger.info(`Target bucket: ${report.preflight.targetBucket}`);
  logger.info(
    `Target tenant id: ${report.preflight.targetTenantId ?? 'not provided'}`
  );
  logger.info(
    `Source tenant id: ${
      report.preflight.sourceTenantId ?? 'not provided'
    }`
  );
  logger.info(`Selection mode: ${report.preflight.selectionMode}`);
  logger.info(`Prefixes: ${report.preflight.prefixes.join(', ')}`);
  logger.info(`Parallel object workers: ${report.preflight.parallelObjects}`);
  logger.info('SOURCE IS READ-ONLY; NO WRITES TO DEVELOP WILL OCCUR');
  logger.info(report.preflight.dryRun ? 'Dry run: enabled' : 'Dry run: disabled (--apply)');
  logger.info('Overwrite mode: enabled');
  logger.info(
    `Ignore missing source assets: ${report.preflight.ignoreMissingSourceAssets ? 'enabled' : 'disabled'}`
  );
};

export const logAssetReport = (logger: Logger, report: AssetMigrationReport) => {
  for (const prefix of report.prefixes) {
    logger.info(
      `${prefix.prefix}: listed=${prefix.listedObjects} listedBytes=${prefix.listedBytes} copied=${prefix.copiedObjects} copiedBytes=${prefix.copiedBytes} failed=${prefix.failedObjects}`
    );
  }

  if (report.failures.length > 0) {
    for (const failure of report.failures) {
      logger.error(`${failure.prefix} ${failure.key}: ${failure.reason}`);
    }
  }
};
