import { by, device, element, waitFor } from 'detox';

const DEFAULT_E2E_OWNER_EMAIL = 'orlaqp@gmail.com';
const DEFAULT_E2E_OWNER_PASSWORD = 'Password01$';
const DEFAULT_E2E_MANAGER_PIN = '4321';

type TextAttributes = {
  text?: string;
  label?: string;
  value?: string;
};

type DetoxElementWithAttributes = {
  getAttributes: () => Promise<TextAttributes & { value?: string | number | boolean }>;
};

const ownerEmail = process.env.E2E_OWNER_EMAIL || DEFAULT_E2E_OWNER_EMAIL;
const ownerPassword = process.env.E2E_OWNER_PASSWORD || DEFAULT_E2E_OWNER_PASSWORD;
const MANAGER_PIN = process.env.E2E_MANAGER_PIN || DEFAULT_E2E_MANAGER_PIN || '4321';

export const pause = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const launchTestApp = async (
  options: Parameters<typeof device.launchApp>[0],
) => {
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

export const isVisible = async (id: string, timeout = 5000) => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeout) {
    try {
      await (
        element(by.id(id)) as unknown as DetoxElementWithAttributes
      ).getAttributes();
      return true;
    } catch {
      await pause(250);
    }
  }

  return false;
};

export const findVisibleElement = async (
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

export const readText = async (id: string) => {
  const attrs = await (
    element(by.id(id)) as unknown as DetoxElementWithAttributes
  ).getAttributes();
  return `${attrs.text || attrs.label || attrs.value || ''}`;
};

export const isAnyVisible = async (
  matchers: Array<ReturnType<typeof element>>,
  timeout = 5000,
) => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeout) {
    for (const candidate of matchers) {
      try {
        await (
          candidate as unknown as DetoxElementWithAttributes
        ).getAttributes();
        return true;
      } catch {
        // Keep checking.
      }
    }

    await pause(250);
  }

  return false;
};

