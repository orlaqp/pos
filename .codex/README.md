# Codex Project Context: POS

## What this project is
This is an Nx monorepo for a React Native point-of-sale app (`mobile-ui`) backed by AWS Amplify/DataStore.

The app has two main user flows:
- Sales flow (cart, orders, payments, printing)
- Back office flow (products, inventory, employees, reporting, settings)

## Stack and key constraints
- Node.js target: `16.13.0` (from root README)
- Nx: `13.10.3`
- React Native: `0.67.4`
- React: `17.x`
- State: Redux Toolkit + slices in `libs/*/data-access`
- Backend/client sync: Amplify + DataStore models

## Monorepo structure
- App: `apps/mobile-ui`
- Domain libraries follow a consistent split:
  - `libs/<domain>/data-access` (services, slices, entities, datastore sync)
  - `libs/<domain>/native-feature` (UI/components/screens)
- Shared:
  - `libs/shared/models` (Amplify-generated models)
  - `libs/shared/api` (Amplify-generated API/graphql code)
  - `libs/shared/data-store` (DataStore init + events)
  - `libs/store` (global Redux store composition)

## Main runtime entry points
- `apps/mobile-ui/src/main.tsx`
  - configures Amplify
  - initializes DataStore (`initializeDataStore`)
  - dispatches AWS config and initial language
- `apps/mobile-ui/src/app/App.tsx`
  - wires Redux provider, navigation container, RNE theme
- `apps/mobile-ui/src/app/navigation.tsx`
  - app-level navigation for auth/sales/back office
- `libs/store/src/index.ts`
  - registers all feature reducers
  - dispatches initial fetch thunks (`fetchStoreInfo`, `fetchStationInfo`, `fetchGlobalSettings`)

## Local commands
From repo root:
- Install deps: `yarn`
- Start Metro/Nx app: `yarn start`
- Run iOS target: `yarn ios`
- Lint all: `yarn nx run-many --target=lint --all`
- Test all: `yarn test`
- Test one project: `yarn nx test <project-name>`
- Lint one project: `yarn nx lint <project-name>`

Useful project names are in `workspace.json` (e.g. `sales-data-access`, `orders-native-feature`, `mobile-ui`).

## Codegen/data sync workflow
When Amplify schema/API changes:
- `yarn update-amplify` (push + codegen + copy into libs)
- or local-only codegen: `yarn update-amplify-local`

Copy scripts used by codegen:
- `yarn update-models`
- `yarn update-graphql`
- `yarn update-api`

## Amplify safety (critical)
- This repository treats `develop` as production.
- Do not run mutating Amplify commands on `develop`.
- Use `ebtdev` for EBT feature schema/codegen work (`ebt-dev` label, CLI-safe name).
- See `.codex/amplify-safety-runbook.md` for command-level guardrails.

## Change strategy
1. Identify affected domain (`sales`, `orders`, `inventory`, etc.).
2. Update `data-access` first (types/entities/slices/services).
3. Update `native-feature` UI layer next.
4. Verify compile + tests for touched projects.
5. Run targeted flows in `mobile-ui` if behavior changed.

## High-risk areas
- DataStore synchronization behavior in `libs/*/data-access/src/lib/data-store-sync.ts`
- Order lifecycle logic in `libs/orders/data-access/src/lib/order.service.ts`
- Cart total calculations in `libs/sales/data-access/src/lib/slices/cart.slice.ts`
- Global store initialization side effects in `libs/store/src/index.ts`
- Printing integration (`libs/printings/*`)

## Notable implementation details to remember
- Root navigation gating is based on auth user and logged-in employee.
- Back-office menu and screen mapping live in `libs/back-office/native-feature`.
- Redux logger middleware is always enabled in `libs/store/src/index.ts`.
- Theme currently hardcodes dark theme in `App.tsx`.

## Quick checklist before merging changes
- `yarn nx lint <touched-projects>` passes
- `yarn nx test <touched-projects>` passes
- If model/API touched, run codegen sync scripts
- No accidental edits under generated Amplify/model files unless intentional

## Step 1 Baseline
- Stability baseline checklist: `.codex/stability-baseline-checklist.md`

## Step 2 Dependency Audit
- Upgrade matrix and phased plan: `.codex/dependency-upgrade-matrix.md`
