import { AppliedDiscountSummary, PricingOrderResult } from './types';

export function buildAppliedDiscountSummary(order: PricingOrderResult): AppliedDiscountSummary {
  return {
    applications: order.applications,
    approvalEvents: order.approvalEvents,
    lineSummaries: order.lines.map((line) => ({
      lineId: line.lineId,
      discounts: line.appliedDiscounts,
      lineDiscountTotal: line.lineDiscountTotal,
      allocatedOrderDiscountTotal: line.allocatedOrderDiscountTotal,
      lineTotalBeforeTax: line.lineTotalBeforeTax,
    })),
    orderLevelAdjustments: order.applications.filter((application) => application.scope === 'ORDER'),
    warnings: order.warnings,
    pricingGeneratedAt: new Date().toISOString(),
  };
}
