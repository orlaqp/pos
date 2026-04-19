import { DiscountEntityMapper } from './discount.entity';

describe('DiscountEntityMapper', () => {
  it('maps discount definitions and filters null ids from arrays', () => {
    const result = DiscountEntityMapper.fromDefinition({
      id: 'def-1',
      name: 'Summer',
      code: 'SUMMER',
      description: 'Seasonal',
      status: 'ACTIVE',
      type: 'MANUAL',
      method: 'PERCENT',
      scope: 'LINE',
      value: 10,
      stackMode: 'STACKABLE',
      approvalRequired: undefined,
      reasonRequired: undefined,
      daysOfWeek: ['MON', null, 'FRI'],
      applicableProductIds: ['prod-1', null],
      excludedCategoryIds: ['cat-1', null],
      active: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    } as any);

    expect(result).toEqual(
      expect.objectContaining({
        id: 'def-1',
        daysOfWeek: ['MON', 'FRI'],
        applicableProductIds: ['prod-1'],
        excludedCategoryIds: ['cat-1'],
        approvalRequired: false,
        reasonRequired: false,
      })
    );
  });

  it('derives active from status for discount definitions', () => {
    const result = DiscountEntityMapper.fromDefinition({
      id: 'def-2',
      name: 'Legacy active mismatch',
      status: 'ACTIVE',
      type: 'AUTOMATIC',
      method: 'PERCENT',
      scope: 'LINE',
      value: 10,
      stackMode: 'STACKABLE',
      active: false,
    } as any);

    expect(result.active).toBe(true);
  });

  it('maps employee discount policies', () => {
    const result = DiscountEntityMapper.fromPolicy({
      id: 'policy-1',
      employeeId: 'emp-1',
      roleKey: 'Sales',
      canApplyOrderDiscount: true,
      active: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    } as any);

    expect(result).toEqual(
      expect.objectContaining({
        id: 'policy-1',
        employeeId: 'emp-1',
        roleKey: 'Sales',
        canApplyOrderDiscount: true,
        active: true,
      })
    );
  });
});
