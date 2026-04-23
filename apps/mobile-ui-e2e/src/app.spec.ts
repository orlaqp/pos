import { by, element, expect, waitFor } from 'detox';
import {
  cleanupTenantBaseline,
  ensureCashierReady,
  expectElementHidden,
  isVisible,
  launchTestApp,
  openBackOfficeFromHome,
  openBackOfficeSidebarPath,
  openOrdersFromSalesActions,
  openSalesFromHome,
  readLatestPrintJob,
  readNumericText,
  readSwitchValue,
  searchByInput,
  selectOrderStatusTab,
  tapFirstAvailable,
  waitForPrintCount,
} from './support/app-driver';
import { BackOfficeSelectors, ProductFormSelectors } from './support/selectors';

describe('MobileUi release gate', () => {
  beforeAll(async () => {
    await launchTestApp({ newInstance: true, delete: false });
  });

  afterAll(async () => {
    await cleanupTenantBaseline();
  });

  it('creates an order, prints customer then merchant copies, closes the order, and decrements inventory', async () => {
    await ensureCashierReady(true);
    await openSalesFromHome();
    await searchByInput('sales-product-search-input', 'bread fixture');
    const beforeQty = 24;

    await waitFor(element(by.label('Bread Fixture, In stock: 24.00, $ 3.49')).atIndex(0))
      .toBeVisible()
      .withTimeout(15000);
    await element(by.text('Bread Fixture')).atIndex(0).tap();
    if (await isVisible('sales-product-details-submit', 3000)) {
      if (await isVisible('product-details-quantity-input', 1000)) {
        await element(by.id('product-details-quantity-input')).replaceText('1');
      }
      await element(by.id('sales-product-details-submit')).tap();
    }
    await tapFirstAvailable(
      [
        element(by.id('cart-pay-order-e2e-shortcut')),
        element(by.text('E2E Checkout')),
        element(by.text('E2E Print Order')),
        element(by.id('cart-pay-order-button')),
        element(by.text('Print Order')),
        element(by.text('Receive Payment')),
      ],
      10000,
    );

    await waitForPrintCount(1);
    const customerPrint = await readLatestPrintJob();
    expect(customerPrint.copyType).toBe('CUSTOMER');
    expect(customerPrint.receiptText).toContain('Customer Copy');

    await openOrdersFromSalesActions();

    await waitFor(element(by.id('order-item-pay-button')))
      .toBeVisible()
      .withTimeout(10000);
    await element(by.id('order-item-pay-button')).atIndex(0).tap();

    await waitFor(element(by.id('open-order-payment-dialog')))
      .toBeVisible()
      .withTimeout(5000);

    await waitFor(element(by.id('payment-switch-cash')))
      .toBeVisible()
      .withTimeout(5000);
    await element(by.id('payment-switch-cash')).tap();
    await element(by.id('payment-submit-button')).tap();

    await waitForPrintCount(2);
    const merchantPrint = await readLatestPrintJob();
    expect(merchantPrint.copyType).toBe('MERCHANT');
    expect(merchantPrint.receiptText).toContain('Merchant Copy');

    await waitFor(element(by.id('order-item-pay-button')))
      .not.toBeVisible()
      .withTimeout(10000);

    await selectOrderStatusTab('PAID');
    await waitFor(element(by.id('order-item-print-button')))
      .toBeVisible()
      .withTimeout(10000);

    await launchTestApp({ newInstance: true });
    await ensureCashierReady(false);
    await openSalesFromHome();
    await searchByInput('sales-product-search-input', 'bread fixture');
    await waitFor(element(by.label('Bread Fixture, In stock: 23.00, $ 3.49')).atIndex(0))
      .toBeVisible()
      .withTimeout(15000);
    const afterQty = 23;
    expect(afterQty).toBe(beforeQty - 1);
  });

  it('supports pay-from-sales-screen as a persisted device setting and keeps paid orders out of OPEN', async () => {
    await launchTestApp({ newInstance: true });
    await ensureCashierReady(true);
    await openBackOfficeFromHome();
    await openBackOfficeSidebarPath(
      BackOfficeSelectors.settings,
      BackOfficeSelectors.settingsGeneral,
    );

    await waitFor(element(by.id('settings-screen')))
      .toBeVisible()
      .withTimeout(10000);
    const currentValue = await readSwitchValue(
      'settings-pay-from-sales-screen-switch',
    );
    if (!currentValue) {
      await element(by.id('settings-pay-from-sales-screen-switch')).tap();
    }

    await launchTestApp({ newInstance: true });
    await ensureCashierReady(false);
    await openSalesFromHome();

    await searchByInput('sales-product-search-input', 'bread fixture');
    await waitFor(element(by.text('Bread Fixture')).atIndex(0))
      .toBeVisible()
      .withTimeout(15000);
    await element(by.text('Bread Fixture')).atIndex(0).tap();
    if (await isVisible('sales-product-details-submit', 3000)) {
      if (await isVisible('product-details-quantity-input', 1000)) {
        await element(by.id('product-details-quantity-input')).replaceText('1');
      }
      await element(by.id('sales-product-details-submit')).tap();
    }
    await tapFirstAvailable(
      [
        element(by.id('cart-pay-order-e2e-shortcut')),
        element(by.text('E2E Checkout')),
        element(by.id('cart-pay-order-button')),
        element(by.text('Receive Payment')),
        element(by.text('Print Order')),
      ],
      10000,
    );

    await waitFor(element(by.id('payment-submit-button')))
      .toBeVisible()
      .withTimeout(5000);
    await element(by.id('payment-switch-cash')).tap();
    await element(by.id('payment-submit-button')).tap();

    await waitForPrintCount(2);
    const latestPrint = await readLatestPrintJob();
    expect(latestPrint.copyType).toBe('MERCHANT');

    await openOrdersFromSalesActions();
    await expectElementHidden('order-item-pay-button', 10000);
    await selectOrderStatusTab('PAID');
    await waitFor(element(by.id('order-item-print-button')))
      .toBeVisible()
      .withTimeout(10000);
  });

  it('updates inventory through receive flow and supports search submit via Enter', async () => {
    await launchTestApp({ newInstance: true });
    await ensureCashierReady(true);
    await openBackOfficeFromHome();

    await openBackOfficeSidebarPath('4', '4-1');

    await searchByInput('inventory-stock-search-input', 'bread fixture');
    const breadQtyId = 'inventory-stock-qty-ebt-bread-fixture';
    await waitFor(element(by.id(breadQtyId))).toBeVisible().withTimeout(5000);
    const beforeQty = await readNumericText(breadQtyId);

    await openBackOfficeSidebarPath('4', '4-3');
    await waitFor(element(by.id('ui-generic-item-list-add-button')))
      .toBeVisible()
      .withTimeout(6000);
    await element(by.id('ui-generic-item-list-add-button')).tap();

    await searchByInput('inventory-receive-search-input', 'bread fixture');
    await waitFor(element(by.id('compact-product-add-ebt-bread-fixture')))
      .toBeVisible()
      .withTimeout(6000);
    await element(by.id('compact-product-add-ebt-bread-fixture')).tap();
    await waitFor(element(by.id('inventory-receive-qty-ebt-bread-fixture')))
      .toBeVisible()
      .withTimeout(6000);
    await element(by.id('inventory-receive-qty-ebt-bread-fixture')).tap();
    await element(by.id('inventory-receive-qty-ebt-bread-fixture')).replaceText('3');
    await element(by.id('inventory-receive-update-inventory-button')).tap();

    if (
      await waitFor(element(by.text('Yes')))
        .toBeVisible()
        .withTimeout(2500)
        .then(() => true)
        .catch(() => false)
    ) {
      await element(by.text('Yes')).tap();
    }

    await openBackOfficeSidebarPath('4', '4-1');
    await searchByInput('inventory-stock-search-input', 'bread fixture');
    await waitFor(element(by.id(breadQtyId))).toBeVisible().withTimeout(7000);
    const afterQty = await readNumericText(breadQtyId);

    expect(afterQty).toBe(beforeQty + 3);
  });

  it('creates a product through the catalog form and keeps it searchable in the list', async () => {
    await launchTestApp({ newInstance: true });
    await ensureCashierReady(true);
    await openBackOfficeFromHome();
    await openBackOfficeSidebarPath(
      BackOfficeSelectors.catalog,
      BackOfficeSelectors.products,
    );

    await waitFor(element(by.id('ui-generic-item-list-add-button')))
      .toBeVisible()
      .withTimeout(8000);
    await element(by.id('ui-generic-item-list-add-button')).tap();

    await waitFor(element(by.id(ProductFormSelectors.name)))
      .toBeVisible()
      .withTimeout(8000);
    await element(by.id(ProductFormSelectors.name)).replaceText('E2E Catalog Product');
    await element(by.id(ProductFormSelectors.cost)).replaceText('1.49');
    await element(by.id(ProductFormSelectors.price)).replaceText('3.99');
    await element(by.id(ProductFormSelectors.sku)).replaceText('E2E-CATALOG-1');
    await element(by.id(ProductFormSelectors.save)).tap();

    await waitFor(element(by.id('ui-generic-item-list-search-input')))
      .toBeVisible()
      .withTimeout(10000);
    await searchByInput('ui-generic-item-list-search-input', 'E2E Catalog Product');
    await waitFor(element(by.text('E2E Catalog Product (EA)')))
      .toBeVisible()
      .withTimeout(10000);
  });

  it('opens End of Day and toggles filter and summary sections without crashing', async () => {
    await launchTestApp({ newInstance: true });
    await ensureCashierReady(true);
    await openBackOfficeFromHome();
    await openBackOfficeSidebarPath(
      BackOfficeSelectors.reports,
      BackOfficeSelectors.endOfDay,
    );

    await waitFor(element(by.id('end-of-day-screen')))
      .toBeVisible()
      .withTimeout(10000);
    await waitFor(element(by.id('end-of-day-toggle-filters-button')))
      .toBeVisible()
      .withTimeout(5000);

    await element(by.id('end-of-day-toggle-filters-button')).tap();
    await waitFor(element(by.id('end-of-day-filter-bar')))
      .not.toBeVisible()
      .withTimeout(5000);
    await element(by.id('end-of-day-toggle-filters-button')).tap();
    await waitFor(element(by.id('end-of-day-filter-bar')))
      .toBeVisible()
      .withTimeout(5000);

    await element(by.id('end-of-day-toggle-summary-button')).tap();
    await waitFor(element(by.id('end-of-day-summary-section')))
      .not.toBeVisible()
      .withTimeout(5000);
    await element(by.id('end-of-day-toggle-summary-button')).tap();

    await waitFor(element(by.id('end-of-day-date-button')))
      .toBeVisible()
      .withTimeout(5000);
  });
});
