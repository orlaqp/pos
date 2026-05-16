# EBT QA Checklist (Simulator, `ebtdev`)

## Preconditions
1. Open terminal in `/Users/orlando/dev/pos/apps/mobile-ui`.
2. Confirm env guard:
   ```bash
   test "$(node -e "console.log(require('./amplify/.config/local-env-info.json').envName)")" = "ebtdev" || { echo "ABORT: not on ebtdev"; exit 1; }
   ```
3. Ensure app runs in iOS simulator.
4. Seed fixtures once (idempotent):
   ```bash
   cd /Users/orlando/dev/pos
   node .codex/scripts/seed-ebt-fixtures.mjs
   ```

## Fixture Data Used
- EBT-eligible products:
  - `EBT Apple Fixture`
  - `EBT Bread Fixture`
- Non-EBT products:
  - `NON-EBT Shampoo Fixture`
  - `NON-EBT Soap Fixture`
- Store: `EBT Dev Store`
- Employee code: `EBTDEV01`
- Station alias: `EBT DEV STATION`
- Printer alias: `EBT DEV PRINTER`

## Test 1: Product Form + List Marker
1. Open Back Office > Products.
2. Edit `EBT Apple Fixture`.
3. Verify `EBT Eligible` switch is visible and ON.
4. Toggle OFF, save, reopen and verify persisted OFF.
5. Toggle ON again, save.
6. Verify product list row shows EBT badge/marker.

Expected:
- Switch persists correctly.
- Product list shows EBT marker only for eligible products.

## Test 2: Sales Grid + Details + Cart Markers
1. Open Sales screen.
2. Add `EBT Apple Fixture` and `NON-EBT Shampoo Fixture` to cart.
3. Tap each product details card.

Expected:
- EBT product tile/details/cart line show EBT marker.
- Non-EBT product does not show EBT marker.

## Test 3: EBT Overpay Block
1. Build cart with:
   - `EBT Apple Fixture` x1 ($2.49)
   - `NON-EBT Shampoo Fixture` x1 ($6.50)
2. Go to payment.
3. Enable EBT and enter `$4.00`.
4. Fill remaining method(s) so paid total >= order total.
5. Tap Complete Order.

Expected:
- Order blocked with EBT validation message.
- Reason states EBT cannot exceed EBT-eligible subtotal.

## Test 4: Valid Mixed Payment
1. Keep mixed cart from Test 3.
2. Enter EBT as `$2.49`.
3. Enter CASH/CARD for remainder.
4. Complete order.

Expected:
- Order closes successfully.
- No validation error.

## Test 5: Receipt Grouping and Split Amounts
1. For the successful mixed order, open print/receipt preview.
2. Verify EBT grouping appears only when EBT payment exists.
3. Verify items are grouped or annotated by EBT vs non-EBT.
4. For partial-line case, create cart where EBT pays part of an eligible line and verify partial split amount display.

Expected:
- Receipt includes clear EBT/non-EBT sections or annotations.
- Split values are readable and mathematically correct.

## Test 6: Legacy Order Reprint Compatibility
1. Pick an older order created before EBT fields existed.
2. Reprint receipt.

Expected:
- Reprint works without crash.
- Missing new EBT fields do not break mapping/printing.

## Test 7: Unlimited Payment Methods
1. Build any cart.
2. Enable more than two payment methods (e.g., EBT + CASH + CC).
3. Enter amounts and complete.

Expected:
- UI allows more than two methods.
- Validation still enforces total paid and EBT cap.

## Evidence to Capture
- Screenshot of product form switch.
- Screenshot of product list/cart EBT marker.
- Screenshot of blocked overpay alert.
- Screenshot of successful mixed payment.
- Receipt screenshot showing EBT/non-EBT grouping.
