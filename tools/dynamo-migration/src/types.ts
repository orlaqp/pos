import type {
  CloudFormationClient,
} from '@aws-sdk/client-cloudformation';
import type { DynamoDBClient } from '@aws-sdk/client-dynamodb';

export const SOURCE_ENVS = ['develop', 'ebtdev', 'uat', 'prod'] as const;
export const TARGET_ENVS = ['ebtdev', 'uat', 'prod'] as const;

export const LEGACY_MODEL_NAMES = [
  'Store',
  'Brand',
  'Category',
  'Customer',
  'Employee',
  'Order',
  'Product',
  'UnitOfMeasure',
  'InventoryChanges',
  'InventoryCount',
  'InventoryCountLine',
  'InventoryReceive',
  'InventoryReceiveLine',
  'Printer',
  'Station',
  'GlobalSettings',
] as const;

export const TARGET_ONLY_MODEL_NAMES = [
  'DiscountDefinition',
  'DiscountReasonCode',
  'EmployeeDiscountPolicy',
  'DiscountPreset',
  'DiscountApplication',
  'ApprovalEvent',
  'DiscountReconciliationException',
] as const;

export const ACCOUNT_MODEL_NAMES = ['Tenant', 'TenantUser'] as const;

export type LegacyModelName = (typeof LEGACY_MODEL_NAMES)[number];
export type TargetOnlyModelName = (typeof TARGET_ONLY_MODEL_NAMES)[number];
export type AccountModelName = (typeof ACCOUNT_MODEL_NAMES)[number];
export type MigratableModelName = LegacyModelName | TargetOnlyModelName;
export type ModelName = MigratableModelName | AccountModelName;

export type EnvConfig = {
  envName: string;
  region: string;
  stackName: string;
  amplifyAppId: string;
};

export type TableMapping = {
  modelName: ModelName;
  logicalResourceId: string;
  physicalTableName: string;
};

export type ResolvedEnvironment = {
  envName: string;
  region: string;
  stackName: string;
  profile: string;
  tables: Record<string, TableMapping>;
};

export type MigrationOptions = {
  sourceEnv: string;
  targetEnv: string;
  sourceProfile: string;
  targetProfile: string;
  tenantId: string;
  sourceTenantId: string;
  targetTenantId: string;
  dryRun: boolean;
  models?: MigratableModelName[];
  parallelModels: number;
  years?: number;
  days?: number;
};

export type Logger = {
  info: (message: string) => void;
  error: (message: string) => void;
};

export type ScanProgress = {
  page: number;
  itemCount: number;
  totalSoFar: number;
  hasMore: boolean;
};

export type SourceReader = {
  scanTable: (
    tableName: string,
    tenantId?: string,
    onProgress?: (progress: ScanProgress) => void
  ) => Promise<Record<string, unknown>[]>;
};

export type TargetWriter = {
  writeItem: (tableName: string, item: Record<string, unknown>) => Promise<void>;
};

export type Dependencies = {
  sourceCf: CloudFormationClient;
  targetCf: CloudFormationClient;
  sourceDynamo: DynamoDBClient;
  targetDynamo: DynamoDBClient;
  logger: Logger;
};

export type TransformSuccess = {
  status: 'ok';
  item: Record<string, unknown>;
};

export type TransformSkip = {
  status: 'skip';
  reason: string;
};

export type TransformResult = TransformSuccess | TransformSkip;

export type ModelMigrationSpec = {
  modelName: MigratableModelName;
  transform: (
    item: Record<string, unknown>,
    tenantId: string
  ) => TransformResult;
};

export type ModelReport = {
  modelName: string;
  sourceTable: string | null;
  targetTable: string | null;
  scanned: number;
  filtered: number;
  transformed: number;
  written: number;
  skipped: number;
  failed: number;
};

export type FailureRecord = {
  modelName: string;
  id: string;
  reason: string;
};

export type MigrationReport = {
  preflight: {
    sourceEnv: string;
    sourceStack: string;
    sourceProfile: string;
    sourceTables: string[];
    targetEnv: string;
    targetStack: string;
    targetProfile: string;
    targetTables: string[];
    dryRun: boolean;
    sourceTenantId: string;
    targetTenantId: string;
    selectedModels: MigratableModelName[] | null;
    overwrite: boolean;
    operationalHistory: string;
  };
  models: ModelReport[];
  failures: FailureRecord[];
};
