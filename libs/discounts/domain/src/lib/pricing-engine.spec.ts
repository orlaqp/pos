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

  it('applies promo code discounts only when the submitted code matches', () => {
    const definitions: DiscountDefinition[] = [
      {
        id: 'promo-1',
        name: 'Welcome 10',
        code: 'WELCOME10',
        status: 'ACTIVE',
        type: 'PROMO_CODE',
        method: 'PERCENT',
        scope: 'ORDER',
        value: 10,
        stackMode: 'EXCLUSIVE',
      },
    ];

    const matched = PricingEngine.preview({
      employee: { employeeId: 'emp-1', employeeName: 'Orlando' },
      lines: [
        {
          lineId: 'line-1',
          productId: 'prod-1',
          productName: 'Coffee',
          quantity: 1,
          baseUnitPrice: 50,
          unitOfMeasure: 'EA',
          discountable: true,
        },
      ],
      definitions,
      promoCodes: [{ code: ' welcome10 ' }],
    });

    const unmatched = PricingEngine.preview({
      employee: { employeeId: 'emp-1', employeeName: 'Orlando' },
      lines: [
        {
          lineId: 'line-1',
          productId: 'prod-1',
          productName: 'Coffee',
          quantity: 1,
          baseUnitPrice: 50,
          unitOfMeasure: 'EA',
          discountable: true,
        },
      ],
      definitions,
      promoCodes: [{ code: 'SPRING20' }],
    });

    expect(matched.order.promoCodes).toEqual(['WELCOME10']);
    expect(matched.order.orderDiscountTotal).toBe(5);
    expect(matched.order.total).toBe(45);
    expect(matched.order.applications).toHaveLength(1);
    expect(matched.order.applications[0].applicationType).toBe('PROMO_CODE');

    expect(unmatched.order.orderDiscountTotal).toBe(0);
    expect(unmatched.order.total).toBe(50);
    expect(unmatched.order.applications).toHaveLength(0);
  });

  it('applies promo line discounts before order-level promo discounts for mixed baskets', () => {
    const definitions: DiscountDefinition[] = [
      {
        id: 'promo-line',
        name: 'Produce promo',
        code: 'FRESH5',
        status: 'ACTIVE',
        type: 'PROMO_CODE',
        method: 'PERCENT',
        scope: 'LINE',
        value: 10,
        stackMode: 'STACKABLE',
        applicableCategoryIds: ['produce'],
      },
      {
        id: 'promo-order',
        name: 'Order promo',
        code: 'FRESH5',
        status: 'ACTIVE',
        type: 'PROMO_CODE',
        method: 'AMOUNT',
        scope: 'ORDER',
        value: 5,
        stackMode: 'STACKABLE',
      },
    ];

    const result = PricingEngine.preview({
      employee: { employeeId: 'emp-1', employeeName: 'Orlando' },
      lines: [
        {
          lineId: 'produce-line',
          productId: 'apple',
          productName: 'Apples',
          quantity: 2,
          baseUnitPrice: 5,
          unitOfMeasure: 'EA',
          categoryId: 'produce',
          discountable: true,
        },
        {
          lineId: 'grocery-line',
          productId: 'bread',
          productName: 'Bread',
          quantity: 1,
          baseUnitPrice: 10,
          unitOfMeasure: 'EA',
          categoryId: 'grocery',
          discountable: true,
        },
      ],
      definitions,
      promoCodes: [{ code: 'fresh5' }],
    });

    expect(result.order.baseSubtotal).toBe(20);
    expect(result.order.lineDiscountTotal).toBe(1);
    expect(result.order.orderDiscountTotal).toBe(5);
    expect(result.order.discountTotal).toBe(6);
    expect(result.order.total).toBe(14);
    expect(result.order.lines[0].lineDiscountTotal).toBe(1);
    expect(result.order.lines[0].allocatedOrderDiscountTotal).toBe(2.37);
    expect(result.order.lines[1].allocatedOrderDiscountTotal).toBe(2.63);
  });
});
