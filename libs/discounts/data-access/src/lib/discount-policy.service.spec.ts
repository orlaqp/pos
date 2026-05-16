import { DiscountPolicyService } from './discount-policy.service';

describe('DiscountPolicyService', () => {
  it('returns elevated admin permissions', () => {
    const result = DiscountPolicyService.resolveForRoles(['Admin']);

    expect(result.canApproveDiscounts).toBe(true);
    expect(result.canApprovePriceOverrides).toBe(true);
    expect(result.maxManualPercentDiscount).toBe(100);
  });

  it('returns sales-specific thresholds', () => {
    const result = DiscountPolicyService.resolveForRoles(['Sales']);

    expect(result.maxManualAmountDiscount).toBe(10);
    expect(result.maxManualPercentDiscount).toBe(15);
    expect(result.canApproveDiscounts).toBe(false);
  });

  it('returns default policy for unknown roles', () => {
    const result = DiscountPolicyService.resolveForRoles(['Payments']);

    expect(result.canUsePromoCodes).toBe(true);
    expect(result.maxManualAmountDiscount).toBe(25);
    expect(result.canApproveDiscounts).toBe(false);
  });
});
