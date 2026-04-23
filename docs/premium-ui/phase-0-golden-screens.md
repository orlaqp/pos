# Phase 0 Golden Screens

## Objective
Pick reference screens that represent the visual standard we want each module to converge toward during the premium pass.

These are not perfect screens today. They are the best foundations available in the current app and should guide future redesign decisions.

## Golden Screens By Module

### Sales / Cashier Reference
- Primary candidate: `libs/sales/native-feature/src/lib/components/sales-screen/sales-screen.tsx`
- Why:
  - strongest workspace zoning in the app
  - clearest product-area vs cart-area split
  - already trending toward premium dialogs and better hierarchy

### Checkout / Payment Reference
- Primary candidate: `libs/sales/native-feature/src/lib/components/cart-payment/cart-payment.tsx`
- Why:
  - mission-critical
  - already has summary + controls + action structure
  - useful as the template for other money-sensitive dialogs

### Orders / Post-Sale Reference
- Primary candidate: `libs/orders/native-feature/src/lib/components/open-order-payment-dialog/open-order-payment-dialog.tsx`
- Secondary candidate: `libs/orders/native-feature/src/lib/components/order-void-form/order-void-form.tsx`
- Why:
  - these newer dialogs already show better landscape-first composition
  - they are strong references for two-column task flows

### Reporting Reference
- Primary candidate: `libs/reporting/native-feature/src/lib/components/dashboard/dashboard.tsx`
- Secondary candidate: `libs/reporting/native-feature/src/lib/components/end-of-day/end-of-day.tsx`
- Why:
  - dashboard sets the tone for premium analytics
  - end-of-day provides the densest real reporting-detail surface

### Back Office Shell Reference
- Primary candidate: `libs/back-office/native-feature/src/lib/components/back-office/back-office.tsx`
- Why:
  - it already defines the app’s admin shell
  - later improvements should refine this shell rather than replace the navigation model

### Catalog / Form Reference
- Primary candidates:
  - `libs/products/native-feature/src/lib/components/product-form/product-form.tsx`
  - `libs/store-info/native-feature/src/lib/components/store-info-form/store-info-form.tsx`
- Why:
  - these are closest to the form language we want to standardize
  - they already use the newer tokenized card/stack patterns

### Inventory / Operations Reference
- Primary candidate: `libs/inventory/native-feature/src/lib/components/inventory-counts/inventory-count-form.tsx`
- Why:
  - operational density is high here
  - if this can feel premium, the rest of operations can follow the same pattern

### Entry / Branding Reference
- Primary candidate: `apps/mobile-ui/src/app/HomeScreen.tsx`
- Why:
  - it controls first impression and brand tone
  - it already has the beginnings of a premium hero + route-card structure

## What "Golden" Means In Practice
- Later phases should try to reuse successful patterns from these screens first.
- If a redesign introduces a better pattern, that screen can become the new reference.
- We should not let each module invent a unique visual grammar unless the workflow truly requires it.

## Promotion Rule
A screen can be promoted to a golden reference when:
- it has clear page hierarchy
- it uses token-consistent spacing
- it has premium-looking states
- it works well in iPad landscape
- it does not rely on business-logic changes to feel polished

## Safe Scope Reminder
This file is a visual guidance artifact only. It does not authorize behavior or business-rule changes.
