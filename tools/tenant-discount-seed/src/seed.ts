import { DEFAULT_QA_OUTPUT_DIR } from './constants';
import { upsertItems } from './dynamo';
import { writeQaPlan } from './plan';
import { buildStableSeedId, selectSeedTargets } from './selection';
import type {
  DiscountDefinitionSeedRecord,
  DryRunReport,
  EmployeeDiscountPolicySeedRecord,
  SeedDependencies,
  SeedOptions,
  SeededDiscountSummary,
  TenantCatalogSnapshot,
} from './types';
import { TABLES } from './constants';

const definitionDescription = (label: string) =>
  `QA seed discount: ${label}. Safe to rerun because the id is deterministic per tenant.`;

export const buildSeedRecords = (
  snapshot: TenantCatalogSnapshot,
  options: SeedOptions
) => {
  const targets = selectSeedTargets(snapshot);
  const storeIds = targets.store ? [targets.store.id] : null;
  const stationIds = targets.stations.length ? [targets.stations[0].id] : null;
  const sundayStart = '08:00';
  const sundayEnd = '12:00';

  const definitions: DiscountDefinitionSeedRecord[] = [
    {
      id: buildStableSeedId(options.tenantId, 'definition-auto-oils-10'),
      tenantId: options.tenantId,
      name: 'QA Seed - Oils 10% Auto',
      description: definitionDescription('Automatic 10% on oil category'),
      status: 'ACTIVE',
      type: 'AUTOMATIC',
      method: 'PERCENT',
      scope: 'LINE',
      value: 10,
      priority: 10,
      stackMode: 'BEST_PRICE_ONLY',
      applicableCategoryIds: [targets.oilCategory.id],
      appliesToAllProducts: false,
      active: true,
    },
    {
      id: buildStableSeedId(options.tenantId, 'definition-auto-oils-exclusion-15'),
      tenantId: options.tenantId,
      name: 'QA Seed - Oils 15% Except Oliva',
      description: definitionDescription('Automatic 15% on oils except the excluded olive oil product'),
      status: 'ACTIVE',
      type: 'AUTOMATIC',
      method: 'PERCENT',
      scope: 'LINE',
      value: 15,
      priority: 20,
      stackMode: 'BEST_PRICE_ONLY',
      applicableCategoryIds: [targets.oilCategory.id],
      excludedProductIds: [targets.excludedOilProduct.id],
      appliesToAllProducts: false,
      active: true,
    },
    {
      id: buildStableSeedId(options.tenantId, 'definition-promo-save5'),
      tenantId: options.tenantId,
      name: 'QA Seed - Save $5 Over $30',
      code: 'SAVE5',
      description: definitionDescription('Order promo amount discount with a minimum subtotal'),
      status: 'ACTIVE',
      type: 'PROMO_CODE',
      method: 'AMOUNT',
      scope: 'ORDER',
      value: 5,
      priority: 30,
      stackMode: 'STACKABLE',
      minSubtotal: 30,
      active: true,
    },
    {
      id: buildStableSeedId(options.tenantId, 'definition-promo-rice15'),
      tenantId: options.tenantId,
      name: 'QA Seed - Rice 15% Promo',
      code: 'RICE15',
      description: definitionDescription('Line promo percent discount for rice category'),
      status: 'ACTIVE',
      type: 'PROMO_CODE',
      method: 'PERCENT',
      scope: 'LINE',
      value: 15,
      priority: 40,
      stackMode: 'STACKABLE',
      applicableCategoryIds: [targets.riceCategory.id],
      appliesToAllProducts: false,
      active: true,
    },
    {
      id: buildStableSeedId(options.tenantId, 'definition-manual-line10'),
      tenantId: options.tenantId,
      name: 'QA Seed - Manual Line 10%',
      description: definitionDescription('Manual line percent discount'),
      status: 'ACTIVE',
      type: 'MANUAL',
      method: 'PERCENT',
      scope: 'LINE',
      value: 10,
      priority: 50,
      stackMode: 'STACKABLE',
      reasonRequired: true,
      active: true,
    },
    {
      id: buildStableSeedId(options.tenantId, 'definition-manual-order5'),
      tenantId: options.tenantId,
      name: 'QA Seed - Manual Order $5',
      description: definitionDescription('Manual order amount discount'),
      status: 'ACTIVE',
      type: 'MANUAL',
      method: 'AMOUNT',
      scope: 'ORDER',
      value: 5,
      priority: 60,
      stackMode: 'STACKABLE',
      approvalRequired: true,
      reasonRequired: true,
      active: true,
    },
    {
      id: buildStableSeedId(options.tenantId, 'definition-promo-meat999'),
      tenantId: options.tenantId,
      name: 'QA Seed - Meat 9.99 Final Price',
      code: 'MEAT999',
      description: definitionDescription('Weighted-item final-price promo for meat category'),
      status: 'ACTIVE',
      type: 'PROMO_CODE',
      method: 'FINAL_PRICE',
      scope: 'LINE',
      value: 9.99,
      priority: 70,
      stackMode: 'EXCLUSIVE',
      applicableCategoryIds: [targets.weightedCategory.id],
      appliesToAllProducts: false,
      active: true,
    },
    {
      id: buildStableSeedId(options.tenantId, 'definition-auto-sunday-oils-store'),
      tenantId: options.tenantId,
      name: 'QA Seed - Sunday Oil Store Window',
      description: definitionDescription('Sunday morning store-scoped oil discount'),
      status: 'ACTIVE',
      type: 'AUTOMATIC',
      method: 'PERCENT',
      scope: 'LINE',
      value: 7,
      priority: 80,
      stackMode: 'STACKABLE',
      daysOfWeek: ['SUN'],
      startTime: sundayStart,
      endTime: sundayEnd,
      applicableCategoryIds: [targets.oilCategory.id],
      storeIds,
      stationIds,
      appliesToAllProducts: false,
      active: true,
    },
  ];

  const policies: EmployeeDiscountPolicySeedRecord[] = [
    {
      id: buildStableSeedId(options.tenantId, 'policy-admin-role'),
      tenantId: options.tenantId,
      roleKey: 'Admin',
      maxManualPercentDiscount: 25,
      maxManualAmountDiscount: 25,
      maxPriceOverrideAmount: 15,
      maxPriceOverridePercentBelowBase: 25,
      canApplyOrderDiscount: true,
      canOverridePrice: true,
      canApproveDiscounts: true,
      canApprovePriceOverrides: true,
      canUsePromoCodes: true,
      requireReasonForManualDiscounts: true,
      requireReasonForOverrides: true,
      requireApprovalForOrderDiscount: false,
      requireApprovalForAnyPriceOverride: false,
      allowExclusiveDiscountOverride: true,
      active: true,
    },
    {
      id: buildStableSeedId(options.tenantId, 'policy-sales-role'),
      tenantId: options.tenantId,
      roleKey: 'Sales',
      maxManualPercentDiscount: 10,
      maxManualAmountDiscount: 5,
      maxPriceOverrideAmount: 0,
      maxPriceOverridePercentBelowBase: 0,
      canApplyOrderDiscount: true,
      canOverridePrice: false,
      canApproveDiscounts: false,
      canApprovePriceOverrides: false,
      canUsePromoCodes: true,
      requireReasonForManualDiscounts: true,
      requireReasonForOverrides: true,
      requireApprovalForOrderDiscount: true,
      requireApprovalForAnyPriceOverride: true,
      allowExclusiveDiscountOverride: false,
      active: true,
    },
  ];

  return { targets, definitions, policies };
};

