# Codex Working Log

## Baseline snapshot (2026-03-11)
- Branch: `main`
- Workspace appears clean at start of scan.
- Root project is an Nx React Native POS monorepo.

## First-touch map
- App entry: `apps/mobile-ui/src/main.tsx`
- App shell/nav: `apps/mobile-ui/src/app/App.tsx`, `apps/mobile-ui/src/app/navigation.tsx`
- Store composition: `libs/store/src/index.ts`
- Core domains available:
  - auth, employees, sales, orders, products, categories, brands
  - inventory, reporting, settings, printings, store-info, unit-of-measures

## Editing defaults for future tasks
- Prefer targeted `nx` test/lint on touched projects before broad runs.
- Keep domain boundaries: UI in `native-feature`, state/services in `data-access`.
- Treat Amplify-generated artifacts as generated sources; avoid hand edits unless required.
