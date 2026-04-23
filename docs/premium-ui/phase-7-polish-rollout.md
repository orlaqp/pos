# Phase 7: Cross-App Polish, QA, And Rollout

## Objective
Finalize the premium pass by removing inconsistency, tightening motion and states, and validating the redesign across real workflows.

## Guardrail
This phase is visual-only. It must not introduce business-rule changes while polishing, standardizing, or validating the UI.

## Scope
- All customer-facing and admin surfaces touched in Phases 1 through 6
- Shared UI primitives and any style helpers touched during the rollout

## Tasks
- [ ] Run a full screen-by-screen visual pass to catch inconsistencies.
- [ ] Standardize loading, empty, error, disabled, and offline states across all major modules.
- [ ] Review dialogs for consistent sizing, corner radius, action placement, and backdrop treatment.
- [ ] Review typography rhythm across all screens.
- [ ] Review numeric alignment across sales, orders, payments, receipts previews, and reports.
- [ ] Validate landscape behavior on representative iPad sizes.
- [ ] Capture final before/after screenshots for each major module.
- [ ] Create a rollout checklist separating safe visual-only changes from changes that need extra business-flow QA.

## Acceptance Criteria
- The app feels like one premium product across all modules.
- No screen feels left behind after the redesign.
- Visual upgrades have been reviewed against real cashier/admin workflows, not just isolated components.

## Release Checklist
- [ ] Sales flow smoke test
- [ ] Open-order payment smoke test
- [ ] Partial and full refund smoke test
- [ ] Receipt print smoke test
- [ ] Inventory count and receive smoke test
- [ ] Reporting accuracy smoke test after visual changes
- [ ] Back-office form save/edit smoke test

## Notes / Links
- Add screenshots, references, or PRs here as this phase progresses.
