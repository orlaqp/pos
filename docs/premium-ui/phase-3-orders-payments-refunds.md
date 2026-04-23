# Phase 3: Orders, Payments, And Refunds

## Objective
Make post-sale workflows feel as premium and trustworthy as live sales, especially where money, refunds, and reprints are involved.

## Guardrail
This phase is visual-only. It must not change refund logic, payment logic, receipt business rules, order status behavior, service behavior, data flow, or persistence.

## Primary Surfaces
- `libs/orders/native-feature/src/lib/components/orders/orders.tsx`
- `libs/orders/native-feature/src/lib/components/order-list/order-list.tsx`
- `libs/orders/native-feature/src/lib/components/order-item/order-item.tsx`
- `libs/orders/native-feature/src/lib/components/open-order-payment-dialog/open-order-payment-dialog.tsx`
- `libs/orders/native-feature/src/lib/components/order-void-form/order-void-form.tsx`
- `libs/orders/native-feature/src/lib/components/order-voidable-item/order-voidable-item.tsx`
- `libs/orders/native-feature/src/lib/components/order-journal-list/order-journal-list.tsx`
- `libs/orders/native-feature/src/lib/components/compact-order-list/compact-order-list.tsx`
- `libs/orders/native-feature/src/lib/components/compact-order-item/compact-order-item.tsx`

## UX Goals
- Order tabs, rows, and detail actions should feel premium, not crowded.
- Refund dialogs should feel serious, deliberate, and easy to audit.
- Open-order payment flow should visually match the upgraded checkout experience.

## Tasks
- [x] Refine order row density, action affordances, and amount hierarchy.
- [x] Standardize status treatment for paid, partially refunded, refunded, and open orders.
- [x] Improve tab bar rhythm and filter/search balance.
- [x] Continue polishing the direct payment popup as a premium companion to sales checkout.
- [x] Standardize rounded action-button treatment across order, payment, and refund dialogs.
- [x] Refine void/refund screen layout for long orders and multi-step refunds.
- [x] Ensure read-only refunded reference rows feel clearly secondary.
- [x] Align receipt-reference and order-summary surfaces visually where they share content.

## Acceptance Criteria
- Orders feel like a premium operational console rather than a utility list.
- Refund UX feels calm and auditable even on complex mixed-tender or discounted cases.
- Open-order payment looks like the same product as checkout, not a parallel system.

## Dependencies
- Phase 2 patterns for payment surfaces

## Notes / Links
- Add screenshots, references, or PRs here as this phase progresses.

## Progress Notes
- The main orders console now has a stronger premium filter/search shell with better spacing and clearer operational rhythm.
- Order rows now separate order reference, cashier metadata, status, amount, and actions more deliberately without changing order behavior.
- Status and amount hierarchy now feel more consistent for open, paid, partially refunded, and refunded rows while remaining visual-only.
- The direct payment popup now reads as a tighter companion to checkout with a simpler summary surface and less wasted vertical chrome.
- The refund workspace now has stronger section hierarchy, better column spacing, clearer action surfaces, and calmer read-only refunded rows.
- The compact open-order picker and device journal now share the same premium shell, spacing rhythm, and calmer hierarchy as the main orders console.
- Rounded action treatment is now more consistent across the payment, refund, compact-order, and journal dialogs.
- Shared order-summary presentation now carries the same visual language across sales checkout reference and open-order payment reference surfaces.
