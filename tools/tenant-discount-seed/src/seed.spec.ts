import { buildSeedRecords } from './seed';
import { buildStableSeedId, selectSeedTargets } from './selection';
import type { TenantCatalogSnapshot } from './types';

const snapshot: TenantCatalogSnapshot = {
  tenantId: 'tenant-1',
  stores: [
    { id: 'store-2', tenantId: 'tenant-1', name: 'Other Store' },
    { id: 'store-1', tenantId: 'tenant-1', name: 'Bincrafters' },
  ],
  stations: [],
  employees: [
    { id: 'emp-admin', tenantId: 'tenant-1', firstName: 'Admin', roles: ['Admin'] },
    { id: 'emp-sales', tenantId: 'tenant-1', firstName: 'Cashier', roles: ['Sales'] },
  ],
  categories: [
    { id: 'cat-oils', tenantId: 'tenant-1', name: 'ACEITES' },
    { id: 'cat-rice', tenantId: 'tenant-1', name: 'ARROZ' },
    { id: 'cat-meat', tenantId: 'tenant-1', name: 'RES' },
  ],
  products: [
    {
      id: 'prod-oil-olive',
      tenantId: 'tenant-1',
      name: 'Aceite Oliva',
      price: 10,
      productCategoryId: 'cat-oils',
      unitOfMeasure: 'ea',
      isEBTEligible: true,
    },
    {
      id: 'prod-oil-corn',
      tenantId: 'tenant-1',
      name: 'Aceite Maiz',
      price: 8,
      productCategoryId: 'cat-oils',
      unitOfMeasure: 'ea',
      isEBTEligible: false,
    },
    {
      id: 'prod-rice',
      tenantId: 'tenant-1',
      name: 'Arroz',
      price: 6,
      productCategoryId: 'cat-rice',
      unitOfMeasure: 'ea',
      isEBTEligible: true,
    },
    {
      id: 'prod-meat',
      tenantId: 'tenant-1',
      name: 'Vacio',
      price: 12,
      productCategoryId: 'cat-meat',
      unitOfMeasure: 'lb',
      isEBTEligible: false,
    },
  ],
  discountDefinitions: [],
  employeeDiscountPolicies: [],
};

describe('tenant discount seed', () => {
  it('selects preferred real targets from the catalog', () => {
    const targets = selectSeedTargets(snapshot);

    expect(targets.store?.id).toBe('store-1');
    expect(targets.oilCategory.name).toBe('ACEITES');
    expect(targets.riceCategory.name).toBe('ARROZ');
    expect(targets.weightedCategory.name).toBe('RES');
    expect(targets.excludedOilProduct.id).toBe('prod-oil-olive');
    expect(targets.nonExcludedOilProduct.id).toBe('prod-oil-corn');
    expect(targets.weightedProduct.id).toBe('prod-meat');
  });

  it('builds deterministic ids and rerunnable seed records', () => {
    const first = buildSeedRecords(snapshot, {
      tenantId: 'tenant-1',
      profile: 'pos',
      targetEnv: 'ebtdev',
      dryRun: true,
    });
    const second = buildSeedRecords(snapshot, {
      tenantId: 'tenant-1',
      profile: 'pos',
      targetEnv: 'ebtdev',
      dryRun: true,
    });

    expect(first.definitions.map((definition) => definition.id)).toEqual(
      second.definitions.map((definition) => definition.id)
    );
    expect(first.policies.map((policy) => policy.id)).toEqual(
      second.policies.map((policy) => policy.id)
    );
    expect(first.definitions.map((definition) => definition.id)).toContain(
      buildStableSeedId('tenant-1', 'definition-promo-save5')
    );
  });
});
