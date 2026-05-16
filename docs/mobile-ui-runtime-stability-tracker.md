# Mobile UI Runtime Stability Tracker

Last updated: 2026-04-03
Status: Active investigation
Scope: iPad/TestFlight random closes, runtime crashes, and CPU resource violations in `MobileUi`

## Goal

Identify and eliminate the causes of:

- unexpected app restarts/closures on iPad
- repeated React Native / Hermes / TurboModule crashes
- repeated foreground CPU resource violations

This tracker is intended to keep the investigation structured without changing product behavior until we have high-confidence fixes.

## Working Summary

We currently have evidence of two issue classes:

1. Real app crashes on production-like iPads
2. Repeated foreground CPU resource violations

These likely share a common hotspot in the React Native / Hermes / TurboModule runtime path.

The strongest recurring signatures point at:

- Hermes runtime / JS execution
- TurboModule bridge value conversion
- Async storage serialization / JSON stringify paths
- foreground resume or interactive runtime churn

## Evidence Collected

### Crash Reports

| File | Time | Build | Signal | Key signature | Notes |
| --- | --- | --- | --- | --- | --- |
| `MobileUi-2026-04-03-101433.ips` | 2026-04-03 10:14:33 | 27 | `EXC_BAD_ACCESS`, `SIGBUS` | `com.facebook.react.runtime.JavaScript`, Hermes runtime, `arrayPrototypeReduce`, property access slow path | Real iPad crash in JS/Hermes runtime |
| `MobileUi-2026-04-03-105334.ips` | 2026-04-03 10:53:34 | 27 | `EXC_CRASH`, `SIGABRT` | `com.meta.react.turbomodulemanager.queue`, `convertNSStringToJSIString`, `ObjCTurboModule::createPromise`, `RCTJSONStringify` | Strong TurboModule / bridge signature |
| `MobileUi-2026-04-03-122736.ips` | 2026-04-03 12:27:36 | 27 | `EXC_CRASH`, `SIGABRT` | Same TurboModule / bridge signature as `10:53:34` | Repeated crash family |

### CPU Resource Reports

| File | Time | Build | CPU finding | Footprint growth | Notes |
| --- | --- | --- | --- | --- | --- |
| `MobileUi.cpu_resource-2026-04-02-065513.ips` | 2026-04-02 06:55:13 | 23 | `90s CPU / 102s` (`88%`) | `217 MB -> 443 MB` | Frontmost, user interactive |
| `MobileUi.cpu_resource-2026-04-03-105233.ips` | 2026-04-03 10:52:33 | 27 | `90s CPU / 91s` (`99%`) | `237 MB -> 442 MB` | Frontmost, user interactive |
| `MobileUi.cpu_resource-2026-04-03-161156.ips` | 2026-04-03 16:11:56 | 29 | `90s CPU / 170s` (`53%`) | `217 MB -> 456 MB` | Frontmost, user interactive, hardware keyboard connected |

### Device Diagnostics Pattern

Recent on-device diagnostics show:

- clean bootstrap
- normal `active -> inactive -> background -> active`
- successful `session.validation:success` after resume
- session disappearance afterward without a normal in-app exception breadcrumb

This means at least some incidents are not simple auth/bootstrap failures. We should treat them as either:

- true runtime crashes
- or OS/device-level termination after foreground resume

## Leading Hypotheses

### H1. TurboModule bridge conversion failure

Confidence: High

Repeated crash stacks point at:

- `TurboModuleConvertUtils::convertNSStringToJSIString`
- `convertObjCObjectToJSIValue`
- `ObjCTurboModule::createPromise`
- `ObjCTurboModule::performVoidMethodInvocation`

Likely trigger shape:

- a native-backed module returns an unexpected string/object/error/promise payload
- bridge conversion or error propagation aborts the process

### H2. Async storage serialization or oversized payload churn

Confidence: High

Repeated stacks also include:

- `RCTJSONStringify`
- `NSJSONSerialization`
- `com.facebook.react.AsyncLocalStorageQueue`

