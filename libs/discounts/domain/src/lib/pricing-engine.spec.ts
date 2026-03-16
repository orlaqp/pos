import { PricingEngine } from './pricing-engine';
import { DiscountDefinition, EmployeeDiscountPolicy } from './types';

describe('PricingEngine', () => {
  const policy: EmployeeDiscountPolicy = {
    canApplyOrderDiscount: true,
    canOverridePrice: true,
    canUsePromoCodes: true,
    maxManualAmountDiscount: 20,
    maxManualPercentDiscount: 20,
  };

  it('applies manual line percent discount and order fixed proration', () => {
    const result = PricingEngine.preview({
      employee: { employeeId: 'emp-1', employeeName: 'Orlando' },
      policy,
      lines: [
        {
          lineId: 'line-1',
          productId: 'prod-1',
          productName: 'Coffee',
          quantity: 2,
          baseUnitPrice: 20,
          unitOfMeasure: 'EA',
          discountable: true,
        },
        {
          lineId: 'line-2',
          productId: 'prod-2',
          productName: 'Bagel',
          quantity: 1,
          baseUnitPrice: 60,
          unitOfMeasure: 'EA',
          discountable: true,
        },
      ],
      manualDiscounts: [
        { kind: 'MANUAL_DISCOUNT', scope: 'LINE', lineId: 'line-1', method: 'PERCENT', value: 10 },
        { kind: 'MANUAL_DISCOUNT', scope: 'ORDER', method: 'AMOUNT', value: 10 },
      ],
    });

    expect(result.order.lineDiscountTotal).toBe(4);
    expect(result.order.orderDiscountTotal).toBe(10);
    expect(result.order.total).toBe(86);
    expect(result.order.lines[0].allocatedOrderDiscountTotal).toBe(4);
    expect(result.order.lines[1].allocatedOrderDiscountTotal).toBe(6);
  });

  it('keeps best price only automatic discount', () => {
    const definitions: DiscountDefinition[] = [
      {
        id: 'd1',
        name: 'Ten percent',
        status: 'ACTIVE',
        type: 'AUTOMATIC',
        method: 'PERCENT',
        scope: 'LINE',
        value: 10,
        stackMode: 'BEST_PRICE_ONLY',
      },
      {
        id: 'd2',
        name: 'Seven off',
        status: 'ACTIVE',
        type: 'AUTOMATIC',
        method: 'AMOUNT',
        scope: 'LINE',
        value: 7,
        stackMode: 'BEST_PRICE_ONLY',
      },
    ];

    const result = PricingEngine.preview({
      employee: { employeeId: 'emp-1' },
      lines: [
        {
          lineId: 'line-1',
          productId: 'prod-1',
          productName: 'Widget',
          quantity: 1,
          baseUnitPrice: 50,
          unitOfMeasure: 'EA',
          discountable: true,
        },
      ],
      definitions,
    });

    expect(result.order.lineDiscountTotal).toBe(7);
    expect(result.order.lines[0].appliedDiscounts).toHaveLength(1);
    expect(result.order.lines[0].appliedDiscounts[0].name).toBe('Seven off');
  });
});
