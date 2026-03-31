import {
  DEFAULT_PARALLEL_OBJECTS,
  DEFAULT_PREFIXES,
  type AssetMigrationOptions,
  type AssetPrefix,
} from './asset-types';

const parseBooleanFlag = (value: string | undefined): boolean =>
  value === 'true' || value === '1';

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

const normalizePrefix = (prefix: string): AssetPrefix =>
  prefix.endsWith('/') ? prefix : `${prefix}/`;

const parsePrefixes = (value: string | undefined): AssetPrefix[] => {
  if (!value) {
    return [...DEFAULT_PREFIXES];
  }

  const prefixes = value
    .split(',')
    .map((prefix) => prefix.trim())
    .filter(Boolean);

  if (prefixes.length === 0) {
    throw new Error('--prefixes must include at least one prefix');
  }

  return Array.from(new Set(prefixes.map(normalizePrefix)));
};

export const parseAssetArgs = (argv: string[]): AssetMigrationOptions => {
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
  const sourceTenantId = args.get('source-tenant-id');
  const targetTenantId = args.get('target-tenant-id') ?? args.get('tenant-id');

  if (!sourceEnv || !targetEnv || !sourceProfile || !targetProfile) {
    throw new Error(
      'Missing required arguments: --source-env --target-env --source-profile --target-profile'
    );
  }

  const apply = parseBooleanFlag(args.get('apply'));

  return {
    sourceEnv,
    targetEnv,
    sourceProfile,
    targetProfile,
    sourceTenantId,
    targetTenantId,
    ignoreMissingSourceAssets: parseBooleanFlag(args.get('ignore-missing-source-assets')),
    apply,
    dryRun: !apply,
    parallelObjects: parsePositiveInteger(
      args.get('parallel-objects'),
      '--parallel-objects',
      DEFAULT_PARALLEL_OBJECTS
    ),
    prefixes: parsePrefixes(args.get('prefixes')),
  };
};
