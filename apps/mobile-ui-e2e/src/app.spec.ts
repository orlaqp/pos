import { by, device, element, expect, waitFor } from 'detox';

type TextAttributes = {
  text?: string;
  label?: string;
  value?: string;
};

type DetoxElementWithAttributes = {
  getAttributes: () => Promise<TextAttributes>;
};

const OWNER_EMAIL = process.env.E2E_OWNER_EMAIL;
const OWNER_PASSWORD = process.env.E2E_OWNER_PASSWORD;
const MANAGER_PIN = process.env.E2E_MANAGER_PIN || '4321';

const requireEnv = (value: string | undefined, name: string) => {
  if (!value) {
    throw new Error(`${name} is required to run mobile-ui Detox release gates`);
  }

  return value;
};

const ownerEmail = requireEnv(OWNER_EMAIL, 'E2E_OWNER_EMAIL');
const ownerPassword = requireEnv(OWNER_PASSWORD, 'E2E_OWNER_PASSWORD');

const launchTestApp = async (options: Parameters<typeof device.launchApp>[0]) => {
  await device.launchApp({
    ...options,
    launchArgs: {
      ...(options?.launchArgs || {}),
      detoxEnableSynchronization: 0,
      e2eEnabled: 'true',
      e2eOwnerEmail: ownerEmail,
      e2eOwnerPassword: ownerPassword,
      e2eManagerPin: MANAGER_PIN,
    },
  });
  await device.disableSynchronization();
};

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isVisible = async (id: string, timeout = 5000) => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeout) {
    try {
      await (element(by.id(id)) as unknown as DetoxElementWithAttributes).getAttributes();
      return true;
    } catch {
      await pause(250);
    }
  }

  return false;
};

const findVisibleElement = async (
  factories: Array<() => ReturnType<typeof element>>,
  timeout = 1000,
) => {
  for (const factory of factories) {
    const candidate = factory();
    try {
      await waitFor(candidate).toBeVisible().withTimeout(timeout);
      return candidate;
    } catch {
      // Try the next selector.
    }
  }

  return null;
};

const readText = async (id: string) => {
  const attrs = await (element(by.id(id)) as unknown as DetoxElementWithAttributes).getAttributes();
  return `${attrs.text || attrs.label || attrs.value || ''}`;
};

const isAnyVisible = async (
  matchers: Array<ReturnType<typeof element>>,
  timeout = 5000,
) => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeout) {
    for (const candidate of matchers) {
      try {
        await (candidate as unknown as DetoxElementWithAttributes).getAttributes();
        return true;
      } catch {
        // Keep checking.
      }
    }

    await pause(250);
  }

  return false;
};

const tapFirstAvailable = async (
  matchers: Array<ReturnType<typeof element>>,
  timeout = 10000,
) => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeout) {
    for (const candidate of matchers) {
      try {
        await (candidate as unknown as DetoxElementWithAttributes).getAttributes();
        await candidate.tap();
        return;
      } catch {
        // Keep checking.
      }
    }

    await pause(250);
  }

  throw new Error('Timed out waiting for tappable element');
};

const waitForTextValue = async (id: string, expected: string, timeout = 15000) => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeout) {
    try {
      const text = await readText(id);
      if (text === expected) {
        return;
      }
    } catch {
      // Keep polling.
    }

    await pause(300);
  }

  throw new Error(`Timed out waiting for ${id} to equal "${expected}"`);
};

const readNumericText = async (id: string) => {
  const textValue = await readText(id);
  const parsed = Number.parseFloat(textValue.replace(/[^0-9.-]/g, ''));

  if (Number.isNaN(parsed)) {
    throw new Error(`Unable to parse numeric value from ${id}: ${textValue}`);
  }

  return parsed;
};

const searchByInput = async (id: string, value: string) => {
  const input = element(by.id(id));
  await waitFor(input).toBeVisible().withTimeout(5000);
  await input.tap();
  await input.replaceText(value);

  try {
    await input.tapReturnKey();
  } catch {
    await input.typeText('\n');
  }
};

const tapPin = async (pin: string) => {
  for (const digit of pin.split('')) {
    await element(by.id(`ui-keypad-key-${digit}`)).tap();
  }
};

const loginOwnerIfNeeded = async () => {
  if (await isVisible('owner-login-screen', 5000)) {
    if (await isVisible('e2e-owner-login-button', 2000)) {
      await element(by.id('e2e-owner-login-button')).tap();
      return;
    }

    const emailInput = await findVisibleElement([
      () => element(by.id('login-email-input')),
      () => element(by.type('RCTSinglelineTextInputView')).atIndex(0),
      () => element(by.type('RCTUITextField')).atIndex(0),
      () => element(by.type('UITextField')).atIndex(0),
    ]);
    const passwordInput = await findVisibleElement([
      () => element(by.id('login-password-input')),
      () => element(by.type('RCTSinglelineTextInputView')).atIndex(1),
      () => element(by.type('RCTUITextField')).atIndex(1),
      () => element(by.type('UITextField')).atIndex(1),
    ]);

    if (!emailInput || !passwordInput) {
      throw new Error('Unable to locate owner login inputs in Detox');
    }

    await waitFor(element(by.id('login-submit-button')))
      .toBeVisible()
      .withTimeout(5000);
    await emailInput.tap();
    await emailInput.replaceText(ownerEmail);
    await passwordInput.tap();
    await passwordInput.replaceText(ownerPassword);
    await element(by.id('login-submit-button')).tap();
  }
};