Likely trigger shape:

- very large objects
- circular or malformed values
- repeated read/write churn on foreground/resume
- diagnostics/session/storage state being stringified too often

### H3. JS event-loop runaway in Hermes

Confidence: High

CPU resource reports consistently show React/Hermes runtime stacks while the app is frontmost and interactive.

Likely trigger shape:

- infinite or near-infinite microtask churn
- repeated state updates after app resume
- heavy reducers/selectors/derived calculations firing too often
- bridge callback loops causing the JS thread to stay saturated

### H4. Resume-path bug amplified by connected hardware keyboard

Confidence: Medium

One CPU report explicitly shows `HW Keyboard: Yes`. This may be correlation only, but the keyboard should remain part of the test matrix because external keyboard behavior has already surfaced in the sales search flow.

## Investigation Phases

## Phase 0: Baseline and Evidence Consolidation

Status: In progress

Goals:

- centralize all known crash and cpu_resource signatures
- preserve exact timestamps, builds, and devices
- avoid mixing unrelated issue families

Checklist:

- [x] Collect representative crash `.ips` files
- [x] Collect representative `cpu_resource` `.ips` files
- [x] Add on-device JS/native lifecycle breadcrumbs
- [ ] Map each report to build number, device, and user-visible symptom
- [ ] Confirm whether build `29` still emits the same crash family as build `27`

## Phase 1: Codebase Surface Audit

Status: In progress

Goals:

- identify the highest-risk TurboModule/native bridge call sites
- locate resume/foreground paths with heavy storage or serialization work

Focus areas:

- app bootstrap and foreground resume flow
- session validation
- diagnostics persistence
- AsyncStorage usage
- custom native modules
- printer/native integrations that return objects across the bridge

Checklist:

- [x] Inventory all AsyncStorage call sites and payload shapes
- [x] Inventory all custom/native-backed module calls used during startup/resume
- [x] Trace foreground lifecycle code from `App.tsx`
- [x] Flag any large object logging or stringify behavior
- [x] Flag any promise rejection paths sending native objects/errors to JS

### Phase 1 Findings

#### F1. `redux-logger` is enabled in non-test builds

Priority: Critical
Confidence: High

File:

- `libs/store/src/index.ts`

Current store setup adds `redux-logger` for every environment except `test`.

That means release/TestFlight builds are likely serializing and logging every action and state transition. In this app, that includes large entities, DataStore-driven updates, and lifecycle churn.

This is the strongest CPU-risk finding so far and is a plausible contributor to the repeated `cpu_resource` reports.

#### F2. App lifecycle diagnostics rewrite AsyncStorage on every lifecycle event

Priority: High
Confidence: High

Files:

- `apps/mobile-ui/src/app/App.tsx`
- `apps/mobile-ui/src/app/app-lifecycle-diagnostics.ts`

`recordAppLifecycleEvent()` currently:

- reads the full current lifecycle session from AsyncStorage
- appends the new event
- writes the full session back to AsyncStorage

This occurs for:

- bootstrap start/ready/error
- app state transitions
- foreground session validation success/failure
- session reset and reauth
- memory warnings

This is directly on the foreground/resume path, and it matches the crash signatures involving:

- `AsyncLocalStorageQueue`
- `RCTJSONStringify`
- TurboModule promise/value conversion

#### F3. Pending order journal stores full `CartState` snapshots in AsyncStorage

Priority: High
Confidence: High

Files:

- `libs/orders/data-access/src/lib/pending-order-journal.ts`
- `libs/sales/native-feature/src/lib/components/sales-screen/sales-screen.tsx`

The pending order journal persists whole `CartState` objects, not a minimal sync payload.

That means every journal write can serialize:

- full cart items
- full product snapshots nested under cart items
- payment arrays
- employee metadata

This is another strong match for the `RCTJSONStringify` / AsyncStorage crash family, especially during payment and order flows.

