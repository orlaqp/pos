# Split Payment Auto-Calculation Design

## Purpose

Improve the cashier-facing receive payment flow so split payments are faster and less error-prone. The main goal is to let the app behave like a payment calculator: when a cashier enters one amount in a two-method split, the other method calculates the remaining balance automatically.

This design applies to the existing mobile receive payment panel in `libs/sales/native-feature/src/lib/components/cart-payment/`.

## Current Behavior

The payment panel already supports credit card, cash, check, and EBT payment methods. When a method is activated, the app can auto-fill an initial amount using the current remaining balance. EBT is already capped by the EBT-eligible total during initial auto-fill, and the order service validates EBT again before saving paid orders.

The current gap is that after two methods are active, editing one amount does not rebalance the other method. Cashiers must manually calculate and enter both sides of the split.

## Approved Approach

Use a live two-method payment balancer with a balance bar.

When exactly two payment methods are active:

- The most recently edited field is treated as the cashier-entered amount.
- The other active method is treated as the calculated amount.
- The calculated method updates while the cashier types.
- If the cashier taps and edits the calculated method, it becomes the cashier-entered amount and the other method recalculates.
- Payment amount fields select their full value on focus so the cashier can replace an amount quickly.
- If a focused field is left blank, the existing restore-on-blur behavior restores the previous amount.

When three or more payment methods are active:

- The app keeps the current manual behavior.
- The footer continues to show remaining or overpaid guidance.
- No method is automatically changed, because the app cannot infer which method should absorb the difference.

## EBT Rules

EBT remains constrained by the EBT-eligible total.

- EBT cannot exceed the EBT-eligible amount.
- If the cashier types an EBT amount above the eligible amount, the UI caps it to the eligible amount while typing.
- The paired non-EBT method recalculates against the capped EBT amount.
- The existing order-service validation remains the final protection before saving an order.

Example:

- Order total: `$100.00`
- EBT eligible total: `$35.00`
- Cashier types `$50.00` in EBT
- EBT caps to `$35.00`
- The paired method recalculates to `$65.00`

## Surcharge Rules

Credit card surcharge logic remains based on the credit card payment amount.

If credit card is the calculated method, its surcharge display updates as the calculated card base amount changes. If credit card is the cashier-entered method, the paired method recalculates without changing the entered card amount.

The receive payment submit rule still requires the base payment amounts to match the order total exactly. The card surcharge remains additional charge metadata, consistent with the existing surcharge behavior.

## UX Direction

Use the selected balance bar direction.

The receive payment panel should show a compact split visualization when two methods are active. The balance bar should make it clear how the order total is divided across the active methods. When EBT is involved, the bar should clearly distinguish EBT-covered eligible amount from the remaining tender.

The payment cards should also provide small helper text where useful:

- Cashier-entered amount
- Auto-calculated remaining
- EBT capped at eligible amount

The existing footer remains responsible for:

- Received total
- Remaining amount
- Overpayment guidance
- Credit card surcharge details
- Ready-to-finalize status

## Implementation Boundaries

Keep the change focused on the receive payment flow.

Expected areas:

- `cart-payment.logic.ts` for reusable split-balancing calculations
- `cart-payment.tsx` for field behavior, active-method tracking, balance bar display, and helper text
- `cart-payment.logic.spec.ts` for calculation rules
- `cart-payment.spec.tsx` for integration behavior

Do not change product, tax, reporting, or backend schema behavior as part of this feature.

## Testing Strategy

Add focused tests for:

- Two active non-EBT methods rebalance while one amount changes.
- Editing the previously calculated method flips which method is calculated.
- Three active methods do not auto-rebalance.
- EBT caps to the EBT-eligible total while typing.
- The paired method recalculates from capped EBT.
- Blank-on-blur restores the previous amount.
- Credit card surcharge display updates when the card amount is calculated.
- Receive payment remains disabled unless base payments match the order total exactly.

Existing order-service EBT validation tests should remain unchanged as the final data safety net.

## Acceptance Criteria

- Cashiers can split an order across two payment methods without manually calculating the second amount.
- Payment fields select their full value on focus.
- EBT cannot be entered above the EBT-eligible total.
- The balance bar clearly shows the two-method split.
- Three-method splits remain manual and predictable.
- Existing payment submission, surcharge enrichment, and backend EBT validation continue to work.
