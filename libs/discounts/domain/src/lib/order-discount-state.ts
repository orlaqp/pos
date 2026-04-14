import {
  AppliedDiscountDetail,
  AppliedDiscountSummary,
  ManualDiscountRequest,
  PriceOverrideRequest,
} from './types';

type RestoredDiscountState = {
  manualDiscounts: ManualDiscountRequest[];
  priceOverrides: PriceOverrideRequest[];
};

const isManualDiscountMethod = (
  value: AppliedDiscountDetail['method']
): value is ManualDiscountRequest['method'] =>
  value === 'PERCENT' || value === 'AMOUNT';

export function restoreDiscountStateFromSummary(
  summary: AppliedDiscountSummary | null | undefined
): RestoredDiscountState {
  if (!summary) {
    return {
      manualDiscounts: [],
      priceOverrides: [],
    };
  }

  const manualDiscounts: ManualDiscountRequest[] = [];
  const priceOverrides: PriceOverrideRequest[] = [];

  summary.lineSummaries.forEach((lineSummary) => {
    lineSummary.discounts.forEach((discount) => {
      if (
        discount.applicationType === 'MANUAL_LINE_DISCOUNT' &&
        isManualDiscountMethod(discount.method)
      ) {
        manualDiscounts.push({
          kind: 'MANUAL_DISCOUNT',
          scope: 'LINE',
          method: discount.method,
          value: discount.value,
          lineId: lineSummary.lineId,
          name: discount.name,
          reasonCode: discount.reasonCode,
          reasonNote: discount.reasonNote,
        });
      }

      if (discount.applicationType === 'PRICE_OVERRIDE') {
        priceOverrides.push({
          kind: 'PRICE_OVERRIDE',
          lineId: lineSummary.lineId,
          finalPrice: discount.value,
          name: discount.name,
          reasonCode: discount.reasonCode,
          reasonNote: discount.reasonNote,
        });
      }
    });
  });

  summary.orderLevelAdjustments.forEach((discount) => {
    if (
      discount.applicationType === 'MANUAL_ORDER_DISCOUNT' &&
      isManualDiscountMethod(discount.method)
    ) {
      manualDiscounts.push({
        kind: 'MANUAL_DISCOUNT',
        scope: 'ORDER',
        method: discount.method,
        value: discount.value,
        name: discount.name,
        reasonCode: discount.reasonCode,
        reasonNote: discount.reasonNote,
      });
    }
  });

  return {
    manualDiscounts,
    priceOverrides,
  };
}