#### F4. DataStore hub events are serialized and stored in Redux

Priority: Medium
Confidence: Medium

Files:

- `libs/shared/data-store/src/events.ts`
- `libs/shared/data-store/src/lib/events.slice.ts`

Every datastore hub event is wrapped and dispatched into Redux, with:

- `data: JSON.stringify(data)`
- up to 500 stored event records

Even without persistence, this creates repeated stringify work and larger Redux actions/state transitions. In combination with `redux-logger`, this becomes especially expensive.

#### F5. Foreground bootstrap/resume path is heavy and fan-outs multiple syncs

Priority: Medium
Confidence: Medium

Files:

- `apps/mobile-ui/src/app/App.tsx`
- `libs/*/data-store-sync.ts`

Bootstrap performs:

- `DataStore.stop()`
- optional `DataStore.clear()`
- `configureDataStore()`
- `DataStore.start()`
- employee fetch/sync
- store/global/device/printer fetches
- subscribe flows for employees and products

This may not be the direct crash root cause, but it does create a lot of interactive foreground work and likely amplifies CPU spikes when combined with the issues above.

#### F6. Repeated TurboModule/native promise paths exist around diagnostics and credentials, but they are not yet the strongest code-level suspects

Priority: Medium
Confidence: Medium

Files:

- `apps/mobile-ui/src/app/native-lifecycle-diagnostics.ts`
- `libs/auth/data-access/src/lib/admin-credentials.ts`

These modules do cross native boundaries:

- `NativeModules.AppLifecycleNativeDiagnostics`
- `react-native-keychain`

However, based on the current call frequency, they appear less likely than AsyncStorage-heavy lifecycle/journal writes to explain the recurring crash family.

## Phase 2: Reproduction and Instrumentation Tightening

Status: Pending

Goals:

- reproduce the CPU runaway or crash in a controlled environment
- add low-overhead evidence only where needed

Test matrix:

- iPad with and without external keyboard
- cold launch
- background for 1-5 minutes, then foreground
- idle foreground for 10-20 minutes
- saved session enabled vs disabled

Checklist:

- [ ] Add targeted timing/counter breadcrumbs around resume and session validation
- [ ] Add guarded counters for AsyncStorage reads/writes on startup/resume
- [ ] Add low-cost bridge call breadcrumbs around likely native modules
- [ ] Attempt reproduction on build `29`
- [ ] Attempt reproduction with keyboard attached

## Phase 3: Containment Fixes

Status: In progress

Goals:

- reduce crash and CPU risk with minimal behavior change
- ship the smallest safe fixes first

Potential fix categories:

- stop serializing oversized objects
- narrow storage payload shapes
- move heavy resume work off the immediate foreground path
- guard or normalize native promise payloads before bridging
- eliminate any accidental loops after app resume

Checklist:

- [x] Propose fix candidates ranked by confidence and blast radius
- [x] Land smallest high-confidence guardrails first
- [ ] Verify crash signature disappears in new TestFlight build
- [ ] Verify cpu_resource incidents drop in new TestFlight build

### Phase 3 Fix Batch 1

Implemented on 2026-04-03:

