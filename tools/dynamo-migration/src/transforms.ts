import type { MigratableModelName, ModelMigrationSpec, TransformResult } from './types';

const ensureRecordId = (item: Record<string, unknown>): string | null => {
  const id = item.id;
  return typeof id === 'string' && id.trim().length > 0 ? id : null;
};

const withTenant = (
  item: Record<string, unknown>,
  tenantId: string
): Record<string, unknown> => ({
  ...item,
  tenantId,
});

const rewriteTenantScopedAssetPath = (
  value: unknown,
  tenantId: string,
  kind: 'products' | 'categories'
) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return value;
  }

  const normalized = value.trim().replace(/^\/+/, '').replace(/^(public|protected|private)\//, '');
  const matcher = new RegExp(`(?:^|/)${kind}/(.+)$`);
  const match = normalized.match(matcher);
  const suffix = match?.[1] || normalized.split('/').pop();

  if (!suffix) {
    return value;
  }

  return `${tenantId}/${kind}/${suffix}`;
};

const transformGlobalSettings = (
  item: Record<string, unknown>,
  tenantId: string
): TransformResult => {
  const id = ensureRecordId(item);

  if (!id) {
    return {
      status: 'skip',
      reason: 'Missing required id',
    };
  }

  return {
    status: 'ok',
    item: {
      ...withTenant(item, tenantId),
      timezone:
        typeof item.timezone === 'string' && item.timezone.trim().length > 0
          ? item.timezone
          : 'America/New_York',
    },
  };
};

const transformStore = (
  item: Record<string, unknown>,
  tenantId: string
): TransformResult => ({
  status: 'ok',
  item: {
    ...withTenant(item, tenantId),
    timezone:
      typeof item.timezone === 'string' && item.timezone.trim().length > 0
        ? item.timezone
        : 'America/New_York',
  },
});

const transformCategory = (
  item: Record<string, unknown>,
  tenantId: string
): TransformResult => ({
  status: 'ok',
  item: {
    ...withTenant(item, tenantId),
    picture: rewriteTenantScopedAssetPath(item.picture, tenantId, 'categories'),
    discountable:
      typeof item.discountable === 'boolean' ? item.discountable : true,
    discountPolicyMode:
      typeof item.discountPolicyMode === 'string' &&
      item.discountPolicyMode.trim().length > 0
        ? item.discountPolicyMode
        : 'DEFAULT',
  },
});

const transformProduct = (
  item: Record<string, unknown>,
  tenantId: string
): TransformResult => ({
  status: 'ok',
  item: {
    ...withTenant(item, tenantId),
    picture: rewriteTenantScopedAssetPath(item.picture, tenantId, 'products'),
    discountable:
      typeof item.discountable === 'boolean' ? item.discountable : true,
  },
});

const transformDefault = (
  item: Record<string, unknown>,
  tenantId: string
): TransformResult => {
  const id = ensureRecordId(item);

  if (!id) {
    return {
      status: 'skip',
      reason: 'Missing required id',
    };
  }

  return {
    status: 'ok',
    item: withTenant(item, tenantId),
  };
};

const overrides: Partial<Record<MigratableModelName, ModelMigrationSpec['transform']>> = {
  Store: transformStore,
  Category: transformCategory,
  Product: transformProduct,
  GlobalSettings: transformGlobalSettings,
};

export const createModelSpecs = (
  modelNames: MigratableModelName[]
): ModelMigrationSpec[] =>
  modelNames.map((modelName) => ({
    modelName,
    transform: overrides[modelName] ?? transformDefault,
  }));
