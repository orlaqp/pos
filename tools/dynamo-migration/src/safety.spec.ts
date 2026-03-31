import { assertAllowedEnvironments, assertDistinctTables, assertWriteTargetTable } from './safety';
import type { MigrationOptions, ResolvedEnvironment } from './types';

const baseOptions: MigrationOptions = {
  sourceEnv: 'develop',
  targetEnv: 'ebtdev',
  sourceProfile: 'src',
  targetProfile: 'dst',
  tenantId: 'tenant-1',
  dryRun: true,
  parallelModels: 1,
};

const sourceEnv: ResolvedEnvironment = {
  envName: 'develop',
  region: 'us-east-1',
  stackName: 'source-stack',
  profile: 'src',
  tables: {
    Store: {
      modelName: 'Store',
      logicalResourceId: 'Store',
      physicalTableName: 'Store-source',
    },
  },
};

const targetEnv: ResolvedEnvironment = {
  envName: 'ebtdev',
  region: 'us-east-1',
  stackName: 'target-stack',
  profile: 'dst',
  tables: {
    Store: {
      modelName: 'Store',
      logicalResourceId: 'Store',
      physicalTableName: 'Store-target',
    },
  },
};

describe('safety', () => {
  it('accepts prod as a valid target env', () => {
    expect(() =>
      assertAllowedEnvironments({
        ...baseOptions,
        targetEnv: 'prod',
      })
    ).not.toThrow();
  });

  it('rejects same source and target env', () => {
    expect(() =>
      assertAllowedEnvironments({
        ...baseOptions,
        targetEnv: 'develop',
      })
    ).toThrow('Source and target environments must be different');
  });

  it('rejects target develop', () => {
    expect(() =>
      assertAllowedEnvironments({
        ...baseOptions,
        sourceEnv: 'staging',
        targetEnv: 'develop',
      })
    ).toThrow('Target environment cannot be develop');
  });

  it('rejects unsupported target env', () => {
    expect(() =>
      assertAllowedEnvironments({
        ...baseOptions,
        targetEnv: 'staging',
      })
    ).toThrow('Target environment must be one of: ebtdev, prod');
  });

  it('rejects identical physical tables', () => {
    expect(() =>
      assertDistinctTables(sourceEnv, {
        ...targetEnv,
        tables: {
          Store: {
            ...targetEnv.tables.Store,
            physicalTableName: 'Store-source',
          },
        },
      })
    ).toThrow('same physical table');
  });

  it('rejects writes routed to source tables', () => {
    expect(() =>
      assertWriteTargetTable('Store-source', sourceEnv, targetEnv)
    ).toThrow('source table');
  });
});
