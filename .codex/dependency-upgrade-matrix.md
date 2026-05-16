# Dependency Upgrade Matrix (Step 2)

Last updated: 2026-03-11 (America/New_York)
Workspace: `/Users/orlando/dev/pos`

## Current Upgrade Snapshot (2026-03-13)
- Node: `22.21.0`
- Yarn: `1.22.22`
- Nx: `22.5.4`
- React Native: `0.84.1`
- React / React DOM: `19.2.3`
- React Test Renderer: `19.2.3`
- Redux Toolkit: `2.11.2`
- React Redux: `9.2.0`

### Verified gates
- `mobile-ui:lint` passes (0 warnings/errors after cleanup).
- `mobile-ui:test` navigation-focused pass is green.
- `shared-ui-native:test` is green.
- `sales-native-feature:test` is green.
- `reporting-native-feature:test` is green for report viewer and related specs.
- `settings-data-access:test` is green after i18n foundation migration.

### i18n migration progress
- Added `i18next` + `react-i18next`.
- Replaced `i18n-js` usage in settings language utility with `i18next` while preserving current `translate`/`setI18nConfig` API.
- Removed `i18n-js` from root dependencies.
- Added EN/ES language selector to Settings UI and translated Settings labels/status messages.
- Startup language now initializes from best available device language instead of hardcoded `'en'`.

### Bundling fix applied
- Root cause: RN CLI startup could block in `setup_env.sh` execution path when invoked via Node `execFileSync(...)`.
- Added workspace patch script: `tools/patch-rn-cli-setup.js`.
- Added `postinstall` hook to apply the patch after installs.
- Verified fixed behavior:
  - `react-native/cli.js --help` returns immediately.
  - `mobile-ui:bundle-ios` succeeds.
  - `mobile-ui:bundle-android` succeeds.

### Remaining notes
- One-time output dir issue (`EEXIST`) can occur when bundle output folders already exist; clear/rotate output folders before reruns if needed.

### Stability hardening progress
- Added a global app-level error boundary with user fallback and retry action (`AppErrorBoundary`).
- Added startup diagnostics logging on app boot (platform/env/AWS config presence flags).
- Added/updated tests for error boundary and startup diagnostics behavior.

### Workspace runtime default
- Added `.nvmrc` with `22.21.0` to match Metro `0.83.x` requirements in this upgraded stack.

## Baseline
- Node: `22.21.0`
- Yarn: `1.22.22`
- Nx: `13.10.3`
- React Native: `0.67.4`
- React: `17.0.2`
- TypeScript: `4.6.4`

## Audit Summary
- `yarn outdated` total packages behind: `91`
- Safe in-major/in-range updates available now (`current -> wanted`): `39`
- Major or framework-coupled upgrades (`latest`, likely breaking): `52`
- `yarn audit --groups dependencies --level high`: `200` vulnerabilities (`17 critical`, `100 high`, `58 moderate`, `25 low`)
- Most critical/high findings are transitive through old RN toolchain (`react-native@0.67.4`, old CLI/Hermes/Metro path).

## Risk Buckets

### Bucket A: Do Now (same major, low to medium risk)
These can be upgraded without jumping React/RN/Nx majors.

#### A1: Low-risk JS/runtime and typings
- `amazon-cognito-identity-js` `5.2.9 -> 5.2.14`
- `aws-amplify` `4.3.23 -> 4.3.46`
- `aws-amplify-react-native` `6.0.4 -> 6.0.8`
- `aws-sdk` `2.1167.0 -> 2.1693.0`
- `core-js` `3.22.7 -> 3.48.0`
- `date-fns` `2.28.0 -> 2.30.0`
- `lodash` `4.17.21 -> 4.17.23`
- `moment` `2.29.3 -> 2.30.1`
- `react-hook-form` `7.31.2 -> 7.71.2`
- `tslib` `2.4.0 -> 2.8.1`
- `inflection` `1.13.2 -> 1.13.4`
- `@types/lodash` `4.14.182 -> 4.17.24`
- `@types/redux-logger` `3.0.9 -> 3.0.13`

