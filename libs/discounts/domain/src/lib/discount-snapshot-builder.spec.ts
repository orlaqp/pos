import { buildAppliedDiscountSummary } from './discount-snapshot-builder';

describe('buildAppliedDiscountSummary', () => {
  it('builds a summary from pricing order results', () => {
    const result = buildAppliedDiscountSummary({
      applications: [{ discountApplicationId: 'app-1', scope: 'ORDER' }],
      approvalEvents: [{ id: 'approval-1' }],
      lines: [
        {
          lineId: 'line-1',
          appliedDiscounts: [{ discountApplicationId: 'line-app-1' }],
          lineDiscountTotal: 2,
          allocatedOrderDiscountTotal: 1,
          lineTotalBeforeTax: 7,
        },
      ],
      warnings: ['check'],
    } as any);

    expect(result.orderLevelAdjustments).toEqual([{ discountApplicationId: 'app-1', scope: 'ORDER' }]);
    expect(result.lineSummaries[0]).toEqual(
      expect.objectContaining({
        lineId: 'line-1',
        lineDiscountTotal: 2,
        allocatedOrderDiscountTotal: 1,
      })
    );
    expect(result.pricingGeneratedAt).toEqual(expect.any(String));
  });
});
