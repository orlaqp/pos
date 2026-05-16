jest.mock('@pos/discounts/domain', () => ({
  DiscountReconciler: {
    reconcile: jest.fn(() => ({ status: 'RECONCILED', exceptions: [] })),
  },
}));

import { DiscountReconciler } from '@pos/discounts/domain';
import { DiscountReconciliationService } from './discount-reconciliation.service';

describe('DiscountReconciliationService', () => {
  it('delegates reconciliation to the domain reconciler', () => {
    const local = { order: { total: 10, applications: [] }, summary: {} } as any;
    const backend = { order: { total: 10, applications: [] }, summary: {} } as any;

    const result = DiscountReconciliationService.reconcile(local, backend);

    expect(DiscountReconciler.reconcile).toHaveBeenCalledWith({ local, backend });
    expect(result).toEqual({ status: 'RECONCILED', exceptions: [] });
  });
});
