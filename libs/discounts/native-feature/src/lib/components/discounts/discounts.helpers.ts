import {
  DiscountDefinitionEntity,
  EmployeeDiscountPolicyEntity,
} from '@pos/discounts/data-access';

export const definitionTypeOptions = [
  { id: 'MANUAL', name: 'Manual' },
  { id: 'AUTOMATIC', name: 'Automatic' },
  { id: 'PROMO_CODE', name: 'Promo code' },
];

export const statusOptions = [
  { id: 'DRAFT', name: 'Draft' },
  { id: 'ACTIVE', name: 'Active' },
  { id: 'INACTIVE', name: 'Inactive' },
  { id: 'EXPIRED', name: 'Expired' },
];

export const methodOptions = [
  { id: 'PERCENT', name: 'Percent' },
  { id: 'AMOUNT', name: 'Amount' },
  { id: 'FINAL_PRICE', name: 'Final price' },
];

export const scopeOptions = [
  { id: 'LINE', name: 'Line' },
  { id: 'ORDER', name: 'Order' },
];

export const stackModeOptions = [
  { id: 'STACKABLE', name: 'Stackable' },
  { id: 'EXCLUSIVE', name: 'Exclusive' },
  { id: 'BEST_PRICE_ONLY', name: 'Best price only' },
];

export const roleOptions = [
  { id: 'Admin', name: 'Admin' },
  { id: 'Sales', name: 'Sales' },
  { id: 'Payments', name: 'Payments' },
];

export const dayOfWeekOptions = [
  { id: 'MONDAY', name: 'Monday' },
  { id: 'TUESDAY', name: 'Tuesday' },
  { id: 'WEDNESDAY', name: 'Wednesday' },
  { id: 'THURSDAY', name: 'Thursday' },
  { id: 'FRIDAY', name: 'Friday' },
  { id: 'SATURDAY', name: 'Saturday' },
  { id: 'SUNDAY', name: 'Sunday' },
];

export interface DefinitionFormValues {
  name: string;
  code: string;
  description: string;
  status: string;
  type: string;
  method: string;
  scope: string;
  value: string;
  priority: string;
  stackMode: string;
  approvalRequired: boolean;
  reasonRequired: boolean;
  startDate: string;
  endDate: string;
  daysOfWeek: string[];
  startTime: string;
  endTime: string;
  minSubtotal: string;
  minQuantity: string;
  usageLimitTotal: string;
  applicableProductIds: string[];
  applicableCategoryIds: string[];
  excludedProductIds: string[];
  excludedCategoryIds: string[];
  storeIds: string[];
  stationIds: string[];
  excludeAlreadyDiscountedItems: boolean;
  appliesToAllProducts: boolean;
  active: boolean;
}

export interface PolicyFormValues {
  roleKey: string;
  employeeId: string;
  maxManualPercentDiscount: string;
  maxManualAmountDiscount: string;
  maxPriceOverrideAmount: string;
  maxPriceOverridePercentBelowBase: string;
  canApplyOrderDiscount: boolean;
  canOverridePrice: boolean;
  canApproveDiscounts: boolean;
  canApprovePriceOverrides: boolean;
  canUsePromoCodes: boolean;
  requireReasonForManualDiscounts: boolean;
  requireReasonForOverrides: boolean;
  requireApprovalForOrderDiscount: boolean;
  requireApprovalForAnyPriceOverride: boolean;
  allowExclusiveDiscountOverride: boolean;
  active: boolean;
}

export const defaultPolicyValues: PolicyFormValues = {
  roleKey: 'Sales',
  employeeId: '',
  maxManualPercentDiscount: '10',
  maxManualAmountDiscount: '10',
  maxPriceOverrideAmount: '10',
  maxPriceOverridePercentBelowBase: '15',
  canApplyOrderDiscount: false,
  canOverridePrice: true,
  canApproveDiscounts: false,
  canApprovePriceOverrides: false,
  canUsePromoCodes: true,
  requireReasonForManualDiscounts: true,
  requireReasonForOverrides: true,
  requireApprovalForOrderDiscount: false,
  requireApprovalForAnyPriceOverride: false,
  allowExclusiveDiscountOverride: false,
  active: true,
};