#### A2: RN ecosystem minors/patches (same major, native retest required)
- `@react-navigation/native` `6.0.10 -> 6.1.18`
- `@react-navigation/native-stack` `6.6.2 -> 6.11.0`
- `@react-navigation/drawer` `6.4.1 -> 6.7.2`
- `@rneui/base` `4.0.0-rc.4 -> 4.0.0-rc.8`
- `@rneui/themed` `4.0.0-rc.4 -> 4.0.0-rc.8`
- `@react-native-picker/picker` `2.4.1 -> 2.11.4`
- `@react-native-community/netinfo` `8.3.0 -> 8.3.1`
- `@react-native-async-storage/async-storage` `1.17.7 -> 1.24.0`
- `react-native-date-picker` `4.2.5 -> 4.4.2`
- `react-native-dropdown-picker` `5.4.2 -> 5.4.6`
- `react-native-fast-image` `8.5.11 -> 8.6.3`
- `react-native-gesture-handler` `2.4.2 -> 2.30.0`
- `react-native-image-picker` `4.8.3 -> 4.10.3`
- `react-native-localize` `2.2.2 -> 2.2.6`
- `react-native-reanimated` `2.8.0 -> 2.17.0`
- `react-native-safe-area-context` `4.2.5 -> 4.14.1`
- `react-native-screens` `3.13.1 -> 3.37.0`
- `react-native-star-io10` `1.9.0 -> 1.10.3`
- `react-native-touchable-scale` `2.1.2 -> 2.2.0`
- `react-native-uuid` `2.0.1 -> 2.0.3`
- `react-native-vector-icons` `9.1.0 -> 9.2.0`
- `rn-select-date-range` `3.2.2 -> 3.3.0`

#### A3: Tooling (no major jump)
- `@nx/cli` `14.5.1 -> 14.8.9` (keep rest on Nx 13.10.3 for now)
- `@aws-sdk/client-dynamodb` `3.121.0 -> 3.1007.0`
- `@aws-sdk/lib-dynamodb` `3.121.0 -> 3.1007.0`
- `prettier` `2.6.2 -> 2.8.8`

## Bucket B: Planned Breaking Migration (separate milestone)
Hold until after redesign prep branch is stable.

- Nx stack to modern (`13.x -> latest 19+`)
- React Native (`0.67 -> 0.7x/0.8x`)
- React (`17 -> 18/19`), React DOM, React Test Renderer
- Redux Toolkit (`1.x -> 2.x`), React Redux (`7.x -> 9.x`)
- Jest stack (`27 -> 30`), TS (`4.6 -> 5.9`), ESLint and TS-ESLint majors
- Detox (`19 -> 20`) and `@nx/detox` major alignment
- Metro/CLI major lifts

Reason: these are coupled upgrades and should be done with migration tooling (`nx migrate`) plus RN migration steps, not ad hoc.

## Execution Plan

### Phase 2.1 (A1 only)
1. Upgrade low-risk JS/runtime packages.
2. Run unit/integration/e2e smoke.
3. Fix breakages before any native package updates.

Command set:
```bash
yarn add amazon-cognito-identity-js@5.2.14 aws-amplify@4.3.46 aws-amplify-react-native@6.0.8 aws-sdk@2.1693.0 core-js@3.48.0 date-fns@2.30.0 lodash@4.17.23 moment@2.30.1 react-hook-form@7.71.2 tslib@2.8.1

yarn add -D inflection@1.13.4 @types/lodash@4.17.24 @types/redux-logger@3.0.13 prettier@2.8.8 @aws-sdk/client-dynamodb@3.1007.0 @aws-sdk/lib-dynamodb@3.1007.0
```

Validation:
```bash
yarn eslint
yarn nx test sales-native-feature --runInBand
yarn nx test orders-data-access --runInBand
yarn nx test orders-native-feature --runInBand
yarn nx run mobile-ui-e2e:test-ios --skip-nx-cache
```

### Phase 2.2 (A2 native/ecosystem minors)
- Upgrade RN-adjacent packages in one branch with iOS simulator regression pass.
- Re-run all tests and payment/order flows manually.

### Phase 2.3 (B migration)
- Run framework migration project:
  - `nx migrate` workflow
  - RN upgrade workflow
  - Dedicated QA cycle

## Recommendation
Start with **Phase 2.1 (A1 only)** in the next commit. It gives measurable security and maintenance improvement while minimizing risk to payment/cart/order behavior.
