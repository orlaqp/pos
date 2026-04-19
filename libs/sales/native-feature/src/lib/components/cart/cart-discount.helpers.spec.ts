import {
  baseAmountForDisplay,
  getAvailableManualDefinitions,
  getScopedDateParts,
  isDefinitionActiveForContext,
  isTimeWithinWindow,
  normalizeWeekday,
} from './cart-discount.helpers';

describe('cart discount helpers', () => {
  it('normalizes weekdays and derives scoped date parts', () => {
    expect(normalizeWeekday('  thursday ')).toBe('THU');
    expect(
      getScopedDateParts('2026-04-17T14:30:00.000Z', 'America/New_York')
    ).toEqual({
      weekday: 'FRI',
      time: '10:30',
    });
  });

  it('evaluates discount time windows across supported shapes', () => {
    expect(isTimeWithinWindow('10:00')).toBe(true);
    expect(isTimeWithinWindow('10:00', '09:00', undefined)).toBe(true);
    expect(isTimeWithinWindow('10:00', undefined, '11:00')).toBe(true);
    expect(isTimeWithinWindow('10:00', '09:00', '11:00')).toBe(true);
    expect(isTimeWithinWindow('08:00', '09:00', '11:00')).toBe(false);
    expect(isTimeWithinWindow('23:30', '22:00', '02:00')).toBe(true);
    expect(isTimeWithinWindow('03:00', '22:00', '02:00')).toBe(false);
  });

  it('checks whether a definition is active for date, weekday, time, and station context', () => {
    const activeDefinition = {
      id: 'def-1',
      name: 'Friday morning',
      status: 'ACTIVE' as const,
      type: 'MANUAL' as const,
      method: 'PERCENT' as const,
      scope: 'LINE' as const,
      stackMode: 'STACKABLE' as const,
      value: 10,
      daysOfWeek: ['FRIDAY'],
      startTime: '09:00',
      endTime: '11:00',
      stationIds: ['01'],
    };

    expect(
      isDefinitionActiveForContext(
        activeDefinition,
        '2026-04-17T14:30:00.000Z',
        'America/New_York',
        '01'
      )
    ).toBe(true);
    expect(
      isDefinitionActiveForContext(
        { ...activeDefinition, active: false },
        '2026-04-17T14:30:00.000Z',
        'America/New_York',
        '01'
      )
    ).toBe(true);
    expect(
      isDefinitionActiveForContext(
        { ...activeDefinition, status: 'INACTIVE' },
        '2026-04-17T14:30:00.000Z',
        'America/New_York',
        '01'
      )
    ).toBe(false);
    expect(
      isDefinitionActiveForContext(
        { ...activeDefinition, startDate: '2026-04-18T00:00:00.000Z' },
        '2026-04-17T14:30:00.000Z',
        'America/New_York',
        '01'
      )
    ).toBe(false);
    expect(
      isDefinitionActiveForContext(
        { ...activeDefinition, endDate: '2026-04-17T00:00:00.000Z' },
        '2026-04-17T14:30:00.000Z',
        'America/New_York',
        '01'
      )
    ).toBe(false);
    expect(
      isDefinitionActiveForContext(
        { ...activeDefinition, daysOfWeek: ['MONDAY'] },
        '2026-04-17T14:30:00.000Z',
        'America/New_York',
        '01'
      )
    ).toBe(false);
    expect(
      isDefinitionActiveForContext(
        { ...activeDefinition, startTime: '11:30', endTime: '12:00' },
        '2026-04-17T14:30:00.000Z',
        'America/New_York',
        '01'
      )
    ).toBe(false);
    expect(
      isDefinitionActiveForContext(
        { ...activeDefinition, stationIds: ['02'] },
        '2026-04-17T14:30:00.000Z',
        'America/New_York',
        '01'
      )
    ).toBe(false);
    expect(
      isDefinitionActiveForContext(
        { ...activeDefinition, stationIds: ['01'] },
        '2026-04-17T14:30:00.000Z',
        'America/New_York',
        undefined
      )
    ).toBe(false);
  });

  it('returns the correct base amount for line and order discounts', () => {
    const cart = {
      footer: {
        subtotal: 15,
        baseSubtotal: 12,
      },
    } as any;

    expect(baseAmountForDisplay('LINE', cart, 4.5)).toBe(4.5);
    expect(baseAmountForDisplay('ORDER', cart, 4.5)).toBe(15);
    expect(
      baseAmountForDisplay(
        'ORDER',
        {
          footer: {
            subtotal: 0,
            baseSubtotal: 12,
          },
        } as any,
        4.5
      )
    ).toBe(12);
  });

  it('filters available manual definitions across order and line rules', () => {
    const definitions = [
      {
        id: 'z-order',
        name: 'Zulu order',
        status: 'ACTIVE' as const,
        type: 'MANUAL' as const,
        method: 'AMOUNT' as const,
        scope: 'ORDER' as const,
        stackMode: 'STACKABLE' as const,
        value: 5,
        minSubtotal: 40,
      },
      {
        id: 'a-allowed',
        name: 'Allowed line',
        status: 'ACTIVE' as const,
        type: 'MANUAL' as const,
        method: 'PERCENT' as const,
        scope: 'LINE' as const,
        stackMode: 'STACKABLE' as const,
        value: 10,
        minSubtotal: 5,
        minQuantity: 2,
        applicableProductIds: ['p-1'],
        applicableCategoryIds: ['cat-1'],
      },
      {
        id: 'b-auto',
        name: 'Automatic discount',
        status: 'ACTIVE' as const,
        type: 'AUTOMATIC' as const,
        method: 'PERCENT' as const,
        scope: 'LINE' as const,
        stackMode: 'STACKABLE' as const,
        value: 10,
      },
      {
        id: 'c-final-price',
        name: 'Final price',
        status: 'ACTIVE' as const,
        type: 'MANUAL' as const,
        method: 'FINAL_PRICE' as const,
        scope: 'LINE' as const,
        stackMode: 'STACKABLE' as const,
        value: 1,
      },
      {
        id: 'd-low-quantity',
        name: 'Low quantity',
        status: 'ACTIVE' as const,
        type: 'MANUAL' as const,
        method: 'PERCENT' as const,
        scope: 'LINE' as const,
        stackMode: 'STACKABLE' as const,
        value: 5,
        minQuantity: 3,
      },
      {
        id: 'd-low-subtotal',
        name: 'Low subtotal',
        status: 'ACTIVE' as const,
        type: 'MANUAL' as const,
        method: 'PERCENT' as const,
        scope: 'LINE' as const,
        stackMode: 'STACKABLE' as const,
        value: 5,
        minSubtotal: 10,
      },
      {
        id: 'e-exclude-adjusted',
        name: 'Exclude adjusted',
        status: 'ACTIVE' as const,
        type: 'MANUAL' as const,
        method: 'PERCENT' as const,
        scope: 'LINE' as const,
        stackMode: 'STACKABLE' as const,
        value: 5,
        excludeAlreadyDiscountedItems: true,
      },
      {
        id: 'f-other-product',
        name: 'Other product',
        status: 'ACTIVE' as const,
        type: 'MANUAL' as const,
        method: 'PERCENT' as const,
        scope: 'LINE' as const,
        stackMode: 'STACKABLE' as const,
        value: 5,
        applicableProductIds: ['p-2'],
      },
      {
        id: 'g-excluded-product',
        name: 'Excluded product',
        status: 'ACTIVE' as const,
        type: 'MANUAL' as const,
        method: 'PERCENT' as const,
        scope: 'LINE' as const,
        stackMode: 'STACKABLE' as const,
        value: 5,
        excludedProductIds: ['p-1'],
      },
      {
        id: 'h-other-category',
        name: 'Other category',
        status: 'ACTIVE' as const,
        type: 'MANUAL' as const,
        method: 'PERCENT' as const,
        scope: 'LINE' as const,
        stackMode: 'STACKABLE' as const,
        value: 5,
        applicableCategoryIds: ['cat-2'],
      },
      {
        id: 'i-excluded-category',
        name: 'Excluded category',
        status: 'ACTIVE' as const,
        type: 'MANUAL' as const,
        method: 'PERCENT' as const,
        scope: 'LINE' as const,
        stackMode: 'STACKABLE' as const,
        value: 5,
        excludedCategoryIds: ['cat-1'],
      },
      {
        id: 'j-inactive',
        name: 'Inactive',
        status: 'INACTIVE' as const,
        type: 'MANUAL' as const,
        method: 'PERCENT' as const,
        scope: 'LINE' as const,
        stackMode: 'STACKABLE' as const,
        value: 5,
      },
    ];

    expect(
      getAvailableManualDefinitions({
        definitions,
        draftScope: 'ORDER',
        orderSubtotal: 50,
        selectedLineSubtotal: 6,
        selectedItem: null,
        selectedLineHasManualAdjustment: false,
        selectedLineDiscountCount: 0,
        timestamp: '2026-04-17T14:30:00.000Z',
        canApplyOrderDiscount: false,
      })
    ).toEqual([]);

    expect(
      getAvailableManualDefinitions({
        definitions,
        draftScope: 'ORDER',
        orderSubtotal: 50,
        selectedLineSubtotal: 6,
        selectedItem: null,
        selectedLineHasManualAdjustment: false,
        selectedLineDiscountCount: 0,
        timestamp: '2026-04-17T14:30:00.000Z',
        canApplyOrderDiscount: true,
      }).map((definition) => definition.id)
    ).toEqual(['z-order']);

    expect(
      getAvailableManualDefinitions({
        definitions,
        draftScope: 'LINE',
        orderSubtotal: 50,
        selectedLineSubtotal: 6,
        selectedItem: {
          identifier: 'i-1',
          quantity: 2,
          product: {
            id: 'p-1',
            categoryId: 'cat-1',
          },
        } as any,
        selectedLineHasManualAdjustment: false,
        selectedLineDiscountCount: 0,
        timestamp: '2026-04-17T14:30:00.000Z',
        canApplyOrderDiscount: true,
      }).map((definition) => definition.id)
    ).toEqual(['a-allowed', 'e-exclude-adjusted']);

    expect(
      getAvailableManualDefinitions({
        definitions,
        draftScope: 'LINE',
        orderSubtotal: 50,
        selectedLineSubtotal: 6,
        selectedItem: {
          identifier: 'i-1',
          quantity: 2,
          product: {
            id: 'p-1',
            categoryId: 'cat-1',
          },
        } as any,
        selectedLineHasManualAdjustment: true,
        selectedLineDiscountCount: 1,
        timestamp: '2026-04-17T14:30:00.000Z',
        canApplyOrderDiscount: true,
      }).map((definition) => definition.id)
    ).toEqual(['a-allowed']);
  });

  it('rejects line definitions when the selected item is missing or unresolved', () => {
    const definitions = [
      {
        id: 'line-def',
        name: 'Line def',
        status: 'ACTIVE' as const,
        type: 'MANUAL' as const,
        method: 'PERCENT' as const,
        scope: 'LINE' as const,
        stackMode: 'STACKABLE' as const,
        value: 10,
      },
    ];

    expect(
      getAvailableManualDefinitions({
        definitions,
        draftScope: 'LINE',
        orderSubtotal: 50,
        selectedLineSubtotal: 6,
        selectedItem: null,
        selectedLineHasManualAdjustment: false,
        selectedLineDiscountCount: 0,
        timestamp: '2026-04-17T14:30:00.000Z',
        canApplyOrderDiscount: true,
      })
    ).toEqual([]);

    expect(
      getAvailableManualDefinitions({
        definitions,
        draftScope: 'LINE',
        orderSubtotal: 50,
        selectedLineSubtotal: 6,
        selectedItem: {
          identifier: 'i-1',
          quantity: 0,
          product: {
            id: 'p-1',
            categoryId: 'cat-1',
          },
        } as any,
        selectedLineHasManualAdjustment: false,
        selectedLineDiscountCount: 0,
        timestamp: '2026-04-17T14:30:00.000Z',
        canApplyOrderDiscount: true,
      })
    ).toEqual([]);

    expect(
      getAvailableManualDefinitions({
        definitions,
        draftScope: 'LINE',
        orderSubtotal: 50,
        selectedLineSubtotal: 6,
        selectedItem: {
          identifier: 'i-1',
          quantity: 1,
          product: {
            id: 'p-1',
          },
        } as any,
        selectedLineHasManualAdjustment: false,
        selectedLineDiscountCount: 0,
        timestamp: '2026-04-17T14:30:00.000Z',
        canApplyOrderDiscount: true,
      }).map((definition) => definition.id)
    ).toEqual(['line-def']);
  });
});
