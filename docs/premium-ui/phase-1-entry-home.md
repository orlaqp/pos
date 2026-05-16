# Phase 1: Entry Flows And Home Shell

## Objective
Make the entry experience feel polished, trustworthy, and high-end before users even reach sales or back office.

## Guardrail
This phase is visual-only. It must not change business rules, calculations, validation semantics, service behavior, data flow, or persistence.

## Primary Surfaces
- `apps/mobile-ui/src/app/HomeScreen.tsx`
- `apps/mobile-ui/src/app/home-route-grid.tsx`
- `apps/mobile-ui/src/app/home-pin-login.tsx`
- `apps/mobile-ui/src/app/home-setup-wizard.tsx`
- `libs/auth/native-feature/src/lib/components/login/login.tsx`
- `libs/auth/native-feature/src/lib/components/signup/signup.tsx`
- `libs/auth/native-feature/src/lib/components/confirm-signup/confirm-signup.tsx`

## UX Goals
- The Home screen should feel like a premium launchpad, not just a router.
- PIN and auth flows should feel fast, reassuring, and elegantly minimal.
- Business/station setup should feel guided and premium, not form-heavy and technical.

## Tasks
- [x] Redesign the Home screen layout and visual rhythm.
- [x] Improve route-grid hierarchy and touch targets.
- [x] Refine the PIN login surface for speed and confidence.
- [x] Modernize auth forms with better spacing, validation clarity, and input grouping.
- [x] Standardize empty and loading treatments across auth/home screens.
- [x] Improve illustration/glyph positioning so branding feels intentional.

## Acceptance Criteria
- Entry flows feel branded and calm instead of generic.
- The user can visually understand where to go next in under 2 seconds.
- Auth forms look deliberate on iPad landscape and do not feel like stretched mobile forms.

## Dependencies
- Phase 0 typography and spacing decisions

## Current Output
- [Implementation brief](./phase-1-implementation-brief.md)

## Progress Notes
- Home ready-state shell has been upgraded with a stronger premium layout.
- Route destinations now read as richer workspace cards instead of plain large tiles.
- PIN access card now has a cleaner premium hierarchy with grouped device/session controls.
- Setup wizard now feels guided instead of bootstrap-heavy, with premium progress cards and clearer section grouping for owner and store setup.
- Admin login, signup, and confirm-signup now share a stronger premium auth language with richer hero metadata and cleaner action framing.
- Access-sync waiting states now use the same premium shell language instead of a plain placeholder card.
- Behavior remains unchanged; this pass was visual-only.

## Phase Status
Completed.

## Notes / Links
- Add screenshots, references, or PRs here as this phase progresses.
