# Sales Tax UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a cashier-facing subtotal/tax/total block to the sales cart that appears only when tax is applied.

**Architecture:** Keep tax calculation in the existing pricing flow and add only a presentational cart totals component. The cart will pass existing `cart.footer` totals plus `globalSettings.taxValue` into the component, and the checkout button will continue using `cart.footer.total`.

**Tech Stack:** React Native, React Redux selectors, `@rneui/themed` button controls, Nx/Jest, `@testing-library/react-native`.

---

## File Structure

- Create `libs/sales/native-feature/src/lib/components/cart/cart-tax-totals.tsx`
  - Single responsibility: render the compact cashier-facing tax totals block when tax is positive.
  - Exports one component, `CartTaxTotals`.
  - Does not calculate tax; it formats already-calculated cart totals.
- Modify `libs/sales/native-feature/src/lib/components/cart/cart.tsx`
  - Import `CartTaxTotals`.
  - Render it in the cart action area above `Save Open Order` and `Receive Payment`.
- Modify `libs/sales/native-feature/src/lib/components/cart/cart.styles.ts`
  - Add styles for the compact totals surface and rows.
- Modify `libs/sales/native-feature/src/lib/components/cart/cart.spec.tsx`
  - Add integration tests proving the block is hidden without tax and visible with tax.

## Task 1: Add Sales Cart Tax Totals Tests

**Files:**
- Modify: `libs/sales/native-feature/src/lib/components/cart/cart.spec.tsx`

- [ ] **Step 1: Add failing tests**

Add these tests near the other cart rendering tests, after the empty-cart test inside the existing `describe('Cart', () => {` block:

```tsx
    it('hides the tax totals block when the cart has no tax', () => {
        mockCartState.footer.subtotal = 6.99;
        mockCartState.footer.tax = 0;
        mockCartState.footer.total = 6.99;
        mockGlobalSettingsState = { taxValue: 7 };

        const { queryByTestId, getByText } = renderCart('order', {
            preferPayFromSalesScreen: true,
        });

        expect(queryByTestId('cart-tax-totals')).toBeNull();
        expect(getByText('Receive Payment  •  $6.99')).toBeTruthy();
    });

    it('shows subtotal tax and total when the cart has tax', () => {
        mockCartState.footer.subtotal = 6.99;
        mockCartState.footer.tax = 0.49;
        mockCartState.footer.total = 7.48;
        mockGlobalSettingsState = { taxValue: 7 };

        const { getByTestId, getByText } = renderCart('order', {
            preferPayFromSalesScreen: true,
        });

        expect(getByTestId('cart-tax-totals')).toBeTruthy();
        expect(getByText('Subtotal')).toBeTruthy();
        expect(getByText('$6.99')).toBeTruthy();
        expect(getByText('Tax (7%)')).toBeTruthy();
        expect(getByText('$0.49')).toBeTruthy();
        expect(getByText('Total')).toBeTruthy();
        expect(getByText('$7.48')).toBeTruthy();
        expect(getByText('Receive Payment  •  $7.48')).toBeTruthy();
    });

    it('uses a plain tax label when the configured tax rate is unavailable', () => {
        mockCartState.footer.subtotal = 6.99;
        mockCartState.footer.tax = 0.49;
        mockCartState.footer.total = 7.48;
        mockGlobalSettingsState = {};

        const { getByText, queryByText } = renderCart('order', {
            preferPayFromSalesScreen: true,
        });

        expect(getByText('Tax')).toBeTruthy();
        expect(queryByText('Tax (7%)')).toBeNull();
    });
```

- [ ] **Step 2: Run the focused tests to verify they fail**

Run:

```bash
PATH=/Users/orlando/.nvm/current/bin:/opt/homebrew/bin:$PATH /opt/homebrew/bin/yarn nx test sales-native-feature --testFile=libs/sales/native-feature/src/lib/components/cart/cart.spec.tsx --skip-nx-cache
```

Expected: FAIL because `cart-tax-totals` and the tax labels do not exist yet.

## Task 2: Add The Presentational Tax Totals Component

**Files:**
- Create: `libs/sales/native-feature/src/lib/components/cart/cart-tax-totals.tsx`
- Modify: `libs/sales/native-feature/src/lib/components/cart/cart.styles.ts`

- [ ] **Step 1: Create `CartTaxTotals`**

Create `libs/sales/native-feature/src/lib/components/cart/cart-tax-totals.tsx` with:

