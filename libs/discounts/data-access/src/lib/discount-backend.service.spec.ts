import { DiscountBackendService } from './discount-backend.service';

describe('DiscountBackendService', () => {
  it('throws for preview until the backend is wired', async () => {
    await expect(
      DiscountBackendService.previewTransactionPricing({ orderId: '1' })
    ).rejects.toThrow('previewTransactionPricing is not wired yet');
  });

  it('throws for reconciliation until the backend is wired', async () => {
    await expect(
      DiscountBackendService.reconcileOfflineOrder({ orderId: '1' })
    ).rejects.toThrow('reconcileOfflineOrder is not wired yet');
  });

  it('throws for commit until the backend is wired', async () => {
    await expect(
      DiscountBackendService.commitPricedOrder({ orderId: '1' })
    ).rejects.toThrow('commitPricedOrder is not wired yet');
  });

  it('throws for exception resolution until the backend is wired', async () => {
    await expect(
      DiscountBackendService.resolveDiscountException({ exceptionId: '1' })
    ).rejects.toThrow('resolveDiscountException is not wired yet');
  });
});
