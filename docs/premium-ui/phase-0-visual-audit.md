# Phase 0: Visual System Audit

## Objective
Create the shared visual rules that every later redesign step will follow, so improvements feel unified instead of screen-by-screen inconsistent.

## Guardrail
This phase is visual-only. It must not change business rules, calculations, validation semantics, service behavior, data flow, or persistence.

## Scope
- `apps/mobile-ui/src/app/HomeScreen.tsx`
- `libs/back-office/native-feature/src/lib/components/back-office/back-office.tsx`
- `libs/reporting/native-feature/src/lib/components/report-viewer/report-viewer.tsx`
- Shared style and token consumers across:
  - `@pos/theme/native`
  - `@pos/shared/ui-native`

## Deliverables
- A screenshot audit of current screens grouped by:
  - strong patterns worth reusing
  - weak patterns that should be eliminated
  - inconsistent spacing/typography/color usage
- A "premium UI rules" note that defines:
  - heading scale
  - metadata scale
  - card hierarchy rules
  - section spacing rules
  - dialog sizing rules
  - table/list alignment rules
  - empty/loading/error treatment rules
- A prioritized pattern library list:
  - page header
  - summary rail
  - filter bar
  - list row
  - detail card
  - dialog shell
  - form field cluster
  - table-like box

## Tasks
- [x] Assemble a representative reference set for Home, Sales, Orders, Refunds, Dashboard, Reports, Inventory, Discounts, Catalog, and Settings.
- [x] Identify which screens already look closest to premium quality.
- [x] Define reusable layout primitives to avoid ad hoc styles later.
- [x] Document typography roles for title, section title, label, body, caption, metadata, and financial values.
- [x] Document spacing tokens for page, card, row, field, and dialog use.
- [x] Decide what visual traits make a cashier-facing screen different from an admin/reporting screen.

## Current Output
- [Baseline audit notes](./phase-0-baseline-audit.md)
- [Token and layout reference](./phase-0-token-reference.md)
- [Golden screens](./phase-0-golden-screens.md)

## Completion Notes
- Phase 0 is complete enough to begin implementation phases.
- A fuller screenshot archive can still be appended later, but it is no longer blocking.

## Acceptance Criteria
- We can explain what "premium" means in this app in one page.
- We have a small set of reusable UI patterns to carry through the rest of the plan.
- Future phases can reference these rules instead of rediscovering them.

## Notes / Links
- Add screenshots, references, or PRs here as this phase progresses.