const resetTenantBaseline = async () => {
  await pause(1000);
  await element(by.id('e2e-reset-data')).tap();
  await waitForTextValue('e2e-seed-status', 'ready', 60000);
};

const cleanupTenantBaseline = async () => {
  if (!(await isVisible('e2e-cleanup-data', 2000))) {
    return;
  }

  await element(by.id('e2e-cleanup-data')).tap();
  await waitForTextValue('e2e-seed-status', 'clean', 60000);
};

const waitForHome = async () => {
  const visible =
    (await isVisible('home-screen', 15000)) ||
    (await isVisible('home-ready-shell', 15000)) ||
    (await isVisible('home-nav-sales', 15000)) ||
    (await isAnyVisible([element(by.text('Sales')), element(by.text('Back Office'))], 15000));
  if (!visible) {
    throw new Error('Timed out waiting for Sales tile on home screen');
  }
};

const ensureCashierReady = async (resetData = false) => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < 120000) {
    if (await isVisible('owner-login-screen', 800)) {
      await loginOwnerIfNeeded();
      await pause(1000);
      continue;
    }

    if (await isVisible('app-startup-title', 800)) {
      const title = await readText('app-startup-title');
      if (title === 'Startup failed') {
        const status = (await isVisible('app-startup-status', 500))
          ? await readText('app-startup-status')
          : '';
        throw new Error(`Startup screen failed. title="${title}" status="${status}"`);
      }

      await pause(1000);
      continue;
    }

    if (await isVisible('home-pin-login-screen', 800)) {
      if (await isVisible('e2e-manager-login-button', 500)) {
        await element(by.id('e2e-manager-login-button')).tap();
      } else {
        await tapPin(MANAGER_PIN);
      }
      await pause(1500);
      continue;
    }

    if (
      (await isVisible('home-screen', 800)) ||
      (await isVisible('home-ready-shell', 800)) ||
      (await isVisible('home-nav-sales', 800)) ||
      (await isAnyVisible([element(by.text('Sales')), element(by.text('Back Office'))], 800))
    ) {
      if (resetData) {
        await resetTenantBaseline();
        resetData = false;
      }
      await waitForHome();
      return;
    }

    await pause(800);
  }

  throw new Error('Timed out waiting for cashier-ready state');
};

const openSalesFromHome = async () => {
  await waitForHome();
  await tapFirstAvailable([
    element(by.id('home-nav-sales')),
    element(by.text('Sales')),
  ]);
  const visible = await isVisible('product-selection-list', 10000);
  if (!visible) {
    throw new Error('Timed out waiting for Sales screen catalog');
  }
};

const openBackOfficeFromHome = async () => {
  const visible =
    (await isVisible('home-nav-backoffice', 7000)) ||
    (await isAnyVisible([element(by.text('Back Office'))], 7000));
  if (!visible) {
    throw new Error('Timed out waiting for Back Office tile on home screen');
  }
  await tapFirstAvailable([
    element(by.id('home-nav-backoffice')),
    element(by.text('Back Office')),
  ]);
};

const waitForPrintCount = async (count: number) => {
  await waitForTextValue('e2e-print-count', String(count), 15000);
};

const readLatestPrintJob = async () => {
  const raw = await readText('e2e-print-last');
  return JSON.parse(raw);
};

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

    const beforeQty = await readNumericText('sales-product-stock-ebt-bread-fixture');

    await element(by.id('ui-button-ebt-bread-fixture')).tap();
    await element(by.id('cart-pay-order-button')).tap();
    await waitFor(element(by.id('order-summary-print-button')))
      .toBeVisible()
      .withTimeout(5000);
    await element(by.id('order-summary-print-button')).tap();

    await waitForPrintCount(1);
    const customerPrint = await readLatestPrintJob();
    expect(customerPrint.copyType).toBe('CUSTOMER');
    expect(customerPrint.receiptText).toContain('Customer Copy');

    await element(by.id('nav-sales-actions-button')).tap();
    await element(by.id('nav-actions-open-orders')).tap();

    await waitFor(element(by.id('order-item-pay-button')))
      .toBeVisible()
      .withTimeout(10000);
    await element(by.id('order-item-pay-button')).atIndex(0).tap();

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

    await element(by.text('PAID')).tap();
    await waitFor(element(by.id('order-item-print-button')))
      .toBeVisible()
      .withTimeout(10000);

    await launchTestApp({ newInstance: true });
    await ensureCashierReady(false);
    await openSalesFromHome();

    const afterQty = await readNumericText('sales-product-stock-ebt-bread-fixture');
    expect(afterQty).toBe(beforeQty - 1);
  });

  it('updates inventory through receive flow and supports search submit via Enter', async () => {
    await launchTestApp({ newInstance: true });
    await ensureCashierReady(true);
    await openBackOfficeFromHome();

    await element(by.text('Inventory')).tap();
    await element(by.text('In Stock')).tap();

    await searchByInput('inventory-stock-search-input', 'bread fixture');
    const breadQtyId = 'inventory-stock-qty-ebt-bread-fixture';
    await waitFor(element(by.id(breadQtyId))).toBeVisible().withTimeout(5000);
    const beforeQty = await readNumericText(breadQtyId);

    await element(by.text('Inventory')).tap();
    await element(by.text('Receives')).tap();
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

    await element(by.text('Inventory')).tap();
    await element(by.text('In Stock')).tap();
    await searchByInput('inventory-stock-search-input', 'bread fixture');
    await waitFor(element(by.id(breadQtyId))).toBeVisible().withTimeout(7000);
    const afterQty = await readNumericText(breadQtyId);

    expect(afterQty).toBe(beforeQty + 3);
  });
});