export const defaultDefinitionValues = (promoMode: boolean): DefinitionFormValues => ({
  name: '',
  code: '',
  description: '',
  status: 'ACTIVE',
  type: promoMode ? 'PROMO_CODE' : 'MANUAL',
  method: 'PERCENT',
  scope: 'LINE',
  value: '0',
  priority: '100',
  stackMode: 'STACKABLE',
  approvalRequired: false,
  reasonRequired: true,
  startDate: '',
  endDate: '',
  daysOfWeek: [],
  startTime: '',
  endTime: '',
  minSubtotal: '',
  minQuantity: '',
  usageLimitTotal: '',
  applicableProductIds: [],
  applicableCategoryIds: [],
  excludedProductIds: [],
  excludedCategoryIds: [],
  storeIds: [],
  stationIds: [],
  excludeAlreadyDiscountedItems: false,
  appliesToAllProducts: true,
  active: true,
});

export function parseOptionalNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseRequiredNumber(value: string, fallback = 0): number {
  const parsed = parseOptionalNumber(value);
  return parsed == null ? fallback : parsed;
}

export function mapDefinitionToForm(
  entity: DiscountDefinitionEntity,
  promoMode: boolean
): DefinitionFormValues {
  return {
    name: entity.name,
    code: entity.code || '',
    description: entity.description || '',
    status: entity.status,
    type: promoMode ? 'PROMO_CODE' : entity.type,
    method: entity.method,
    scope: entity.scope,
    value: String(entity.value ?? 0),
    priority: entity.priority == null ? '100' : String(entity.priority),
    stackMode: entity.stackMode,
    approvalRequired: entity.approvalRequired ?? false,
    reasonRequired: entity.reasonRequired ?? false,
    startDate: entity.startDate || '',
    endDate: entity.endDate || '',
    daysOfWeek: entity.daysOfWeek?.filter((item): item is string => !!item) || [],
    startTime: entity.startTime || '',
    endTime: entity.endTime || '',
    minSubtotal: entity.minSubtotal == null ? '' : String(entity.minSubtotal),
    minQuantity: entity.minQuantity == null ? '' : String(entity.minQuantity),
    usageLimitTotal: entity.usageLimitTotal == null ? '' : String(entity.usageLimitTotal),
    applicableProductIds:
      entity.applicableProductIds?.filter((item): item is string => !!item) || [],
    applicableCategoryIds:
      entity.applicableCategoryIds?.filter((item): item is string => !!item) || [],
    excludedProductIds:
      entity.excludedProductIds?.filter((item): item is string => !!item) || [],
    excludedCategoryIds:
      entity.excludedCategoryIds?.filter((item): item is string => !!item) || [],
    storeIds: entity.storeIds?.filter((item): item is string => !!item) || [],
    stationIds: entity.stationIds?.filter((item): item is string => !!item) || [],
    excludeAlreadyDiscountedItems: entity.excludeAlreadyDiscountedItems ?? false,
    appliesToAllProducts: entity.appliesToAllProducts ?? true,
    active: entity.active,
  };
}

export function mapPolicyToForm(entity: EmployeeDiscountPolicyEntity): PolicyFormValues {
  return {
    roleKey: entity.roleKey || 'Sales',
    employeeId: entity.employeeId || '',
    maxManualPercentDiscount:
      entity.maxManualPercentDiscount == null ? '' : String(entity.maxManualPercentDiscount),
    maxManualAmountDiscount:
      entity.maxManualAmountDiscount == null ? '' : String(entity.maxManualAmountDiscount),
    maxPriceOverrideAmount:
      entity.maxPriceOverrideAmount == null ? '' : String(entity.maxPriceOverrideAmount),
    maxPriceOverridePercentBelowBase:
      entity.maxPriceOverridePercentBelowBase == null
        ? ''
        : String(entity.maxPriceOverridePercentBelowBase),
    canApplyOrderDiscount: entity.canApplyOrderDiscount ?? false,
    canOverridePrice: entity.canOverridePrice ?? false,
    canApproveDiscounts: entity.canApproveDiscounts ?? false,
    canApprovePriceOverrides: entity.canApprovePriceOverrides ?? false,
    canUsePromoCodes: entity.canUsePromoCodes ?? false,
    requireReasonForManualDiscounts: entity.requireReasonForManualDiscounts ?? false,
    requireReasonForOverrides: entity.requireReasonForOverrides ?? false,
    requireApprovalForOrderDiscount: entity.requireApprovalForOrderDiscount ?? false,
    requireApprovalForAnyPriceOverride: entity.requireApprovalForAnyPriceOverride ?? false,
    allowExclusiveDiscountOverride: entity.allowExclusiveDiscountOverride ?? false,
    active: entity.active,
  };
}

