# Phase 1 Implementation Brief: Entry Flows And Home Shell

## Status
Completed

This brief turns Phase 1 from a high-level checklist into an execution-ready visual plan.

## Scope Confirmed

### Home And Device Entry
- `apps/mobile-ui/src/app/HomeScreen.tsx`
- `apps/mobile-ui/src/app/HomeScreen.styles.ts`
- `apps/mobile-ui/src/app/home-route-grid.tsx`
- `apps/mobile-ui/src/app/home-pin-login.tsx`
- `apps/mobile-ui/src/app/home-setup-wizard.tsx`

### Admin Sign-In
- `libs/auth/native-feature/src/lib/components/login/login.tsx`

### Secondary Auth Screens
- `libs/auth/native-feature/src/lib/components/signup/signup.tsx`
- `libs/auth/native-feature/src/lib/components/confirm-signup/confirm-signup.tsx`

## Current Strengths
- Home already has a premium direction: dark canvas, hero panel, route cards, and branded glyph usage.
- PIN login already uses a strong split layout instead of a basic one-column form.
- Admin login already has motion, a hero panel, and stronger panel framing than most legacy screens.
- Setup wizard already communicates steps instead of being just a raw form.

## Current Weaknesses
- Home route cards still feel like evenly sized tiles instead of premium destination panels.
- The hero and access card feel visually related, but not yet fully composed as one premium shell.
- PIN login utility actions (`log off`, diagnostics, saved login actions) feel appended instead of intentionally grouped.
- Setup wizard uses the same panel language as PIN entry, but could feel more guided and less form-heavy.
- Admin login still feels slightly generic in the lower half despite a strong hero.
- Entry screens do not yet share one exact visual grammar for:
  - title/subtitle rhythm
  - eyebrow treatment
  - panel spacing
  - utility action placement

## Phase 1 Design Goals

### 1. Make Home Feel Like A Product Front Door
- Stronger visual hierarchy between:
  - business/workspace identity
  - employee access
  - route selection
- Route destinations should feel more premium than simple buttons.
- Home must still remain fast and operational, not decorative.

### 2. Make PIN Access Feel Premium And Fast
- Keep the keypad as the primary action area.
- Utility actions must feel secondary but intentional.
- Locked/error/warning states should feel serious and well-designed.

### 3. Make Setup Feel Guided
- The step state should feel like a guided onboarding sequence.
- Form density must stay manageable in landscape.
- Header copy and step indicators should carry more of the burden than raw field stacking.

### 4. Make Admin Login Feel Executive
- Hero panel should reinforce trust and business ownership.
- Form panel should feel highly refined, with cleaner grouping and stronger CTA hierarchy.
- Remember-credentials controls should feel integrated, not bolted on.

## Recommended Execution Order Inside Phase 1
1. Home shell and route-grid polish
2. PIN login polish
3. Setup wizard polish
4. Admin login polish
5. Signup and confirm-signup visual alignment

## Visual-Only Guardrails For Phase 1
- Do not change routing behavior
- Do not change authentication logic
- Do not change PIN rules or lockout logic
- Do not change setup validation semantics
- Do not change remembered-credentials behavior
- Do not change any sign-in or sign-out business flow

## Concrete UI Work Items

### Home Screen
- [x] Refine hero-to-action balance so route choices feel more intentional.
- [x] Upgrade route cards from "big buttons" to richer destination surfaces.
- [x] Improve spacing rhythm between glyph, business label, title, and subtitle.
- [x] Strengthen visual grouping between hero content and navigation choices.
- [x] Review whether route cards should have stronger hover/pressed/active feel.

### PIN Login
- [x] Improve hierarchy inside the keypad card.
- [x] Group utility actions into a cleaner secondary action zone.
- [x] Refine warning/error message spacing so the keypad remains visually dominant.
- [x] Improve the visual relationship between the hero panel and the keypad card.

### Setup Wizard
- [x] Improve stepper treatment so progress feels more premium.
- [x] Rework form grouping for better landscape readability.
- [x] Give employee setup and store setup a clearer visual difference while keeping one shared shell.
- [x] Improve action hierarchy for continue / log off.

### Admin Login
- [x] Tighten hero copy rhythm and panel balance.
- [x] Refine form spacing and CTA prominence.
- [x] Make the remember-credentials row feel more premium and less checkbox-like.
- [x] Align lower-level actions with the Phase 1 visual system.

### Signup / Confirm Signup
- [x] Bring these screens visually in line with the stronger admin login language.
- [x] Standardize header, subtitle, panel padding, and form grouping.

## Definition Of Done For Phase 1
- Home feels like a premium front door.
- PIN entry feels like a confident shared-device access flow.
- Setup feels guided and high-end instead of bootstrap-heavy.
- Admin login, signup, and confirm-signup feel like one coherent access system.
- All work remains visual-only.

## Completed In First Pass
- Home ready-state shell
- Route-grid premium card treatment
- PIN access card hierarchy and utility grouping
- Setup wizard stepper, guided sections, and action hierarchy
- Admin login, signup, and confirm-signup premium auth alignment
- Access-sync waiting-state polish
