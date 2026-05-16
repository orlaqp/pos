import type { Logger, MigrationOptions, MigrationReport, ResolvedEnvironment } from './types';

export const createInitialReport = (
  options: MigrationOptions,
  source: ResolvedEnvironment,
  target: ResolvedEnvironment
): MigrationReport => ({
  preflight: {
    sourceEnv: source.envName,
    sourceStack: source.stackName,
    sourceProfile: options.sourceProfile,
    sourceTables: Object.values(source.tables)
      .map((table) => `${table.modelName}:${table.physicalTableName}`)
      .sort(),
    targetEnv: target.envName,
    targetStack: target.stackName,
    targetProfile: options.targetProfile,
    targetTables: Object.values(target.tables)
      .map((table) => `${table.modelName}:${table.physicalTableName}`)
      .sort(),
    dryRun: options.dryRun,
    sourceTenantId: options.sourceTenantId,
    targetTenantId: options.targetTenantId,
    selectedModels: (options.models?.length ? options.models : undefined) ?? null,
    overwrite: true,
    operationalHistory: options.days
      ? `last ${options.days} day(s)`
      : options.years
        ? `last ${options.years} year(s)`
        : 'full',
  },
  models: [],
  failures: [],
});

export const logReport = (logger: Logger, report: MigrationReport) => {
  for (const model of report.models) {
    logger.info(
      `${model.modelName}: scanned=${model.scanned} filtered=${model.filtered} transformed=${model.transformed} written=${model.written} skipped=${model.skipped} failed=${model.failed}`
    );
  }

  if (report.failures.length > 0) {
    for (const failure of report.failures) {
      logger.error(`${failure.modelName} ${failure.id}: ${failure.reason}`);
    }
  }
};

export const logPreflight = (logger: Logger, report: MigrationReport) => {
  logger.info(`Source env: ${report.preflight.sourceEnv}`);
  logger.info(`Source stack: ${report.preflight.sourceStack}`);
  logger.info(`Source profile: ${report.preflight.sourceProfile}`);
  logger.info(`Source tables: ${report.preflight.sourceTables.join(', ')}`);
  logger.info(`Target env: ${report.preflight.targetEnv}`);
  logger.info(`Target stack: ${report.preflight.targetStack}`);
  logger.info(`Target profile: ${report.preflight.targetProfile}`);
  logger.info(`Target tables: ${report.preflight.targetTables.join(', ')}`);
  logger.info(`Source tenant id: ${report.preflight.sourceTenantId}`);
  logger.info(`Target tenant id: ${report.preflight.targetTenantId}`);
  logger.info(
    `Selected models: ${
      report.preflight.selectedModels?.join(', ') || 'default production cutover set'
    }`
  );
  logger.info(`Operational history: ${report.preflight.operationalHistory}`);
  logger.info('SOURCE IS READ-ONLY; NO WRITES TO DEVELOP WILL OCCUR');
  logger.info(report.preflight.dryRun ? 'Dry run: enabled' : 'Dry run: disabled');
  logger.info('Overwrite mode: enabled');
};
