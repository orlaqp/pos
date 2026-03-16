import { DiscountReconciler, PricingPreviewResult, ReconciliationResult } from '@pos/discounts/domain';

export class DiscountReconciliationService {
  static reconcile(local: PricingPreviewResult, backend: PricingPreviewResult): ReconciliationResult {
    return DiscountReconciler.reconcile({ local, backend });
  }
}