const buildSummary = (
  options: SeedOptions,
  qaPlanPath: string,
  definitions: DiscountDefinitionSeedRecord[],
  policies: EmployeeDiscountPolicySeedRecord[],
  targets: ReturnType<typeof selectSeedTargets>
): SeededDiscountSummary => ({
  tenantId: options.tenantId,
  storeId: targets.store?.id || null,
  stationIds: targets.stations.map((station) => station.id),
  selectedTargets: {
    oilCategory: `${targets.oilCategory.name} (${targets.oilCategory.id})`,
    riceCategory: `${targets.riceCategory.name} (${targets.riceCategory.id})`,
    weightedCategory: `${targets.weightedCategory.name} (${targets.weightedCategory.id})`,
    excludedOilProduct: `${targets.excludedOilProduct.name} (${targets.excludedOilProduct.id})`,
    nonExcludedOilProduct: `${targets.nonExcludedOilProduct.name} (${targets.nonExcludedOilProduct.id})`,
    riceProduct: `${targets.riceProduct.name} (${targets.riceProduct.id})`,
    weightedProduct: `${targets.weightedProduct.name} (${targets.weightedProduct.id})`,
    ebtProduct: `${targets.ebtProduct.name} (${targets.ebtProduct.id})`,
    nonEbtProduct: `${targets.nonEbtProduct.name} (${targets.nonEbtProduct.id})`,
    adminEmployee: targets.adminEmployee
      ? `${targets.adminEmployee.firstName} ${targets.adminEmployee.lastName || ''}`.trim()
      : null,
    salesEmployee: targets.salesEmployee
      ? `${targets.salesEmployee.firstName} ${targets.salesEmployee.lastName || ''}`.trim()
      : null,
  },
  createdOrUpdatedDiscountIds: definitions.map((definition) => definition.id),
  createdOrUpdatedPolicyIds: policies.map((policy) => policy.id),
  qaPlanPath,
});

export const seedTenantDiscounts = async (
  snapshot: TenantCatalogSnapshot,
  options: SeedOptions,
  deps: SeedDependencies
): Promise<DryRunReport> => {
  const { targets, definitions, policies } = buildSeedRecords(snapshot, options);
  const qaPlanPath = options.outputPath || `${DEFAULT_QA_OUTPUT_DIR}/${options.tenantId}-discount-qa.md`;
  const summary = buildSummary(options, qaPlanPath, definitions, policies, targets);
  const qaAbsolutePath = writeQaPlan(qaPlanPath, summary, definitions, targets);
  const report: DryRunReport = {
    ...summary,
    qaPlanPath: qaAbsolutePath,
    discountNames: definitions.map((definition) => definition.name),
    promoCodes: definitions
      .map((definition) => definition.code)
      .filter((code): code is string => !!code),
  };

  deps.logger.info(`Selected store: ${targets.store ? `${targets.store.name} (${targets.store.id})` : 'none'}`);
  deps.logger.info(`Selected oil category: ${targets.oilCategory.name}`);
  deps.logger.info(`Selected rice category: ${targets.riceCategory.name}`);
  deps.logger.info(`Selected weighted category: ${targets.weightedCategory.name}`);
  deps.logger.info(`QA plan written to ${qaAbsolutePath}`);

  if (options.dryRun) {
    return report;
  }

  const definitionTable = deps.env.tables[TABLES.discountDefinition]?.physicalTableName;
  const policyTable = deps.env.tables[TABLES.employeeDiscountPolicy]?.physicalTableName;
  if (!definitionTable || !policyTable) {
    throw new Error(`Unable to resolve discount tables in ${deps.env.envName}`);
  }

  await upsertItems(
    deps.documentClient,
    definitionTable,
    definitions,
    snapshot.discountDefinitions
  );
  await upsertItems(
    deps.documentClient,
    policyTable,
    policies,
    snapshot.employeeDiscountPolicies
  );

  return report;
};
