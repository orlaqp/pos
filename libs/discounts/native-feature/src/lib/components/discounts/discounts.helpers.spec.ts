import {
  buildDefinitionEntity,
  buildPolicyEntity,
  defaultDefinitionValues,
  defaultPolicyValues,
  getDefinitionFieldAvailability,
  mapDefinitionToForm,
  mapPolicyToForm,
  parseOptionalNumber,
  parseRequiredNumber,
  sortNamedOptionsAlphabetically,
} from './discounts.helpers';

describe('discounts helpers', () => {
  it('returns promo defaults when promo mode is enabled', () => {
    const values = defaultDefinitionValues(true);
    expect(values.type).toBe('PROMO_CODE');
    expect(values.code).toBe('');
    expect(values.daysOfWeek).toEqual([]);
    expect(values.appliesToAllProducts).toBe(true);
  });

  it('parses optional and required numeric values defensively', () => {
    expect(parseOptionalNumber('')).toBeNull();
    expect(parseOptionalNumber('abc')).toBeNull();
    expect(parseOptionalNumber(' 12.5 ')).toBe(12.5);
    expect(parseRequiredNumber('', 9)).toBe(9);
    expect(parseRequiredNumber('7')).toBe(7);
  });

  it('sorts named options alphabetically without mutating the source list', () => {
    const options = [
      { id: '3', name: 'toston' },
      { id: '1', name: 'ACEITES' },
      { id: '2', name: 'Sal' },
    ];

    const sorted = sortNamedOptionsAlphabetically(options);

    expect(sorted.map((item) => item.name)).toEqual(['ACEITES', 'Sal', 'toston']);
    expect(options.map((item) => item.name)).toEqual(['toston', 'ACEITES', 'Sal']);
  });

  it('describes which definition fields apply by scope and product targeting', () => {
    expect(
      getDefinitionFieldAvailability({
        scope: 'ORDER',
        appliesToAllProducts: true,
      })
    ).toEqual({
      lineScope: false,
      minQuantityEnabled: false,
      productTargetingToggleEnabled: false,
      applicableFiltersEnabled: false,
      exclusionFiltersEnabled: false,
      excludeAlreadyDiscountedItemsEnabled: false,
    });

    expect(
      getDefinitionFieldAvailability({
        scope: 'LINE',
        appliesToAllProducts: false,
      })
    ).toEqual({
      lineScope: true,
      minQuantityEnabled: true,
      productTargetingToggleEnabled: true,
      applicableFiltersEnabled: true,
      exclusionFiltersEnabled: true,
      excludeAlreadyDiscountedItemsEnabled: true,
    });
  });

  it('maps a definition entity into form values', () => {
    const mapped = mapDefinitionToForm(
      {
        id: 'discount-1',
        name: 'Oil discount',
        code: 'OIL15',
        description: null,
        status: 'ACTIVE',
        type: 'AUTOMATIC',
        method: 'PERCENT',
        scope: 'LINE',
        value: 15,
        priority: null,
        stackMode: 'STACKABLE',
        approvalRequired: null,
        reasonRequired: null,
        startDate: null,
        endDate: null,
        daysOfWeek: ['MONDAY', null as never],
        startTime: null,
        endTime: null,
        minSubtotal: 30,
        minQuantity: null,
        usageLimitTotal: null,
        applicableProductIds: ['product-1', null as never],
        applicableCategoryIds: ['category-1'],
        excludedProductIds: null,
        excludedCategoryIds: null,
        stationIds: ['station-1'],
        excludeAlreadyDiscountedItems: null,
        appliesToAllProducts: null,
        active: true,
      },
      false
    );

    expect(mapped).toMatchObject({
      name: 'Oil discount',
      code: 'OIL15',
      description: '',
      priority: '100',
      minSubtotal: '30',
      minQuantity: '',
      usageLimitTotal: '',
      daysOfWeek: ['MONDAY'],
      applicableProductIds: ['product-1'],
      appliesToAllProducts: true,
      excludeAlreadyDiscountedItems: false,
    });
  });

  it('maps a policy entity into form values', () => {
    const mapped = mapPolicyToForm({
      id: 'policy-1',
      roleKey: null,
      employeeId: null,
      maxManualPercentDiscount: 25,
      maxManualAmountDiscount: null,
      maxPriceOverrideAmount: 5,
      maxPriceOverridePercentBelowBase: null,
      canApplyOrderDiscount: true,
      canOverridePrice: false,
      canApproveDiscounts: true,
      canApprovePriceOverrides: false,
      canUsePromoCodes: true,
      requireReasonForManualDiscounts: false,
      requireReasonForOverrides: true,
      requireApprovalForOrderDiscount: false,
      requireApprovalForAnyPriceOverride: true,
      allowExclusiveDiscountOverride: false,
      active: true,
    });

    expect(mapped).toEqual({
      ...defaultPolicyValues,
      roleKey: 'Sales',
      employeeId: '',
      maxManualPercentDiscount: '25',
      maxManualAmountDiscount: '',
      maxPriceOverrideAmount: '5',
      maxPriceOverridePercentBelowBase: '',
      canApplyOrderDiscount: true,
      canOverridePrice: false,
      canApproveDiscounts: true,
      canApprovePriceOverrides: false,
      canUsePromoCodes: true,
      requireReasonForManualDiscounts: false,
      requireReasonForOverrides: true,
      requireApprovalForOrderDiscount: false,
      requireApprovalForAnyPriceOverride: true,
      allowExclusiveDiscountOverride: false,
      active: true,
    });
  });

  it('builds a definition entity with normalized values', () => {
    const entity = buildDefinitionEntity(
      {
        ...defaultDefinitionValues(true),
        name: '  Spring promo  ',
        code: ' spring10 ',
        description: '  seasonal  ',
        value: '10',
        priority: '',
        startDate: ' 2026-03-16 ',
        endDate: '',
        startTime: ' 09:00 ',
        endTime: '',
        minSubtotal: '30',
        minQuantity: '',
        usageLimitTotal: '100',
        applicableProductIds: ['product-1'],
        applicableCategoryIds: [],
        excludedProductIds: [],
        excludedCategoryIds: ['category-2'],
        stationIds: [],
        approvalRequired: true,
        reasonRequired: false,
        excludeAlreadyDiscountedItems: true,
        appliesToAllProducts: false,
        active: true,
      },
      'existing-id',
      true
    );

    expect(entity).toMatchObject({
      id: 'existing-id',
      name: 'Spring promo',
      code: 'SPRING10',
      description: 'seasonal',
      type: 'PROMO_CODE',
      value: 10,
      priority: null,
      startDate: '2026-03-16',
      endDate: null,
      startTime: '09:00',
      endTime: null,
      minSubtotal: 30,
      minQuantity: null,
      usageLimitTotal: 100,
      applicableProductIds: ['product-1'],
      applicableCategoryIds: null,
      excludedCategoryIds: ['category-2'],
      stationIds: null,
      appliesToAllProducts: false,
    });
  });

  it('clears line-only and targeting-only fields when the scope is order', () => {
    const entity = buildDefinitionEntity(
      {
        ...defaultDefinitionValues(false),
        name: 'Order-only',
        scope: 'ORDER',
        minSubtotal: '25',
        minQuantity: '3',
        applicableProductIds: ['product-1'],
        applicableCategoryIds: ['category-1'],
        excludedProductIds: ['product-2'],
        excludedCategoryIds: ['category-2'],
        excludeAlreadyDiscountedItems: true,
        appliesToAllProducts: false,
      },
      undefined,
      false
    );

    expect(entity).toMatchObject({
      scope: 'ORDER',
      minSubtotal: 25,
      minQuantity: null,
      applicableProductIds: null,
      applicableCategoryIds: null,
      excludedProductIds: null,
      excludedCategoryIds: null,
      excludeAlreadyDiscountedItems: false,
      appliesToAllProducts: true,
    });
  });

  it('clears applicable targeting lists when the discount applies to all products', () => {
    const entity = buildDefinitionEntity(
      {
        ...defaultDefinitionValues(false),
        name: 'Line-wide',
        scope: 'LINE',
        appliesToAllProducts: true,
        applicableProductIds: ['product-1'],
        applicableCategoryIds: ['category-1'],
        excludedProductIds: ['product-2'],
        excludedCategoryIds: ['category-2'],
      },
      undefined,
      false
    );

    expect(entity).toMatchObject({
      scope: 'LINE',
      applicableProductIds: null,
      applicableCategoryIds: null,
      excludedProductIds: ['product-2'],
      excludedCategoryIds: ['category-2'],
      appliesToAllProducts: true,
    });
  });

  it('builds a policy entity with nullable fields', () => {
    const entity = buildPolicyEntity(
      {
        ...defaultPolicyValues,
        roleKey: '',
        employeeId: ' employee-1 ',
        maxManualPercentDiscount: '',
        maxManualAmountDiscount: '15',
        maxPriceOverrideAmount: '2.5',
        maxPriceOverridePercentBelowBase: '',
      },
      'policy-id'
    );

    expect(entity).toEqual({
      id: 'policy-id',
      roleKey: null,
      employeeId: 'employee-1',
      maxManualPercentDiscount: null,
      maxManualAmountDiscount: 15,
      maxPriceOverrideAmount: 2.5,
      maxPriceOverridePercentBelowBase: null,
      canApplyOrderDiscount: false,
      canOverridePrice: true,
      canApproveDiscounts: false,
      canApprovePriceOverrides: false,
      canUsePromoCodes: true,
      requireReasonForManualDiscounts: true,
      requireReasonForOverrides: true,
      requireApprovalForOrderDiscount: false,
      requireApprovalForAnyPriceOverride: false,
      allowExclusiveDiscountOverride: false,
      active: true,
    });
  });
});
