import { DiscountDefinition, EmployeeDiscountPolicy } from '@pos/shared/models';

export interface DiscountDefinitionEntity {
  id?: string;
  name: string;
  code?: string | null;
  description?: string | null;
  status: string;
  type: string;
  method: string;
  scope: string;
  value: number;
  priority?: number | null;
  stackMode: string;
  approvalRequired?: boolean | null;
  reasonRequired?: boolean | null;
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
  excludeAlreadyDiscountedItems?: boolean | null;
  appliesToAllProducts?: boolean | null;
  storeIds?: string[] | null;
  stationIds?: string[] | null;
  active: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface EmployeeDiscountPolicyEntity {
  id?: string;
  employeeId?: string | null;
  roleKey?: string | null;
  maxManualPercentDiscount?: number | null;
  maxManualAmountDiscount?: number | null;
  maxPriceOverrideAmount?: number | null;
  maxPriceOverridePercentBelowBase?: number | null;
  canApplyOrderDiscount?: boolean | null;
  canOverridePrice?: boolean | null;
  canApproveDiscounts?: boolean | null;
  canApprovePriceOverrides?: boolean | null;
  canUsePromoCodes?: boolean | null;
  requireReasonForManualDiscounts?: boolean | null;
  requireReasonForOverrides?: boolean | null;
  requireApprovalForOrderDiscount?: boolean | null;
  requireApprovalForAnyPriceOverride?: boolean | null;
  allowExclusiveDiscountOverride?: boolean | null;
  active: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export class DiscountEntityMapper {
  static fromDefinition(model: DiscountDefinition): DiscountDefinitionEntity {
    return {
      id: model.id,
      name: model.name,
      code: model.code,
      description: model.description,
      status: model.status,
      type: model.type,
      method: model.method,
      scope: model.scope,
      value: model.value,
      priority: model.priority,
      stackMode: model.stackMode,
      approvalRequired: model.approvalRequired ?? false,
      reasonRequired: model.reasonRequired ?? false,
      startDate: model.startDate,
      endDate: model.endDate,
      daysOfWeek: model.daysOfWeek ? model.daysOfWeek.filter(Boolean) as string[] : null,
      startTime: model.startTime,
      endTime: model.endTime,
      minSubtotal: model.minSubtotal,
      minQuantity: model.minQuantity,
      usageLimitTotal: model.usageLimitTotal,
      usageCountTotal: model.usageCountTotal,
      applicableProductIds: model.applicableProductIds
        ? model.applicableProductIds.filter(Boolean) as string[]
        : null,
      applicableCategoryIds: model.applicableCategoryIds
        ? model.applicableCategoryIds.filter(Boolean) as string[]
        : null,
      excludedProductIds: model.excludedProductIds
        ? model.excludedProductIds.filter(Boolean) as string[]
        : null,
      excludedCategoryIds: model.excludedCategoryIds
        ? model.excludedCategoryIds.filter(Boolean) as string[]
        : null,
      excludeAlreadyDiscountedItems: model.excludeAlreadyDiscountedItems ?? false,
      appliesToAllProducts: model.appliesToAllProducts ?? false,
      storeIds: model.storeIds ? model.storeIds.filter(Boolean) as string[] : null,
      stationIds: model.stationIds ? model.stationIds.filter(Boolean) as string[] : null,
      active: model.active,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };
  }

  static fromPolicy(model: EmployeeDiscountPolicy): EmployeeDiscountPolicyEntity {
    return {
      id: model.id,
      employeeId: model.employeeId,
      roleKey: model.roleKey,
      maxManualPercentDiscount: model.maxManualPercentDiscount,
      maxManualAmountDiscount: model.maxManualAmountDiscount,
      maxPriceOverrideAmount: model.maxPriceOverrideAmount,
      maxPriceOverridePercentBelowBase: model.maxPriceOverridePercentBelowBase,
      canApplyOrderDiscount: model.canApplyOrderDiscount,
      canOverridePrice: model.canOverridePrice,
      canApproveDiscounts: model.canApproveDiscounts,
      canApprovePriceOverrides: model.canApprovePriceOverrides,
      canUsePromoCodes: model.canUsePromoCodes,
      requireReasonForManualDiscounts: model.requireReasonForManualDiscounts,
      requireReasonForOverrides: model.requireReasonForOverrides,
      requireApprovalForOrderDiscount: model.requireApprovalForOrderDiscount,
      requireApprovalForAnyPriceOverride: model.requireApprovalForAnyPriceOverride,
      allowExclusiveDiscountOverride: model.allowExclusiveDiscountOverride,
      active: model.active,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };
  }
}
