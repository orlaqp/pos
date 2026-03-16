import type { ResolvedEnvironment } from '../../dynamo-migration/src/types';
import type { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

export type Logger = {
  info: (message: string) => void;
  error: (message: string) => void;
};

export type SeedOptions = {
  tenantId: string;
  profile: string;
  targetEnv: string;
  dryRun: boolean;
  outputPath?: string;
};

export type SeedDependencies = {
  env: ResolvedEnvironment;
  documentClient: DynamoDBDocumentClient;
  logger: Logger;
};

export type StoreRecord = {
  id: string;
  tenantId: string;
  name: string;
  timezone?: string | null;
  createdAt?: string | null;
};

export type StationRecord = {
  id: string;
  tenantId: string;
  name: string;
};

export type EmployeeRecord = {
  id: string;
  tenantId: string;
  firstName: string;
  lastName?: string | null;
  email?: string | null;
  roles: string[];
};

export type CategoryRecord = {
  id: string;
  tenantId: string;
  name: string;
};

export type ProductRecord = {
  id: string;
  tenantId: string;
  name: string;
  price: number;
  unitOfMeasure: string;
  productCategoryId?: string | null;
  isEBTEligible?: boolean | null;
  discountable?: boolean | null;
};

export type DiscountDefinitionSeedRecord = {
  id: string;
  tenantId: string;
  name: string;
  code?: string | null;
  description?: string | null;
  status: 'ACTIVE' | 'DRAFT' | 'INACTIVE' | 'EXPIRED';
  type: 'MANUAL' | 'AUTOMATIC' | 'PROMO_CODE';
  method: 'PERCENT' | 'AMOUNT' | 'FINAL_PRICE';
  scope: 'LINE' | 'ORDER';
  value: number;
  priority?: number;
  stackMode: 'EXCLUSIVE' | 'STACKABLE' | 'BEST_PRICE_ONLY';
  approvalRequired?: boolean;
  reasonRequired?: boolean;
  startDate?: string | null;
  endDate?: string | null;
  daysOfWeek?: string[] | null;
  startTime?: string | null;
  endTime?: string | null;
  minSubtotal?: number | null;
  minQuantity?: number | null;
  usageLimitTotal?: number | null;
  usageCountTotal?: number | null;
  applicableProductIds?: string[] | null;
  applicableCategoryIds?: string[] | null;
  excludedProductIds?: string[] | null;
  excludedCategoryIds?: string[] | null;
  excludeAlreadyDiscountedItems?: boolean;
  appliesToAllProducts?: boolean;
  storeIds?: string[] | null;
  stationIds?: string[] | null;
  active: boolean;
};

export type EmployeeDiscountPolicySeedRecord = {
  id: string;
  tenantId: string;
  employeeId?: string | null;
  roleKey?: string | null;
  maxManualPercentDiscount?: number | null;
  maxManualAmountDiscount?: number | null;
  maxPriceOverrideAmount?: number | null;
  maxPriceOverridePercentBelowBase?: number | null;
  canApplyOrderDiscount?: boolean;
  canOverridePrice?: boolean;
  canApproveDiscounts?: boolean;
  canApprovePriceOverrides?: boolean;
  canUsePromoCodes?: boolean;
  requireReasonForManualDiscounts?: boolean;
  requireReasonForOverrides?: boolean;
  requireApprovalForOrderDiscount?: boolean;
  requireApprovalForAnyPriceOverride?: boolean;
  allowExclusiveDiscountOverride?: boolean;
  active: boolean;
};

export type TenantCatalogSnapshot = {
  tenantId: string;
  stores: StoreRecord[];
  stations: StationRecord[];
  employees: EmployeeRecord[];
  categories: CategoryRecord[];
  products: ProductRecord[];
  discountDefinitions: Array<Record<string, unknown>>;
  employeeDiscountPolicies: Array<Record<string, unknown>>;
};

export type SelectedSeedTargets = {
  store: StoreRecord | null;
  stations: StationRecord[];
  oilCategory: CategoryRecord;
  riceCategory: CategoryRecord;
  weightedCategory: CategoryRecord;
  excludedOilProduct: ProductRecord;
  nonExcludedOilProduct: ProductRecord;
  riceProduct: ProductRecord;
  weightedProduct: ProductRecord;
  ebtProduct: ProductRecord;
  nonEbtProduct: ProductRecord;
  adminEmployee: EmployeeRecord | null;
  salesEmployee: EmployeeRecord | null;
};

export type SeededDiscountSummary = {
  tenantId: string;
  storeId: string | null;
  stationIds: string[];
  selectedTargets: {
    oilCategory: string;
    riceCategory: string;
    weightedCategory: string;
    excludedOilProduct: string;
    nonExcludedOilProduct: string;
    riceProduct: string;
    weightedProduct: string;
    ebtProduct: string;
    nonEbtProduct: string;
    adminEmployee: string | null;
    salesEmployee: string | null;
  };
  createdOrUpdatedDiscountIds: string[];
  createdOrUpdatedPolicyIds: string[];
  qaPlanPath: string;
};

export type DryRunReport = SeededDiscountSummary & {
  discountNames: string[];
  promoCodes: string[];
};
