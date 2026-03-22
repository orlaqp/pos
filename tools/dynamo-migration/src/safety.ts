import { SOURCE_ENV, TARGET_ENVS, type MigrationOptions, type ResolvedEnvironment } from './types';

export const assertAllowedEnvironments = (options: MigrationOptions) => {
  if (options.sourceEnv === options.targetEnv) {
    throw new Error('Source and target environments must be different');
  }

  if (options.targetEnv === SOURCE_ENV) {
    throw new Error('Target environment cannot be develop');
  }

  if (options.sourceEnv !== SOURCE_ENV) {
    throw new Error(`Source environment must be "${SOURCE_ENV}"`);
  }

  if (!TARGET_ENVS.includes(options.targetEnv as (typeof TARGET_ENVS)[number])) {
    throw new Error(`Target environment must be one of: ${TARGET_ENVS.join(', ')}`);
  }
};

export const assertDistinctTables = (
  source: ResolvedEnvironment,
  target: ResolvedEnvironment
) => {
  const sharedTables = Object.values(source.tables)
    .flatMap((sourceTable) => {
      const targetTable = target.tables[sourceTable.modelName];
      if (
        targetTable &&
        targetTable.physicalTableName === sourceTable.physicalTableName
      ) {
        return [sourceTable.physicalTableName];
      }

      return [];
    });

  if (sharedTables.length > 0) {
    throw new Error(
      `Source and target resolve to the same physical table(s): ${sharedTables.join(', ')}`
    );
  }
};

export const assertWriteTargetTable = (
  tableName: string,
  source: ResolvedEnvironment,
  target: ResolvedEnvironment
) => {
  const sourceTables = new Set(
    Object.values(source.tables).map((table) => table.physicalTableName)
  );
  const targetTables = new Set(
    Object.values(target.tables).map((table) => table.physicalTableName)
  );

  if (sourceTables.has(tableName)) {
    throw new Error(`Refusing to write to source table "${tableName}"`);
  }

  if (!targetTables.has(tableName)) {
    throw new Error(`Refusing to write to non-target table "${tableName}"`);
  }
};