export function buildDefinitionEntity(
  values: DefinitionFormValues,
  existingId: string | undefined,
  promoMode: boolean
): DiscountDefinitionEntity {
  return {
    id: existingId,
    name: values.name.trim(),
    code: promoMode ? values.code.trim().toUpperCase() || null : values.code.trim() || null,
    description: values.description.trim() || null,
    status: values.status,
    type: promoMode ? 'PROMO_CODE' : values.type,
    method: values.method,
    scope: values.scope,
    value: parseRequiredNumber(values.value),
    priority: parseOptionalNumber(values.priority),
    stackMode: values.stackMode,
    approvalRequired: values.approvalRequired,
    reasonRequired: values.reasonRequired,
    startDate: values.startDate.trim() || null,
    endDate: values.endDate.trim() || null,
    daysOfWeek: values.daysOfWeek.length ? values.daysOfWeek : null,
    startTime: values.startTime.trim() || null,
    endTime: values.endTime.trim() || null,
    minSubtotal: parseOptionalNumber(values.minSubtotal),
    minQuantity: parseOptionalNumber(values.minQuantity),
    usageLimitTotal: parseOptionalNumber(values.usageLimitTotal),
    applicableProductIds: values.applicableProductIds.length ? values.applicableProductIds : null,
    applicableCategoryIds: values.applicableCategoryIds.length
      ? values.applicableCategoryIds
      : null,
    excludedProductIds: values.excludedProductIds.length ? values.excludedProductIds : null,
    excludedCategoryIds: values.excludedCategoryIds.length
      ? values.excludedCategoryIds
      : null,
    storeIds: values.storeIds.length ? values.storeIds : null,
    stationIds: values.stationIds.length ? values.stationIds : null,
    excludeAlreadyDiscountedItems: values.excludeAlreadyDiscountedItems,
    appliesToAllProducts: values.appliesToAllProducts,
    active: values.active,
  };
}

export function buildPolicyEntity(
  values: PolicyFormValues,
  existingId: string | undefined
): EmployeeDiscountPolicyEntity {
  return {
    id: existingId,
    roleKey: values.roleKey || null,
    employeeId: values.employeeId.trim() || null,
    maxManualPercentDiscount: parseOptionalNumber(values.maxManualPercentDiscount),
    maxManualAmountDiscount: parseOptionalNumber(values.maxManualAmountDiscount),
    maxPriceOverrideAmount: parseOptionalNumber(values.maxPriceOverrideAmount),
    maxPriceOverridePercentBelowBase: parseOptionalNumber(
      values.maxPriceOverridePercentBelowBase
    ),
    canApplyOrderDiscount: values.canApplyOrderDiscount,
    canOverridePrice: values.canOverridePrice,
    canApproveDiscounts: values.canApproveDiscounts,
    canApprovePriceOverrides: values.canApprovePriceOverrides,
    canUsePromoCodes: values.canUsePromoCodes,
    requireReasonForManualDiscounts: values.requireReasonForManualDiscounts,
    requireReasonForOverrides: values.requireReasonForOverrides,
    requireApprovalForOrderDiscount: values.requireApprovalForOrderDiscount,
    requireApprovalForAnyPriceOverride: values.requireApprovalForAnyPriceOverride,
    allowExclusiveDiscountOverride: values.allowExclusiveDiscountOverride,
    active: values.active,
  };
}