```tsx
import React from 'react';
import { Text, View } from 'react-native';
import { translateWithFallback } from '@pos/shared/utils';
import type { CartStyles } from './cart.styles';

interface CartTaxTotalsProps {
    styles: CartStyles;
    subtotal?: number | null;
    tax?: number | null;
    total?: number | null;
    taxValue?: number | null;
}

const isPositiveFinite = (value?: number | null): value is number =>
    typeof value === 'number' && Number.isFinite(value) && value > 0;

const formatCurrency = (value?: number | null) =>
    `$${(Number.isFinite(value) ? Number(value) : 0).toFixed(2)}`;

const formatTaxLabel = (taxValue?: number | null) => {
    const t = translateWithFallback;

    if (!isPositiveFinite(taxValue)) {
        return t('CART_Tax', 'Tax');
    }

    return t('CART_TaxWithRate', 'Tax ({{rate}}%)', {
        rate: Number.isInteger(taxValue) ? String(taxValue) : String(taxValue),
    });
};

export function CartTaxTotals({
    styles,
    subtotal,
    tax,
    total,
    taxValue,
}: CartTaxTotalsProps) {
    const t = translateWithFallback;

    if (!isPositiveFinite(tax)) {
        return null;
    }

    return (
        <View testID="cart-tax-totals" style={styles.taxTotalsCard}>
            <View style={styles.taxTotalsRow}>
                <Text style={styles.taxTotalsLabel}>
                    {t('COMMON_Subtotal', 'Subtotal')}
                </Text>
                <Text style={styles.taxTotalsValue}>
                    {formatCurrency(subtotal)}
                </Text>
            </View>
            <View style={styles.taxTotalsRow}>
                <Text style={styles.taxTotalsLabel}>
                    {formatTaxLabel(taxValue)}
                </Text>
                <Text style={styles.taxTotalsValue}>
                    {formatCurrency(tax)}
                </Text>
            </View>
            <View style={[styles.taxTotalsRow, styles.taxTotalsRowStrong]}>
                <Text style={styles.taxTotalsLabelStrong}>
                    {t('COMMON_Total', 'Total')}
                </Text>
                <Text style={styles.taxTotalsValueStrong}>
                    {formatCurrency(total)}
                </Text>
            </View>
        </View>
    );
}

export default CartTaxTotals;
```

- [ ] **Step 2: Add styles for the totals block**

In `libs/sales/native-feature/src/lib/components/cart/cart.styles.ts`, add these style keys near `checkoutSecondaryButtonContainer` and `primaryButtonContainer`:

```ts
        taxTotalsCard: {
            borderRadius: tokens.radii.md,
            borderWidth: 1,
            borderColor: tokens.colors.border,
            backgroundColor: tokens.colors.surfaceMuted,
            paddingHorizontal: tokens.spacing.md,
            paddingVertical: tokens.spacing.sm,
            marginBottom: tokens.spacing.sm,
        },
        taxTotalsRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: tokens.spacing.sm,
            minHeight: 26,
        },
        taxTotalsRowStrong: {
            marginTop: tokens.spacing.xs,
            paddingTop: tokens.spacing.xs,
            borderTopWidth: 1,
            borderTopColor: tokens.colors.border,
        },
        taxTotalsLabel: {
            color: tokens.colors.textSecondary,
            fontSize: 14,
            fontWeight: '700',
        },
        taxTotalsLabelStrong: {
            color: tokens.colors.textPrimary,
            fontSize: 15,
            fontWeight: '800',
        },
        taxTotalsValue: {
            color: tokens.colors.textPrimary,
            fontSize: 14,
            fontWeight: '800',
        },
        taxTotalsValueStrong: {
            color: tokens.colors.textPrimary,
            fontSize: 18,
            fontWeight: '800',
        },
```

- [ ] **Step 3: Run the focused tests**

Run:

```bash
PATH=/Users/orlando/.nvm/current/bin:/opt/homebrew/bin:$PATH /opt/homebrew/bin/yarn nx test sales-native-feature --testFile=libs/sales/native-feature/src/lib/components/cart/cart.spec.tsx --skip-nx-cache
```

Expected: still FAIL because the cart does not render `CartTaxTotals` yet.

## Task 3: Integrate The Totals Block Into The Cart

**Files:**
- Modify: `libs/sales/native-feature/src/lib/components/cart/cart.tsx`

- [ ] **Step 1: Import the new component**

In `libs/sales/native-feature/src/lib/components/cart/cart.tsx`, add this import with the other local cart imports:

```ts
import { CartTaxTotals } from './cart-tax-totals';
```