- Disabled `redux-logger` for non-dev runtimes in `libs/store/src/index.ts`
- Reduced lifecycle diagnostics AsyncStorage churn by caching the current session in memory in `apps/mobile-ui/src/app/app-lifecycle-diagnostics.ts`
- Disabled pending order journal persistence entirely in `libs/orders/data-access/src/lib/pending-order-journal.ts`
- Removed journal writes from checkout flows in `libs/sales/native-feature/src/lib/components/sales-screen/sales-screen.tsx`
- Removed the in-app Order Journal entry point from `apps/mobile-ui/src/app/navigation.tsx`
- Removed the public `OrderJournalList` export from `libs/orders/native-feature/src/index.ts`
- Reduced DataStore Hub event churn in `libs/shared/data-store/src/events.ts` by recording only a narrow diagnostic subset and storing compact summaries instead of raw JSON payloads
- Deferred employee and product sync/subscription setup until after UI interactions settle in `apps/mobile-ui/src/app/App.tsx`
- Removed the remote employee GraphQL probe and deferred best-effort business-context fetches until after interactions in `apps/mobile-ui/src/app/App.tsx`
- Switched employee collection hydration to `observeQuery(...)` local-first behavior and removed the employee `DataStore.query(...)` bootstrap dependency in `libs/employees/data-access/src/lib/data-store-sync.ts`
- Reverted the temporary product snapshot fingerprint dedupe in `libs/products/data-access/src/lib/data-store-sync.ts`
- Switched product collection hydration to local-first `observeQuery(...)` and removed the product `DataStore.query(...)` bootstrap dependency while keeping realtime patch subscriptions intact
- Switched `GlobalSettings`, `Brand`, and `UnitOfMeasure` DataStore sync helpers to local-first `observeQuery(...)` one-shot/subscription behavior and removed the unit-of-measure list’s redundant fetch-on-mount path
- Switched `Category` DataStore sync to local-first `observeQuery(...)` one-shot/subscription behavior and removed the category list’s redundant fetch-on-mount path

## Phase 4: Hardening and Monitoring

Status: Pending

Goals:

- prevent silent regressions
- make future runtime incidents easier to triage quickly

Checklist:

- [ ] Keep the diagnostics view available in non-debug production builds
- [ ] Add a compact export/share path for diagnostics snapshots
- [ ] Document known runtime signatures and triage steps
- [ ] Remove temporary instrumentation only after stability is confirmed

## Immediate Next Actions

1. Audit `AsyncStorage` usage, especially around bootstrap, session, and diagnostics.
2. Audit all native-backed promise calls used on launch or foreground resume.
3. Compare build `27` and build `29` code paths touching storage, diagnostics, and session validation.
4. Reproduce with external keyboard attached, since at least one CPU report captured `HW Keyboard: Yes`.

## Questions To Answer

- Which native module is the source of the repeated TurboModule bridge crashes?
- Is the CPU runaway a pure JS loop, or is it bridge-driven churn between native and JS?
- Does the issue begin on resume, or does resume only expose an already-running hot loop?
- Is external keyboard connection causal, or just present on one affected device?

## Update Log

### 2026-04-03

- Confirmed real iPad crash reports in builds `27`
- Confirmed repeated `cpu_resource` incidents across builds `23`, `27`, and `29`
- Confirmed recurring React Native / Hermes / TurboModule runtime signatures
- Added structured tracker to guide next investigation steps
- Completed initial Phase 1 audit of storage, lifecycle, and bridge-heavy paths
- Identified `redux-logger` in non-test builds as the strongest CPU-risk code path
- Identified lifecycle diagnostics and pending order journal AsyncStorage rewrites as the strongest crash-family suspects
- Disabled pending order journal persistence and removed its UI entry point to eliminate that AsyncStorage pressure path
- Replaced raw DataStore Hub payload stringification with compact event summaries to reduce foreground Redux and stringify pressure
- Moved employee and product bootstrap sync fan-out behind `InteractionManager.runAfterInteractions()` to reduce immediate foreground startup pressure
- Shortened the bootstrap critical path by removing the remote employee visibility probe and moving store/device/settings/printer refreshes out of the immediate ready transition
- Removed the employee `query(...)` + `observeQuery(...)` duplication by making employee hydration local-first `observeQuery(...)` only
- Rolled back the temporary product dedupe fingerprint rather than keeping a heuristic snapshot checksum in the hot path
- Removed the product `query(...)` + `observeQuery(...)` duplication by making product hydration local-first `observeQuery(...)` only, while preserving the existing realtime patch layer
- Removed the remaining obvious `query(...)` + `observeQuery(...)` duplication for settings, brands, and units of measure, and eliminated the extra unit-of-measure list fetch path
- Removed the remaining obvious category `query(...)` + `observeQuery(...)` duplication and the extra category list fetch path
