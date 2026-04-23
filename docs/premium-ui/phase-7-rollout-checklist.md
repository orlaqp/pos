# Phase 7 Rollout Checklist

## Purpose

Use this checklist to validate the premium UI pass without mixing visual polish with business-rule changes.

## Safe Visual-Only Changes

- Layout, spacing, card composition, and screen framing
- Typography hierarchy, metadata treatment, and text color contrast
- Loading, empty, disabled, selected, active, archived, warning, and error state presentation
- Dialog sizing, backdrop treatment, corner radius, and action placement
- Numeric alignment, column rhythm, and report table readability
- iPad landscape layout tuning that does not change form submission or data-fetch behavior

## Requires Extra Business-Flow QA

- Any change that touches checkout, payment, refund, order creation, sync, inventory mutation, report calculations, or persistence
- Any change that changes validation rules, default values, data mapping, model fields, or service calls
- Any change that changes the order of async operations or receipt printing
- Any change that changes how quantities, prices, taxes, discounts, or payment totals are calculated

## Screen-By-Screen Visual Pass

- Entry and setup: admin login, signup, confirm signup, PIN entry, setup wizard, access waiting states
- Sales: catalog, cart, payment dialog, discounts, promo code, price override, order journal
- Orders: open orders, paid orders, refunded orders, order detail, payment entry, refund flow
- Back office: products, categories, brands, units, employees, discounts, shared create/edit forms
- Reports: dashboard, end of day, payment summary, refund report, chart panels, report tables
- Inventory: stock list, count list, count form, receive list, receive form, transactional line rows
- Operations: settings, system logs, store profile, station configuration, printer setup

## State Matrix

- Loading state uses the shared spinner language and does not expose raw blank pages.
- Empty state uses the shared empty-state component or equivalent card treatment with a clear next action when applicable.
- Error state is visible, human-readable, and does not look like a disabled or empty state.
- Disabled state uses opacity/color plus button disabled behavior, not color alone.
- Offline/sync state shows clear metadata without blocking unrelated visual navigation.

## Dialog Review

- Dialogs use consistent rounded surfaces and internal padding.
- Primary and secondary actions stay in predictable positions.
- Cancel/close behavior remains unchanged.
- Payment/refund dialogs preserve the existing money flow and receipt behavior.

## Numeric And Table Review

- Currency totals align visually and do not wrap on iPad landscape.
- Quantity, total, and count labels use consistent metadata treatment.
- Report tables preserve row data, totals, and filters after visual changes.
- Dashboard cards keep large numbers readable at common iPad widths.

## Manual Smoke Tests

- Sales flow: create an open order, one-step paid sale, and canceled payment attempt.
- Open-order payment: pay an existing open order and confirm status moves to paid.
- Refunds: partial refund and full refund from paid order.
- Receipts: customer copy and merchant copy print paths.
- Inventory: count update and receive update with multiple products.
- Reports: dashboard totals and end-of-day totals after visual changes.
- Back-office forms: create and update product, store info, station number, discount, and employee.

## Screenshot Set

- Capture before/after screenshots for each major module at iPad landscape size.
- Capture at least one loading, empty, and populated state where practical.
- Store screenshots beside the phase notes or link them from this file.
