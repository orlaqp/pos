# Stability Baseline Checklist (Step 1)

## Goal
Lock core POS behavior before redesign or major dependency upgrades.

## Scope (Must Stay Stable)
- Sales cart operations (add/remove/update qty)
- Payment flow (Cash/CC/Check/EBT)
- EBT constraints and mixed payments
- Order lifecycle (OPEN -> PAID -> REFUNDED)
- Receipt/printing paths

## Out of Scope (Step 1)
- Visual redesign implementation
- Large dependency version jumps
- Refactoring unrelated modules

## Preconditions
1. Use iOS simulator with app running from this workspace.
2. Ensure fixture data is seeded:
   ```bash
   cd /Users/orlando/dev/pos
   node .codex/scripts/seed-ebt-fixtures.mjs
   ```
3. Ensure env target is expected (for Amplify safety):
   ```bash
   cd /Users/orlando/dev/pos/apps/mobile-ui
   test "$(node -e "console.log(require('./amplify/.config/local-env-info.json').envName)")" = "ebtdev"
   ```

## Critical Flow Smoke Matrix

### F1. Build Cart
- Add EBT product and non-EBT product.
- Update quantity for each.
- Remove one line item and add it back.
- Expected: totals update correctly, no crashes.

### F2. EBT Auto-Fill + Split
- In payment modal, enable EBT first.
- Expected: EBT defaults to `min(total, EBT eligible total)`.
- Enable Cash/CC next.
- Expected: newly enabled method auto-fills remaining balance.

### F3. EBT Overpay Block
- Set EBT amount above EBT-eligible subtotal.
- Expected: payment is blocked with EBT validation message.

### F4. Empty-Blur Restore in Payment Inputs
- Tap payment amount field (value clears on focus).
- Leave field empty and blur.
- Expected: original value restores.

### F5. Complete Mixed Payment
- Use EBT + Cash/CC and submit order.
- Expected: order transitions to PAID; no validation errors.

### F6. Open Orders Action
- On Payments -> OPEN tab, verify row action is `Pay`.
- Open an order and complete payment.
- Expected: order leaves OPEN and appears under PAID.

### F7. Cart Label Hygiene
- Open order with EBT and non-EBT lines.
- Expected: no `EBT ` / `NON-EBT ` prefix in product names; ribbon indicates EBT.

### F8. Receipt Integrity
- Print/reprint paid order.
- Expected: receipt totals align with cart; EBT/non-EBT paid amounts are consistent.

## Evidence to Capture
Store screenshots in:
`/Users/orlando/dev/pos/.codex/evidence/stability-baseline/`

Minimum screenshots:
1. Payment modal with EBT eligible amount shown.
2. EBT overpay alert.
3. Successful mixed payment confirmation/order status.
4. OPEN list row with `Pay` action.
5. Cart lines without EBT/NON-EBT text prefixes.

## Automation Gate (Current)
Run before redesign branch work:
```bash
cd /Users/orlando/dev/pos
yarn eslint libs/sales/native-feature/src/lib/components/cart-payment/cart-payment.tsx \
  libs/sales/native-feature/src/lib/components/cart/cart.tsx \
  libs/orders/native-feature/src/lib/components/order-item/order-item.tsx \
  libs/orders/data-access/src/lib/order.entity.ts \
  libs/shared/ui-native/src/lib/components/ui-numeric-input/ui-numeric-input.tsx

yarn nx test orders-data-access
```

Note: workspace-level lint currently has known unrelated failures in other files; Step 1 uses targeted gates for touched areas.

## Exit Criteria (Step 1 Complete)
- All F1-F8 pass manually.
- Evidence screenshots captured.
- Targeted lint/tests pass.
- No checkout-blocking regressions remain.
