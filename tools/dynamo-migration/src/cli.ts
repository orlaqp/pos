import { LEGACY_MODEL_NAMES, TARGET_ONLY_MODEL_NAMES, type MigrationOptions, type MigratableModelName } from './types';

const parseBooleanFlag = (value: string | undefined): boolean =>
  value === 'true' || value === '1';

const parseModels = (value: string | undefined): MigratableModelName[] | undefined => {
  if (!value) {
    return undefined;
  }

  const allowed = new Set<string>([...LEGACY_MODEL_NAMES, ...TARGET_ONLY_MODEL_NAMES]);
  const models = value
    .split(',')
    .map((model) => model.trim())
    .filter(Boolean);

  for (const model of models) {
    if (!allowed.has(model)) {
      throw new Error(`Unsupported model "${model}"`);
    }
  }

  return models as MigratableModelName[];
};

const parsePositiveInteger = (
  value: string | undefined,
  flagName: string,
  defaultValue: number
): number => {
  if (!value) {
    return defaultValue;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    throw new Error(`${flagName} must be a positive integer`);
  }

  return parsed;
};

const parsePositiveNumber = (
  value: string | undefined,
  flagName: string
): number | undefined => {
  if (!value) {
    return undefined;
  }

  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${flagName} must be a positive number`);
  }

  return parsed;
};

export const parseArgs = (argv: string[]): MigrationOptions => {
  const args = new Map<string, string>();

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) {
      continue;
    }

    const key = token.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith('--')) {
      args.set(key, 'true');
      continue;
    }

    args.set(key, next);
    index += 1;
  }

  const sourceEnv = args.get('source-env');
  const targetEnv = args.get('target-env');
  const sourceProfile = args.get('source-profile');
  const targetProfile = args.get('target-profile');
  const tenantId = args.get('tenant-id');
  const sourceTenantId = args.get('source-tenant-id') ?? tenantId;
  const targetTenantId = args.get('target-tenant-id') ?? tenantId;
  const years = parsePositiveNumber(args.get('years'), '--years');
  const days = parsePositiveNumber(args.get('days'), '--days');

  if (
    !sourceEnv ||
    !targetEnv ||
    !sourceProfile ||
    !targetProfile ||
    !sourceTenantId ||
    !targetTenantId
  ) {
    throw new Error(
      'Missing required arguments: --source-env --target-env --source-profile --target-profile and either --tenant-id or both --source-tenant-id --target-tenant-id'
    );
  }

  if (years !== undefined && days !== undefined) {
    throw new Error('Use either --years or --days, not both');
  }

  return {
    sourceEnv,
    targetEnv,
    sourceProfile,
    targetProfile,
    tenantId: targetTenantId,
    sourceTenantId,
    targetTenantId,
    dryRun: parseBooleanFlag(args.get('dry-run')),
    models: parseModels(args.get('models')),
    parallelModels: parsePositiveInteger(args.get('parallel-models'), '--parallel-models', 1),
    years,
    days,
  };
};