export const tapFirstAvailable = async (
  matchers: Array<ReturnType<typeof element>>,
  timeout = 10000,
) => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeout) {
    for (const candidate of matchers) {
      try {
        await (
          candidate as unknown as DetoxElementWithAttributes
        ).getAttributes();
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

export const waitForTextValue = async (
  id: string,
  expected: string,
  timeout = 15000,
) => {
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

export const waitForNonEmptyText = async (id: string, timeout = 15000) => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeout) {
    try {
      const text = await readText(id);
      if (text.trim().length > 0) {
        return text;
      }
    } catch {
      // Keep polling.
    }

    await pause(300);
  }

  throw new Error(`Timed out waiting for ${id} to contain text`);
};

export const readNumericText = async (id: string) => {
  const textValue = await readText(id);
  const parsed = Number.parseFloat(textValue.replace(/[^0-9.-]/g, ''));

  if (Number.isNaN(parsed)) {
    throw new Error(`Unable to parse numeric value from ${id}: ${textValue}`);
  }

  return parsed;
};

export const searchByInput = async (id: string, value: string) => {
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

export const tapPin = async (pin: string) => {
  for (const digit of pin.split('')) {
    await element(by.id(`ui-keypad-key-${digit}`)).tap();
  }
};

export const loginOwnerIfNeeded = async () => {
  if (await isVisible('owner-login-screen', 5000)) {
    if (await isVisible('e2e-owner-login-button', 2000)) {
      await element(by.id('e2e-owner-login-button')).tap();
      await pause(1500);

      if (!(await isVisible('owner-login-screen', 1200))) {
        return;
      }
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
    await pause(1500);

    if (await isVisible('owner-login-screen', 1200)) {
      const status = (await isVisible('login-auth-status', 500))
        ? await readText('login-auth-status')
        : 'unknown';
      const error = (await isVisible('login-auth-error', 500))
        ? await readText('login-auth-error')
        : '';

      if (status === 'error' || error) {
        throw new Error(
          `Owner login failed. status="${status}" error="${error || 'none'}"`,
        );
      }
    }
  }
};

export const resetTenantBaseline = async () => {
  await waitForNonEmptyText('e2e-auth-email', 15000);
  await pause(1000);

  const currentStatus = await readText('e2e-seed-status');
  if (currentStatus === 'ready') {
    return;
  }

  if (currentStatus === 'resetting') {
    await waitForTextValue('e2e-seed-status', 'ready', 60000);
    return;
  }

  const startedAt = Date.now();

  while (Date.now() - startedAt < 90000) {
    const status = await readText('e2e-seed-status');
    if (status === 'ready') {
      return;
    }

    if (status === 'resetting') {
      await waitForTextValue('e2e-seed-status', 'ready', 60000);
      return;
    }

    if (status === 'idle' || status === 'clean') {
      await pause(1200);
      continue;
    }

    if (status !== 'missing-auth-user') {
      await waitForTextValue('e2e-seed-status', 'ready', 60000);
      return;
    }

    if (!(await isVisible('home-pin-login-screen', 500))) {
      await element(by.id('e2e-reset-data')).tap();
    }
    await pause(1200);
  }

  const authEmail = (await isVisible('e2e-auth-email', 500))
    ? await readText('e2e-auth-email')
    : '';
  throw new Error(
    `Timed out resetting tenant baseline. status="missing-auth-user" authEmail="${authEmail}"`,
  );
};

export const cleanupTenantBaseline = async () => {
  if (!(await isVisible('e2e-cleanup-data', 2000))) {
    return;
  }

  const currentStatus = await readText('e2e-seed-status').catch(() => '');
  if (currentStatus === 'clean') {
    return;
  }

  if (await isVisible('home-pin-login-screen', 1000)) {
    return;
  }

  if (await isVisible('RNE__Overlay__backdrop', 1000)) {
    return;
  }

  await element(by.id('e2e-cleanup-data')).tap();
  await waitForTextValue('e2e-seed-status', 'clean', 60000);
};

export const waitForHome = async () => {
  const visible =
    (await isVisible('home-screen', 15000)) ||
    (await isVisible('home-ready-shell', 15000)) ||
    (await isVisible('home-nav-sales', 15000)) ||
    (await isAnyVisible([element(by.text('Sales')), element(by.text('Back Office'))], 15000));
  if (!visible) {
    throw new Error('Timed out waiting for Sales tile on home screen');
  }
};

export const ensureCashierReady = async (resetData = false) => {
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

export const openSalesFromHome = async () => {
  await waitForHome();
  await tapFirstAvailable([element(by.id('home-nav-sales')), element(by.text('Sales'))]);
  const visible = await isVisible('product-selection-list', 10000);
  if (!visible) {
    throw new Error('Timed out waiting for Sales screen catalog');
  }
};

export const openBackOfficeFromHome = async () => {
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

export const openBackOfficeSidebarPath = async (
  submenuId: string,
  itemId: string,
) => {
  const submenu = element(by.id(`sidebar-submenu-${submenuId}`));
  const item = element(by.id(`sidebar-item-${itemId}`));

  const submenuVisible = await isVisible(`sidebar-submenu-${submenuId}`, 20000);
  if (!submenuVisible) {
    throw new Error(`Timed out waiting for sidebar submenu ${submenuId}`);
  }

  await submenu.tap({ x: 100, y: 56 });

  const itemVisible = await isVisible(`sidebar-item-${itemId}`, 20000);
  if (!itemVisible) {
    throw new Error(`Timed out waiting for sidebar item ${itemId}`);
  }

  await item.tap({ x: 100, y: 56 });
};

export const waitForPrintCount = async (count: number) => {
  await waitForTextValue('e2e-print-count', String(count), 15000);
};

export const readLatestPrintJob = async () => {
  const raw = await readText('e2e-print-last');
  return JSON.parse(raw);
};

export const expectTextVisible = async (text: string, timeout = 10000) => {
  await waitFor(element(by.text(text))).toBeVisible().withTimeout(timeout);
};

export const expectElementHidden = async (id: string, timeout = 10000) => {
  await waitFor(element(by.id(id))).not.toBeVisible().withTimeout(timeout);
};

export const openOrdersFromSalesActions = async () => {
  await element(by.id('nav-sales-actions-button')).tap();
  await element(by.id('nav-actions-open-orders')).tap();
  await waitFor(element(by.id('order-list-screen')))
    .toBeVisible()
    .withTimeout(10000);
};

export const selectOrderStatusTab = async (label: string) => {
  await element(by.text(label)).tap();
};

export const readSwitchValue = async (id: string) => {
  const attrs = await (
    element(by.id(id)) as unknown as DetoxElementWithAttributes
  ).getAttributes();
  return attrs.value;
};
