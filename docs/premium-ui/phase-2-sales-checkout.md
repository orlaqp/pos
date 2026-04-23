# Phase 2: Sales Workspace And Checkout

## Objective
Turn the cashier workflow into the strongest visual experience in the app: focused, premium, fast, and spatially clear.

## Guardrail
This phase is visual-only. It must not change pricing, discount logic, payment rules, EBT logic, checkout behavior, validation semantics, service behavior, data flow, or persistence.

## Primary Surfaces
- `libs/sales/native-feature/src/lib/components/sales-screen/sales-screen.tsx`
- `libs/sales/native-feature/src/lib/components/sales-screen/sales-catalog-pane.tsx`
- `libs/sales/native-feature/src/lib/components/sales-screen/sales-product-dialog.tsx`
- `libs/sales/native-feature/src/lib/components/sales-screen/sales-current-deals-dialog.tsx`
- `libs/sales/native-feature/src/lib/components/product-selection/product-selection.tsx`
- `libs/sales/native-feature/src/lib/components/product-details/product-details.tsx`
- `libs/sales/native-feature/src/lib/components/product-search/product-search.tsx`
- `libs/sales/native-feature/src/lib/components/category-selection/category-selection.tsx`
- `libs/sales/native-feature/src/lib/components/cart/cart.tsx`
- `libs/sales/native-feature/src/lib/components/cart-line/cart-line.tsx`
- `libs/sales/native-feature/src/lib/components/cart-payment/cart-payment.tsx`
- `libs/sales/native-feature/src/lib/components/cart/cart-order-summary-dialog.tsx`
- `libs/sales/native-feature/src/lib/components/cart/order-summary-panel.tsx`
- `libs/sales/native-feature/src/lib/components/cart/cart-manual-discount-dialog.tsx`
- `libs/sales/native-feature/src/lib/components/cart/cart-promo-dialog.tsx`
- `libs/sales/native-feature/src/lib/components/cart/cart-price-override-dialog.tsx`

## UX Goals
- Catalog, cart, and payments should feel like one premium workspace.
- Checkout should always preserve clarity around amount due, EBT eligibility, discounts, and actions.
- Dialogs should feel spacious and modern, not just wider versions of stacked mobile forms.

## Tasks
- [x] Audit page-level balance between catalog pane, cart, and headers.
- [~] Standardize card/surface language across catalog, cart, and dialogs.
- [x] Refine the Current Deals surface so it feels embedded in the sales language.
- [x] Polish product popup hierarchy, especially quantity, pricing, and confirm actions.
- [x] Improve cart row hierarchy for price, discounts, EBT, and manual adjustments.
- [x] Keep payment UI visually premium while preserving operational speed.
- [x] Revisit dialog sizing, shadows, borders, and sticky action areas across checkout-related popups.

## Acceptance Criteria
- Sales is visually the strongest screen in the app.
- Payment, discount, and override dialogs feel consistent with each other.
- Cashiers can scan the screen faster because primary and secondary information are more clearly separated.

## Dependencies
- Phase 0 design rules
- Entry-shell decisions from Phase 1 where shared patterns apply

## Notes / Links
- Add screenshots, references, or PRs here as this phase progresses.

## Progress Notes
- Sales now has a stronger workspace shell with premium framing around the header, catalog, and checkout rail.
- The catalog header now carries more context while keeping the same search and category behavior.
- The `Current deals` dialog now feels like part of the sales language instead of a generic utility modal.
- The product popup now has calmer hierarchy, clearer quantity controls, and more breathable spacing for operational use.
- Cart rows now separate metadata, discount state, EBT state, and totals more clearly without changing cart behavior.
- Payment now carries a stronger premium hierarchy with clearer summary framing, more deliberate active-state treatment, and steadier footer emphasis.
- Promo and price-override dialogs now share the same premium dialog shell and spacing language as the rest of checkout.
- All work remains visual-only; no pricing, checkout, payment, or discount behavior changed.
