import { by, element, expect, waitFor } from 'detox';

describe('MobileUi', () => {
  const isVisible = async (id: string, timeout = 3000) => {
    try {
      await waitFor(element(by.id(id))).toBeVisible().withTimeout(timeout);
      return true;
    } catch {
      return false;
    }
  };

  it('logs in and opens payment flow when employee context is available', async () => {
    // App starts on Cognito login in clean simulator state.
    try {
      await waitFor(element(by.text('Login'))).toBeVisible().withTimeout(5000);
      await element(by.text('Login')).tap();
    } catch {
      // Ignore if app is already past auth due persisted session.
    }

    if (await isVisible('home-nav-payments', 6000)) {
      await element(by.id('home-nav-payments')).tap();
    }

    // If employee PIN is already set, run the full pay split flow.
    if (await isVisible('order-item-pay-button', 5000)) {
      await element(by.id('order-item-pay-button')).atIndex(0).tap();
      await expect(element(by.id('cart-pay-order-button'))).toBeVisible();
      await element(by.id('cart-pay-order-button')).tap();

      await expect(element(by.id('payment-switch-ebt'))).toBeVisible();
      await element(by.id('payment-switch-ebt')).tap();
      await element(by.id('payment-switch-cash')).tap();

      await expect(element(by.id('payment-input-ebt'))).toHaveText('24.9');
      await expect(element(by.id('payment-input-cash'))).toHaveText('65');
      return;
    }

    // Otherwise assert we reached the employee-PIN gate on Home.
    await expect(element(by.text('Enter your pin:'))).toBeVisible();
  });
});