- [ ] **Step 2: Render it above checkout actions**

In `libs/sales/native-feature/src/lib/components/cart/cart.tsx`, inside `<View style={localStyles.actionsWrap}>`, place this block after the invalid-item warning and before the `payFromSalesScreen ? (` conditional that renders `testID="cart-save-open-order-button"`:

```tsx
                <CartTaxTotals
                    styles={localStyles}
                    subtotal={cart.footer.subtotal}
                    tax={cart.footer.tax}
                    total={cart.footer.total}
                    taxValue={globalSettings?.taxValue}
                />
```

The order in `actionsWrap` should be: development E2E shortcut, discount actions, invalid item warning, `CartTaxTotals`, save-open-order button when enabled, primary checkout button.

- [ ] **Step 3: Run the focused tests**

Run:

```bash
PATH=/Users/orlando/.nvm/current/bin:/opt/homebrew/bin:$PATH /opt/homebrew/bin/yarn nx test sales-native-feature --testFile=libs/sales/native-feature/src/lib/components/cart/cart.spec.tsx --skip-nx-cache
```

Expected: PASS.

## Task 4: Verify Formatting And Type Safety

**Files:**
- Verify: `libs/sales/native-feature/src/lib/components/cart/cart-tax-totals.tsx`
- Verify: `libs/sales/native-feature/src/lib/components/cart/cart.tsx`
- Verify: `libs/sales/native-feature/src/lib/components/cart/cart.styles.ts`
- Verify: `libs/sales/native-feature/src/lib/components/cart/cart.spec.tsx`

- [ ] **Step 1: Run lint for the sales native feature**

Run:

```bash
PATH=/Users/orlando/.nvm/current/bin:/opt/homebrew/bin:$PATH /opt/homebrew/bin/yarn nx lint sales-native-feature --skip-nx-cache
```

Expected: PASS.

- [ ] **Step 2: Run the focused cart tests one more time**

Run:

```bash
PATH=/Users/orlando/.nvm/current/bin:/opt/homebrew/bin:$PATH /opt/homebrew/bin/yarn nx test sales-native-feature --testFile=libs/sales/native-feature/src/lib/components/cart/cart.spec.tsx --skip-nx-cache
```

Expected: PASS.

- [ ] **Step 3: Review the diff**

Run:

```bash
git diff -- libs/sales/native-feature/src/lib/components/cart/cart-tax-totals.tsx libs/sales/native-feature/src/lib/components/cart/cart.tsx libs/sales/native-feature/src/lib/components/cart/cart.styles.ts libs/sales/native-feature/src/lib/components/cart/cart.spec.tsx
```

Expected: the diff only includes the new tax totals component, its styles, cart integration, and focused tests.

## Task 5: Commit The UI Change

**Files:**
- Stage: `libs/sales/native-feature/src/lib/components/cart/cart-tax-totals.tsx`
- Stage: `libs/sales/native-feature/src/lib/components/cart/cart.tsx`
- Stage: `libs/sales/native-feature/src/lib/components/cart/cart.styles.ts`
- Stage: `libs/sales/native-feature/src/lib/components/cart/cart.spec.tsx`

- [ ] **Step 1: Stage only the sales tax UI files**

Run:

```bash
git add libs/sales/native-feature/src/lib/components/cart/cart-tax-totals.tsx \
  libs/sales/native-feature/src/lib/components/cart/cart.tsx \
  libs/sales/native-feature/src/lib/components/cart/cart.styles.ts \
  libs/sales/native-feature/src/lib/components/cart/cart.spec.tsx
```

- [ ] **Step 2: Confirm staged files**

Run:

```bash
git diff --cached --name-status
```

Expected:

```text
A	libs/sales/native-feature/src/lib/components/cart/cart-tax-totals.tsx
M	libs/sales/native-feature/src/lib/components/cart/cart.tsx
M	libs/sales/native-feature/src/lib/components/cart/cart.styles.ts
M	libs/sales/native-feature/src/lib/components/cart/cart.spec.tsx
```

- [ ] **Step 3: Commit**

Run:

```bash
git commit -m "feat: show sales tax totals in cart"
```

Expected: commit succeeds with only the four sales cart files.

## Self-Review

- Spec coverage: cashier-facing only, hidden when tax is zero, compact totals above checkout, rate label included when available, no line item badges, no backend/pricing/reporting changes.
- Placeholder scan: no placeholder markers or unspecified test/implementation steps remain.
- Type consistency: component props match existing cart footer fields and `globalSettings.taxValue`; style keys are defined before use.
