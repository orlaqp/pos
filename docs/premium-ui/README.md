# Premium UI Rollout Tracker

## Goal

Bring every major screen in the POS app up to a premium visual standard without destabilizing working flows.

This tracker is organized as an execution plan, not just a wishlist. Each phase file maps to real app surfaces and component entry points in the repo so we can move through the redesign deliberately.

## Hard Constraint

This initiative is visual-only.

What that means:

- No business-rule changes
- No pricing, refund, discount, payment, inventory, reporting, or sync logic changes
- No service, data-flow, schema, API, or persistence changes
- No validation-semantic changes unless you explicitly approve them as non-visual work
- Only presentation-layer work: layout, spacing, typography, color, hierarchy, component composition, empty states, loading states, and visual polish

## How To Use This Tracker

- Treat this folder like the TODO workspace for the premium UI initiative.
- Mark phase-level progress here first.
- Update the checkbox list inside each phase file as work lands.
- Link PRs, screenshots, and notes directly inside the relevant phase file instead of scattering them across chat.
- Avoid redesigning unrelated areas opportunistically; use the phase boundaries to control scope.

## Progress Overview

- [x] Phase 0: Visual system and audit baseline
- [x] Phase 1: Entry flows and home shell
- [x] Phase 2: Sales workspace and checkout
- [x] Phase 3: Orders, payments, and refund experiences
- [x] Phase 4: Back office lists, forms, and navigation
- [x] Phase 5: Reporting and analytics surfaces
- [x] Phase 6: Inventory, settings, and operational screens
- [~] Phase 7: Cross-app polish, QA, and rollout hardening
- [~] Phase 8: Multilanguage localization readiness

## Design Standards For "Premium"

- Clear hierarchy: every screen needs a dominant focal area, a readable secondary layer, and quiet metadata.
- Intentional density: cashiers and admins should see a lot of information, but spacing and grouping must keep it legible.
- Cohesive surfaces: cards, lists, dialogs, and rails should feel like one design language across the app.
- Better motion and transitions: dialogs, empty states, and tab/screen changes should feel deliberate, not abrupt.
- Stronger typography: heading, section label, numeric value, and metadata roles should be visually distinct.
- Better states: loading, empty, error, disabled, selected, active, and archived states must feel designed, not incidental.
- Better alignment: money, quantities, labels, and actions should line up with stricter rhythm.
- Better polish on iPad landscape: many screens already assume landscape, so layouts should feel desktop-grade rather than stretched mobile UI.

## Recommended Execution Order

1. Finish Phase 0 first so the team agrees on tokens, hierarchy rules, and screenshot references.
2. Move through customer-facing revenue-critical flows before back-office cleanup.
3. Keep reporting later than sales/orders so report visual decisions can borrow proven patterns from earlier phases.
4. Reserve cross-app animation and final spacing polish for the last pass so we do not churn the same screens repeatedly.

## Phase Files

- [Phase 0: Visual System Audit](./phase-0-visual-audit.md)
- [Phase 0: Baseline Audit Notes](./phase-0-baseline-audit.md)
- [Phase 0: Token And Layout Reference](./phase-0-token-reference.md)
- [Phase 0: Golden Screens](./phase-0-golden-screens.md)
- [Phase 1: Entry Flows And Home Shell](./phase-1-entry-home.md)
- [Phase 1: Implementation Brief](./phase-1-implementation-brief.md)
- [Phase 2: Sales Workspace And Checkout](./phase-2-sales-checkout.md)
- [Phase 3: Orders Payments And Refunds](./phase-3-orders-payments-refunds.md)
- [Phase 4: Back Office Lists Forms Navigation](./phase-4-back-office.md)
- [Phase 5: Reporting And Analytics](./phase-5-reporting.md)
- [Phase 6: Inventory Settings Operations](./phase-6-operations.md)
- [Phase 7: Cross-App Polish QA Rollout](./phase-7-polish-rollout.md)
- [Phase 7: Rollout Checklist](./phase-7-rollout-checklist.md)
- [Phase 8: Multilanguage Localization Readiness](./phase-8-localization-readiness.md)

## Notes

- There is no dedicated in-repo TODO app to host this plan today, so this docs folder is the source of truth for rollout progress.
- If we later add a planning surface inside the app, these markdown files can be mirrored there.
