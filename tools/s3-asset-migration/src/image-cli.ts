import {
  IMAGE_MODELS,
  type ImageMigrationOptions,
  type ImageModel,
} from './image-types';

const parseBooleanFlag = (value: string | undefined): boolean =>
  value === 'true' || value === '1';

const parsePositiveInteger = (
  value: string | undefined,
  flagName: string
): number | undefined => {
  if (!value) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    throw new Error(`${flagName} must be a positive integer`);
  }

  return parsed;
};

const parseModels = (value: string | undefined): ImageModel[] => {
  if (!value) {
    return [...IMAGE_MODELS];
  }

  const normalized = Array.from(
    new Set(
      value
        .split(',')
        .map((entry) => entry.trim().toLowerCase())
        .filter(Boolean)
    )
  );

  if (normalized.length === 0) {
    throw new Error('--models must include at least one model');
  }

  const invalid = normalized.filter(
    (entry): entry is string => !IMAGE_MODELS.includes(entry as ImageModel)
  );

  if (invalid.length > 0) {
    throw new Error(
      `--models must be a comma-separated subset of: ${IMAGE_MODELS.join(', ')}`
    );
  }

  return normalized as ImageModel[];
};

export const parseImageArgs = (argv: string[]): ImageMigrationOptions => {
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

  const env = args.get('env');
  const profile = args.get('profile');

  if (!env || !profile) {
    throw new Error('Missing required arguments: --env --profile');
  }

  const apply = parseBooleanFlag(args.get('apply'));

  return {
    env,
    profile,
    tenantId: args.get('tenant-id'),
    models: parseModels(args.get('models')),
    outputDir: args.get('output-dir'),
    limit: parsePositiveInteger(args.get('limit'), '--limit'),
    apply,
    dryRun: !apply,
  };
};
