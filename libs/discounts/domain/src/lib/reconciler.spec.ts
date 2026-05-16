import { DiscountReconciler } from './reconciler';

describe('DiscountReconciler', () => {
  it('returns reconciled when local and backend pricing match', () => {
    const local = {
      order: { total: 10, applications: [] },
      summary: {},
    } as any;
    const backend = {
      order: { total: 10, applications: [] },
      summary: {},
    } as any;

    const result = DiscountReconciler.reconcile({ local, backend });

    expect(result).toEqual({ status: 'RECONCILED', exceptions: [] });
  });

  it('adds exceptions for total drift and missing approvals', () => {
    const local = {
      order: {
        total: 10,
        applications: [
          {
            discountApplicationId: 'app-1',
            name: 'Manual override',
            approvalRequired: true,
            approvedByEmployeeId: null,
          },
        ],
      },
      summary: { total: 10 },
    } as any;
    const backend = {
      order: { total: 12, applications: [] },
      summary: { total: 12 },
    } as any;

    const result = DiscountReconciler.reconcile({ local, backend });

    expect(result.status).toBe('RECONCILED_WITH_EXCEPTION');
    expect(result.exceptions).toHaveLength(2);
    expect(result.exceptions.map((item) => item.exceptionType)).toEqual(
      expect.arrayContaining(['CATALOG_RULE_CHANGED', 'MISSING_APPROVAL'])
    );
  });
});
