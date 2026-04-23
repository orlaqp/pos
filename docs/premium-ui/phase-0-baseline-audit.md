# Phase 0 Baseline Audit

## Status
In progress

This document captures the initial visual-system audit based on the current codebase and screen architecture. It is intentionally visual-only and does not propose business-logic or workflow changes.

## Screen Surface Inventory

### Entry And Shell
- `apps/mobile-ui/src/app/HomeScreen.tsx`
- `apps/mobile-ui/src/app/home-route-grid.tsx`
- `apps/mobile-ui/src/app/home-pin-login.tsx`
- `apps/mobile-ui/src/app/home-setup-wizard.tsx`
- `apps/mobile-ui/src/app/navigation.tsx`
- `libs/back-office/native-feature/src/lib/components/back-office/back-office.tsx`
- `libs/back-office/native-feature/src/lib/components/sidebar/sidebar.tsx`

### Cashier / Revenue-Critical
- `libs/sales/native-feature/src/lib/components/sales-screen/sales-screen.tsx`
- `libs/sales/native-feature/src/lib/components/cart/cart.tsx`
- `libs/sales/native-feature/src/lib/components/cart-payment/cart-payment.tsx`
- `libs/orders/native-feature/src/lib/components/order-list/order-list.tsx`
- `libs/orders/native-feature/src/lib/components/order-item/order-item.tsx`
- `libs/orders/native-feature/src/lib/components/order-void-form/order-void-form.tsx`
- `libs/orders/native-feature/src/lib/components/open-order-payment-dialog/open-order-payment-dialog.tsx`

### Reporting
- `libs/reporting/native-feature/src/lib/components/dashboard/dashboard.tsx`
- `libs/reporting/native-feature/src/lib/components/report-viewer/report-viewer.tsx`
- `libs/reporting/native-feature/src/lib/components/end-of-day/end-of-day.tsx`
- `libs/reporting/native-feature/src/lib/components/sales/sales.tsx`
- `libs/reporting/native-feature/src/lib/components/payment-summary/payment-summary.tsx`
- `libs/reporting/native-feature/src/lib/components/refund-report/refund-report.tsx`

### Admin / Back Office
- Catalog: products, categories, brands, unit of measures
- Employees
- Discounts / promo codes / policies / exceptions
- Inventory in-stock / counts / receives
- Settings / store / station / printers / logs

## Strong Existing Patterns Worth Reusing
- Sales workspace uses stronger page zoning than most other modules.
- Dialog redesigns completed recently are trending toward better use of landscape width.
- Orders list row chips are a good reference for compact metadata display.
- Reporting widgets and summary cards already establish a decent financial hierarchy.
- Back-office shell already has a recognizable left-rail plus content workspace structure.
- Shared dark theme direction is strong enough to build on rather than replace.

## Weak Patterns To Eliminate
- Stacked mobile-like forms stretched into landscape without rethinking information density.
- Inconsistent page headers: some screens feel premium, others feel like raw forms or lists.
- Uneven card hierarchy: some cards feel primary, others look visually identical despite lower importance.
- Table-like layouts that rely on plain text spacing instead of consistent column rhythm.
- Empty states that fall back to bare tables or low-intent placeholders.
- Dialogs that are technically larger but still internally laid out like narrow vertical forms.
- Summary metrics that use different spacing and typography rules depending on the screen.

## Repeated Visual Pain Points
- Metadata often competes too much with primary values.
- Financial numbers do not always align to a strict right-edge rhythm.
- Labels and values vary too much in scale and spacing across screens.
- Dense operational screens often lack a strong focal section.
- Secondary adjustment rows like discounts/refunds can look too similar to primary line items.
- Search/filter bars are not always visually integrated with the screens they control.

## Premium Rules Baseline

### 1. Page Composition
- Every screen needs one dominant zone, one supporting zone, and one metadata/support layer.
- Landscape screens should feel intentionally desktop-like, not just wider mobile stacks.
- Primary actions should sit in predictable, repeated locations per screen type.

### 2. Typography Roles
- Page title: strong, high-contrast, visually dominant
- Section title: medium-strong, clearly separated from metadata
- Key metric: largest numeric/value scale on the screen
- Standard value: readable, high-contrast body/value text
- Metadata: quiet, smaller, lower-contrast
- Adjustment label: secondary and compact

### 3. Surface Hierarchy
- Primary workspace cards should have the strongest contrast and breathing room.
- Summary rails should read as supporting intelligence, not as equal competitors to the main work zone.
- Read-only reference content should be visibly quieter than interactive content.

### 4. Spacing Rhythm
- Consistent page padding per module
- Consistent section spacing between header, summary, and content
- Consistent internal card padding
- Tighter spacing only where high-density scanability truly benefits from it

### 5. Dialog Rules
- Dialogs should be sized by task complexity, not by inherited defaults.
- Multi-step or financially sensitive dialogs should use multi-column layouts when landscape space exists.
- Sticky action areas are preferred for long dialogs where actions must remain visible.

### 6. Lists And Tables
- Amounts should share a common right edge.
- Labels and status chips should not wrap unless intentionally designed to do so.
- Adjustment rows should look like adjustments, not peers of primary line items.
- Empty state should always feel intentional and branded.

### 7. States
- Loading, empty, disabled, selected, active, archived, refunded, and warning states must be visually differentiated through more than color alone.
- Muted states should still look designed.

## Recommended Shared Pattern Library For Later Phases
- Premium page header
- Summary metric rail
- Section intro block
- Search and filter bar
- Dense operational list row
- Financial detail card
- Landscape modal shell
- Sticky action rail
- Table-like data box
- Empty state panel

## Module Priority Recommendation
1. Sales and checkout
2. Orders / payments / refunds
3. Entry and home shell
4. Reporting
5. Back office lists and forms
6. Inventory and settings
7. Cross-app consistency polish

## Safe Scope Reminder
All later work under this initiative must remain visual-only:
- no business-rule changes
- no pricing/refund/payment/reporting logic changes
- no schema/service/data-flow changes

## Next Outputs Needed
- Screen capture set for before/after tracking
- A short visual token reference for spacing/typography/surface hierarchy
- One approved “golden” screen per module to use as the standard for subsequent redesigns
