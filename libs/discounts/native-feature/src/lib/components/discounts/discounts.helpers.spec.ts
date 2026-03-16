import {
  buildDefinitionEntity,
  buildPolicyEntity,
  defaultDefinitionValues,
  defaultPolicyValues,
  mapDefinitionToForm,
  mapPolicyToForm,
  parseOptionalNumber,
  parseRequiredNumber,
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
        storeIds: ['store-1'],
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
        storeIds: ['store-1'],
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
      storeIds: ['store-1'],
      stationIds: null,
      appliesToAllProducts: false,
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
