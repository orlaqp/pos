import {
  PricingPreviewResult,
  ReconciliationResult,
} from '@pos/discounts/domain';

export class DiscountBackendService {
  static async previewTransactionPricing(
    input: unknown
  ): Promise<PricingPreviewResult> {
    throw new Error(`previewTransactionPricing is not wired yet: ${JSON.stringify(input)}`);
  }

  static async commitPricedOrder(input: unknown): Promise<unknown> {
    throw new Error(`commitPricedOrder is not wired yet: ${JSON.stringify(input)}`);
  }

  static async reconcileOfflineOrder(
    input: unknown
  ): Promise<ReconciliationResult> {
    throw new Error(`reconcileOfflineOrder is not wired yet: ${JSON.stringify(input)}`);
  }

  static async resolveDiscountException(input: unknown): Promise<unknown> {
    throw new Error(`resolveDiscountException is not wired yet: ${JSON.stringify(input)}`);
  }
}
