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
    expect(result.order.lines[0].allocatedOrderDiscountTotal).toBe(3.75);
    expect(result.order.lines[1].allocatedOrderDiscountTotal).toBe(6.25);
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

  it('uses line subtotal rather than order subtotal for line min subtotal thresholds', () => {
    const definitions: DiscountDefinition[] = [
      {
        id: 'line-subtotal-threshold',
        name: 'Line threshold discount',
        status: 'ACTIVE',
        type: 'AUTOMATIC',
        method: 'PERCENT',
        scope: 'LINE',
        value: 10,
        stackMode: 'BEST_PRICE_ONLY',
        minSubtotal: 10,
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
          baseUnitPrice: 6,
          unitOfMeasure: 'EA',
          discountable: true,
        },
        {
          lineId: 'line-2',
          productId: 'prod-2',
          productName: 'Gadget',
          quantity: 1,
          baseUnitPrice: 20,
          unitOfMeasure: 'EA',
          discountable: true,
        },
      ],
      definitions,
    });

    expect(result.order.discountTotal).toBe(2);
    expect(result.order.lines[0].appliedDiscounts).toHaveLength(0);
    expect(result.order.lines[1].appliedDiscounts).toHaveLength(1);
    expect(result.order.lines[1].appliedDiscounts[0].name).toBe(
      'Line threshold discount'
    );
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

  it('ignores inactive definitions and honors start and end dates', () => {
    const definitions: DiscountDefinition[] = [
      {
        id: 'inactive',
        name: 'Inactive',
        status: 'INACTIVE',
        type: 'AUTOMATIC',
        method: 'PERCENT',
        scope: 'LINE',
        value: 50,
        stackMode: 'STACKABLE',
      },
      {
        id: 'legacy-disabled-flag',
        name: 'Legacy disabled flag',
        status: 'ACTIVE',
        active: false,
        type: 'AUTOMATIC',
        method: 'PERCENT',
        scope: 'LINE',
        value: 50,
        stackMode: 'STACKABLE',
      },
      {
        id: 'future',
        name: 'Future',
        status: 'ACTIVE',
        type: 'AUTOMATIC',
        method: 'PERCENT',
        scope: 'LINE',
        value: 50,
        stackMode: 'STACKABLE',
        startDate: '2026-03-17T00:00:00.000Z',
      },
      {
        id: 'expired',
        name: 'Expired',
        status: 'ACTIVE',
        type: 'AUTOMATIC',
        method: 'PERCENT',
        scope: 'LINE',
        value: 50,
        stackMode: 'STACKABLE',
        endDate: '2026-03-15T00:00:00.000Z',
      },
    ];

    const result = PricingEngine.preview({
      now: '2026-03-16T10:00:00.000Z',
      employee: { employeeId: 'emp-1' },
      lines: [
        {
          lineId: 'line-1',
          productId: 'prod-1',
          productName: 'Oil',
          quantity: 1,
          baseUnitPrice: 10,
          unitOfMeasure: 'EA',
          discountable: true,
        },
      ],
      definitions,
    });

    expect(result.order.discountTotal).toBe(5);
    expect(result.order.applications).toHaveLength(1);
    expect(result.order.applications[0].name).toBe('Legacy disabled flag');
  });

  it('respects category applicability, exclusions, quantity thresholds, and discountable flags', () => {
    const definitions: DiscountDefinition[] = [
      {
        id: 'cat-eligible',
        name: 'Produce 10',
        status: 'ACTIVE',
        type: 'AUTOMATIC',
        method: 'PERCENT',
        scope: 'LINE',
        value: 10,
        stackMode: 'BEST_PRICE_ONLY',
        applicableCategoryIds: ['produce'],
        minQuantity: 2,
      },
      {
        id: 'excluded-item',
        name: 'Produce 20',
        status: 'ACTIVE',
        type: 'AUTOMATIC',
        method: 'PERCENT',
        scope: 'LINE',
        value: 20,
        stackMode: 'BEST_PRICE_ONLY',
        applicableCategoryIds: ['produce'],
        excludedProductIds: ['apple'],
      },
    ];

    const result = PricingEngine.preview({
      employee: { employeeId: 'emp-1' },
      lines: [
        {
          lineId: 'apple-line',
          productId: 'apple',
          productName: 'Apple',
          quantity: 2,
          baseUnitPrice: 5,
          unitOfMeasure: 'EA',
          categoryId: 'produce',
          discountable: true,
        },
        {
          lineId: 'pear-line',
          productId: 'pear',
          productName: 'Pear',
          quantity: 2,
          baseUnitPrice: 5,
          unitOfMeasure: 'EA',
          categoryId: 'produce',
          discountable: true,
        },
        {
          lineId: 'soap-line',
          productId: 'soap',
          productName: 'Soap',
          quantity: 1,
          baseUnitPrice: 5,
          unitOfMeasure: 'EA',
          categoryId: 'household',
          discountable: false,
        },
      ],
      definitions,
    });

    expect(result.order.lines[0].lineDiscountTotal).toBe(1);
    expect(result.order.lines[1].lineDiscountTotal).toBe(2);
    expect(result.order.lines[2].lineDiscountTotal).toBe(0);
  });

  it('enforces days of week and time windows for automatic discounts', () => {
    const definitions: DiscountDefinition[] = [
      {
        id: 'sunday-oil',
        name: 'Sunday Oil Window',
        status: 'ACTIVE',
        type: 'AUTOMATIC',
        method: 'PERCENT',
        scope: 'LINE',
        value: 7,
        stackMode: 'STACKABLE',
        daysOfWeek: ['SUN'],
        startTime: '08:00',
        endTime: '12:00',
        applicableCategoryIds: ['oils'],
      },
    ];

    const mondayResult = PricingEngine.preview({
      now: '2026-03-16T14:00:00.000Z',
      timezone: 'America/New_York',
      employee: { employeeId: 'emp-1' },
      lines: [
        {
          lineId: 'line-1',
          productId: 'oil-1',
          productName: 'Aceite Oliva',
          quantity: 1,
          baseUnitPrice: 10,
          unitOfMeasure: 'EA',
          categoryId: 'oils',
          discountable: true,
        },
      ],
      definitions,
    });

    const sundayWithinWindow = PricingEngine.preview({
      now: '2026-03-15T14:00:00.000Z',
      timezone: 'America/New_York',
      employee: { employeeId: 'emp-1' },
      lines: [
        {
          lineId: 'line-1',
          productId: 'oil-1',
          productName: 'Aceite Oliva',
          quantity: 1,
          baseUnitPrice: 10,
          unitOfMeasure: 'EA',
          categoryId: 'oils',
          discountable: true,
        },
      ],
      definitions,
    });

    const sundayOutsideWindow = PricingEngine.preview({
      now: '2026-03-15T18:00:00.000Z',
      timezone: 'America/New_York',
      employee: { employeeId: 'emp-1' },
      lines: [
        {
          lineId: 'line-1',
          productId: 'oil-1',
          productName: 'Aceite Oliva',
          quantity: 1,
          baseUnitPrice: 10,
          unitOfMeasure: 'EA',
          categoryId: 'oils',
          discountable: true,
        },
      ],
      definitions,
    });

    expect(mondayResult.order.discountTotal).toBe(0);
    expect(sundayWithinWindow.order.discountTotal).toBe(0.7);
    expect(sundayOutsideWindow.order.discountTotal).toBe(0);
  });

  it('enforces station scoped discounts', () => {
    const definitions: DiscountDefinition[] = [
      {
        id: 'store-station-oil',
        name: 'Scoped Oil Discount',
        status: 'ACTIVE',
        type: 'AUTOMATIC',
        method: 'PERCENT',
        scope: 'LINE',
        value: 5,
        stackMode: 'STACKABLE',
        applicableCategoryIds: ['oils'],
        stationIds: ['station-1'],
      },
    ];

    const matched = PricingEngine.preview({
      now: '2026-03-16T14:00:00.000Z',
      employee: { employeeId: 'emp-1' },
      storeId: 'store-1',
      stationId: 'station-1',
      lines: [
        {
          lineId: 'line-1',
          productId: 'oil-1',
          productName: 'Aceite Oliva',
          quantity: 1,
          baseUnitPrice: 10,
          unitOfMeasure: 'EA',
          categoryId: 'oils',
          discountable: true,
        },
      ],
      definitions,
    });

    const differentStore = PricingEngine.preview({
      now: '2026-03-16T14:00:00.000Z',
      employee: { employeeId: 'emp-1' },
      storeId: 'store-2',
      stationId: 'station-1',
      lines: [
        {
          lineId: 'line-1',
          productId: 'oil-1',
          productName: 'Aceite Oliva',
          quantity: 1,
          baseUnitPrice: 10,
          unitOfMeasure: 'EA',
          categoryId: 'oils',
          discountable: true,
        },
      ],
      definitions,
    });

    const wrongStation = PricingEngine.preview({
      now: '2026-03-16T14:00:00.000Z',
      employee: { employeeId: 'emp-1' },
      storeId: 'store-1',
      stationId: 'station-2',
      lines: [
        {
          lineId: 'line-1',
          productId: 'oil-1',
          productName: 'Aceite Oliva',
          quantity: 1,
          baseUnitPrice: 10,
          unitOfMeasure: 'EA',
          categoryId: 'oils',
          discountable: true,
        },
      ],
      definitions,
    });

    expect(matched.order.discountTotal).toBe(0.5);
    expect(differentStore.order.discountTotal).toBe(0.5);
    expect(wrongStation.order.discountTotal).toBe(0);
  });

  it('enforces promo and automatic order discounts without store scoping', () => {
    const definitions: DiscountDefinition[] = [
      {
        id: 'promo-store-sunday',
        name: 'Sunday store promo',
        code: 'SUNDAY5',
        status: 'ACTIVE',
        type: 'PROMO_CODE',
        method: 'AMOUNT',
        scope: 'ORDER',
        value: 5,
        stackMode: 'STACKABLE',
        daysOfWeek: ['SUN'],
      },
    ];

    const monday = PricingEngine.preview({
      now: '2026-03-16T14:00:00.000Z',
      timezone: 'America/New_York',
      employee: { employeeId: 'emp-1' },
      storeId: 'store-1',
      promoCodes: [{ code: 'SUNDAY5' }],
      lines: [
        {
          lineId: 'line-1',
          productId: 'oil-1',
          productName: 'Aceite Oliva',
          quantity: 1,
          baseUnitPrice: 20,
          unitOfMeasure: 'EA',
          discountable: true,
        },
      ],
      definitions,
    });

    const sundayDifferentStore = PricingEngine.preview({
      now: '2026-03-15T14:00:00.000Z',
      timezone: 'America/New_York',
      employee: { employeeId: 'emp-1' },
      storeId: 'store-2',
      promoCodes: [{ code: 'SUNDAY5' }],
      lines: [
        {
          lineId: 'line-1',
          productId: 'oil-1',
          productName: 'Aceite Oliva',
          quantity: 1,
          baseUnitPrice: 20,
          unitOfMeasure: 'EA',
          discountable: true,
        },
      ],
      definitions,
    });

    const sundayMatched = PricingEngine.preview({
      now: '2026-03-15T14:00:00.000Z',
      timezone: 'America/New_York',
      employee: { employeeId: 'emp-1' },
      storeId: 'store-1',
      promoCodes: [{ code: 'SUNDAY5' }],
      lines: [
        {
          lineId: 'line-1',
          productId: 'oil-1',
          productName: 'Aceite Oliva',
          quantity: 1,
          baseUnitPrice: 20,
          unitOfMeasure: 'EA',
          discountable: true,
        },
      ],
      definitions,
    });

    expect(monday.order.orderDiscountTotal).toBe(0);
    expect(sundayDifferentStore.order.orderDiscountTotal).toBe(5);
    expect(sundayMatched.order.orderDiscountTotal).toBe(5);
  });

  it('prevents auto line discounts from stacking when excludeAlreadyDiscountedItems is set', () => {
    const definitions: DiscountDefinition[] = [
      {
        id: 'base-10',
        name: 'Base 10',
        status: 'ACTIVE',
        type: 'AUTOMATIC',
        method: 'PERCENT',
        scope: 'LINE',
        value: 10,
        stackMode: 'STACKABLE',
      },
      {
        id: 'follow-5',
        name: 'Follow 5',
        status: 'ACTIVE',
        type: 'AUTOMATIC',
        method: 'PERCENT',
        scope: 'LINE',
        value: 5,
        stackMode: 'STACKABLE',
        excludeAlreadyDiscountedItems: true,
      },
    ];

    const result = PricingEngine.preview({
      employee: { employeeId: 'emp-1' },
      lines: [
        {
          lineId: 'line-1',
          productId: 'prod-1',
          productName: 'Oil',
          quantity: 1,
          baseUnitPrice: 10,
          unitOfMeasure: 'EA',
          discountable: true,
        },
      ],
      definitions,
    });

    expect(result.order.lines[0].appliedDiscounts).toHaveLength(1);
    expect(result.order.lines[0].appliedDiscounts[0].name).toBe('Base 10');
  });

  it('warns when manual discounts need a reason or approval and when order discounts are not allowed', () => {
    const result = PricingEngine.preview({
      employee: { employeeId: 'emp-1', employeeName: 'Cashier' },
      policy: {
        canApplyOrderDiscount: false,
        maxManualPercentDiscount: 5,
        requireReasonForManualDiscounts: true,
      },
      lines: [
        {
          lineId: 'line-1',
          productId: 'prod-1',
          productName: 'Oil',
          quantity: 1,
          baseUnitPrice: 10,
          unitOfMeasure: 'EA',
          discountable: true,
        },
      ],
      manualDiscounts: [
        {
          kind: 'MANUAL_DISCOUNT',
          scope: 'LINE',
          lineId: 'line-1',
          method: 'PERCENT',
          value: 10,
        },
        {
          kind: 'MANUAL_DISCOUNT',
          scope: 'ORDER',
          method: 'AMOUNT',
          value: 2,
        },
      ],
    });

    expect(result.order.warnings).toContain('Reason code is required.');
    expect(result.order.warnings).toContain('Order discounts are not allowed for this employee.');
  });

  it('warns when product manual discount limits are exceeded', () => {
    const result = PricingEngine.preview({
      employee: { employeeId: 'emp-1' },
      policy,
      lines: [
        {
          lineId: 'line-1',
          productId: 'prod-1',
          productName: 'Oil',
          quantity: 1,
          baseUnitPrice: 10,
          unitOfMeasure: 'EA',
          discountable: true,
          maxManualDiscountPercent: 5,
        },
        {
          lineId: 'line-2',
          productId: 'prod-2',
          productName: 'Soap',
          quantity: 1,
          baseUnitPrice: 10,
          unitOfMeasure: 'EA',
          discountable: true,
          maxManualDiscountAmount: 1,
        },
      ],
      manualDiscounts: [
        {
          kind: 'MANUAL_DISCOUNT',
          scope: 'LINE',
          lineId: 'line-1',
          method: 'PERCENT',
          value: 10,
          reasonCode: 'manager',
        },
        {
          kind: 'MANUAL_DISCOUNT',
          scope: 'LINE',
          lineId: 'line-2',
          method: 'AMOUNT',
          value: 2,
          reasonCode: 'manager',
        },
      ],
    });

    expect(result.order.warnings).toContain('Manual discount percent exceeds product limit for Oil.');
    expect(result.order.warnings).toContain('Manual discount amount exceeds product limit for Soap.');
  });

  it('applies price overrides with min price guard and approval warnings', () => {
    const blocked = PricingEngine.preview({
      employee: { employeeId: 'emp-1', employeeName: 'Cashier' },
      policy: {
        canOverridePrice: true,
        maxPriceOverrideAmount: 1,
        requireReasonForOverrides: true,
      },
      lines: [
        {
          lineId: 'line-1',
          productId: 'prod-1',
          productName: 'Oil',
          quantity: 1,
          baseUnitPrice: 10,
          unitOfMeasure: 'EA',
          discountable: true,
          minAllowedPrice: 9,
        },
      ],
      priceOverrides: [
        {
          kind: 'PRICE_OVERRIDE',
          lineId: 'line-1',
          finalPrice: 5,
        },
      ],
    });

    const approved = PricingEngine.preview({
      employee: { employeeId: 'emp-1', employeeName: 'Cashier' },
      policy: {
        canOverridePrice: true,
        maxPriceOverrideAmount: 20,
      },
      lines: [
        {
          lineId: 'line-1',
          productId: 'prod-1',
          productName: 'Oil',
          quantity: 1,
          baseUnitPrice: 10,
          unitOfMeasure: 'EA',
          discountable: true,
          minAllowedPrice: 9,
        },
      ],
      priceOverrides: [
        {
          kind: 'PRICE_OVERRIDE',
          lineId: 'line-1',
          finalPrice: 5,
          approval: {
            approverEmployeeId: 'approver-1',
          },
        },
      ],
    });

    expect(blocked.order.warnings).toContain('Reason code is required.');
    expect(approved.order.lines[0].overridePrice).toBe(9);
    expect(approved.order.lines[0].lineDiscountTotal).toBe(1);
  });
});
