export type DiscountDefinitionStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
export type DiscountDefinitionType = 'MANUAL' | 'AUTOMATIC' | 'PROMO_CODE';
export type DiscountMethod = 'PERCENT' | 'AMOUNT' | 'FINAL_PRICE';
export type DiscountScope = 'LINE' | 'ORDER';
export type DiscountStackMode = 'EXCLUSIVE' | 'STACKABLE' | 'BEST_PRICE_ONLY';
export type DiscountApplicationType =
  | 'MANUAL_LINE_DISCOUNT'
  | 'MANUAL_ORDER_DISCOUNT'
  | 'AUTOMATIC_DISCOUNT'
  | 'PROMO_CODE'
  | 'PRICE_OVERRIDE';
export type DiscountApprovalStatus = 'NOT_REQUIRED' | 'APPROVED' | 'REJECTED';
export type DiscountPricingSource = 'ONLINE_VALIDATED' | 'OFFLINE_LOCAL';
export type DiscountReconciliationStatus =
  | 'NOT_REQUIRED'
  | 'PENDING'
  | 'RECONCILED'
  | 'RECONCILED_WITH_EXCEPTION';
export type DiscountSourceKind = 'manual' | 'automatic' | 'promo' | 'override';
export type CategoryDiscountPolicyMode = 'DEFAULT' | 'FORCE_INCLUDE' | 'FORCE_EXCLUDE';

export interface DiscountDefinition {
  id: string;
  tenantId?: string;
  name: string;
  code?: string | null;
  description?: string | null;
  status: DiscountDefinitionStatus;
  type: DiscountDefinitionType;
  method: DiscountMethod;
  scope: DiscountScope;
  value: number;
  priority?: number;
  stackMode: DiscountStackMode;
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
  stationIds?: string[] | null;
  active?: boolean;
}

export interface DiscountReasonCode {
  code: string;
  label: string;
  requiresNote?: boolean;
}

export interface EmployeeDiscountPolicy {
  id?: string;
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
  active?: boolean;
}

export interface AppliedDiscountDetail {
  discountApplicationId: string;
  discountDefinitionId?: string | null;
  applicationType: DiscountApplicationType;
  scope: DiscountScope;
  method: DiscountMethod;
  name: string;
  code?: string | null;
  stackMode: DiscountStackMode;
  source: DiscountSourceKind;
  value: number;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  quantityBasis?: number | null;
  reasonCode?: string | null;
  reasonNote?: string | null;
  appliedByEmployeeId?: string | null;
  appliedByEmployeeName?: string | null;
  approvedByEmployeeId?: string | null;
  approvedByEmployeeName?: string | null;
  approvalRequired?: boolean;
  approvalStatus?: DiscountApprovalStatus;
  approvalReference?: string | null;
  sourceSnapshot?: string | null;
  appliedAt: string;
}

export interface AppliedLineDiscountSummary {
  lineId: string;
  discounts: AppliedDiscountDetail[];
  lineDiscountTotal: number;
  allocatedOrderDiscountTotal: number;
  lineTotalBeforeTax: number;
}

export interface AppliedDiscountSummary {
  applications: AppliedDiscountDetail[];
  approvalEvents: PricingApprovalEvent[];
  lineSummaries: AppliedLineDiscountSummary[];
  orderLevelAdjustments: AppliedDiscountDetail[];
  warnings: string[];
  pricingGeneratedAt: string;
}

export interface PricingApprovalEvent {
  id: string;
  approvalType: 'DISCOUNT' | 'PRICE_OVERRIDE';
  requestingEmployeeId: string;
  approvingEmployeeId: string;
  requestedAction: string;
  reasonCode?: string | null;
  reasonNote?: string | null;
  policySnapshot?: string | null;
  status: 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface PricingEmployeeContext {
  employeeId: string;
  employeeName?: string | null;
  roles?: string[];
}

export interface PricingApprovalContext {
  approverEmployeeId: string;
  approverEmployeeName?: string | null;
  approvalReference?: string | null;
}

export interface PricingCartLineInput {
  lineId: string;
  productId: string;
  productName: string;
  quantity: number;
  baseUnitPrice: number;
  unitOfMeasure: string;
  categoryId?: string | null;
  discountable?: boolean;
  minAllowedPrice?: number | null;
  maxManualDiscountPercent?: number | null;
  maxManualDiscountAmount?: number | null;
}

export interface ManualDiscountRequest {
  kind: 'MANUAL_DISCOUNT';
  scope: DiscountScope;
  method: 'PERCENT' | 'AMOUNT';
  value: number;
  lineId?: string;
  name?: string;
  reasonCode?: string | null;
  reasonNote?: string | null;
  approval?: PricingApprovalContext | null;
}

export interface PriceOverrideRequest {
  kind: 'PRICE_OVERRIDE';
  lineId: string;
  finalPrice: number;
  name?: string;
  reasonCode?: string | null;
  reasonNote?: string | null;
  approval?: PricingApprovalContext | null;
}

export interface PromoCodeRequest {
  code: string;
}

export interface PricingCartInput {
  now?: string;
  timezone?: string | null;
  storeId?: string | null;
  stationId?: string | null;
  employee: PricingEmployeeContext;
  policy?: EmployeeDiscountPolicy | null;
  lines: PricingCartLineInput[];
  definitions?: DiscountDefinition[];
  manualDiscounts?: ManualDiscountRequest[];
  priceOverrides?: PriceOverrideRequest[];
  promoCodes?: PromoCodeRequest[];
  approvalEvents?: PricingApprovalEvent[];
  taxRate?: number;
  pricingSource?: DiscountPricingSource;
}

export interface PricingLineResult {
  lineId: string;
  productId: string;
  productName: string;
  quantity: number;
  basePrice: number;
  overridePrice?: number | null;
  netUnitPrice: number;
  lineSubtotalBeforeOrderDiscount: number;
  lineDiscountTotal: number;
  allocatedOrderDiscountTotal: number;
  lineTotalBeforeTax: number;
  lineTotalAfterTax: number;
  appliedDiscounts: AppliedDiscountDetail[];
}

export interface PricingOrderResult {
  baseSubtotal: number;
  subtotal: number;
  lineDiscountTotal: number;
  orderDiscountTotal: number;
  discountTotal: number;
  savingsTotal: number;
  tax: number;
  total: number;
  promoCodes: string[];
  pricingVersion: string;
  pricingSource: DiscountPricingSource;
  reconciliationStatus: DiscountReconciliationStatus;
  applications: AppliedDiscountDetail[];
  lines: PricingLineResult[];
  approvalEvents: PricingApprovalEvent[];
  warnings: string[];
}

export interface PricingPreviewResult {
  order: PricingOrderResult;
  summary: AppliedDiscountSummary;
}

export interface ReconciliationException {
  exceptionType:
    | 'PROMO_USAGE_LIMIT_EXCEEDED'
    | 'PROMO_INACTIVE_AT_SYNC'
    | 'POLICY_THRESHOLD_MISMATCH'
    | 'MISSING_APPROVAL'
    | 'CATALOG_RULE_CHANGED';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  message: string;
  discountApplicationId?: string | null;
  backendSnapshot?: string | null;
}

export interface ReconciliationInput {
  local: PricingPreviewResult;
  backend: PricingPreviewResult;
}

export interface ReconciliationResult {
  status: DiscountReconciliationStatus;
  exceptions: ReconciliationException[];
}
