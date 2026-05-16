import { EmployeeDiscountPolicy } from '@pos/discounts/domain';

const DEFAULT_POLICY: EmployeeDiscountPolicy = {
  canApplyOrderDiscount: true,
  canOverridePrice: true,
  canApproveDiscounts: false,
  canApprovePriceOverrides: false,
  canUsePromoCodes: true,
  maxManualAmountDiscount: 25,
  maxManualPercentDiscount: 25,
  maxPriceOverrideAmount: 25,
  maxPriceOverridePercentBelowBase: 25,
  requireReasonForManualDiscounts: true,
  requireReasonForOverrides: true,
  requireApprovalForOrderDiscount: false,
  requireApprovalForAnyPriceOverride: false,
  allowExclusiveDiscountOverride: false,
  active: true,
};

export class DiscountPolicyService {
  static resolveForRoles(roles: string[] = []): EmployeeDiscountPolicy {
    if (roles.includes('Admin')) {
      return {
        ...DEFAULT_POLICY,
        canApproveDiscounts: true,
        canApprovePriceOverrides: true,
        maxManualAmountDiscount: 1000,
        maxManualPercentDiscount: 100,
        maxPriceOverrideAmount: 1000,
        maxPriceOverridePercentBelowBase: 100,
      };
    }

    if (roles.includes('Sales')) {
      return {
        ...DEFAULT_POLICY,
        maxManualAmountDiscount: 10,
        maxManualPercentDiscount: 15,
        maxPriceOverrideAmount: 10,
        maxPriceOverridePercentBelowBase: 20,
      };
    }

    return DEFAULT_POLICY;
  }
}
