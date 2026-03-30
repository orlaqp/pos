# Product Incremental Sync Plan

## Status
Planned only. Do not implement from this document without a dedicated implementation pass.

## Goal
Reduce cashier startup and sync cost by replacing full Product DataStore startup sync with a product-specific incremental sync strategy:

- keep a durable local product cache
- fetch only products added or updated after the last successful product sync
- merge those product changes into the local cache
- retain a safe recovery path for cold start, corrupted cache, and schema/version drift

This plan is intentionally limited to `Product` first. It does not change the current order or inventory sync strategy.

## Why We Want This
From current sync logs:

- startup `Order` sync has already been reduced to a safe small set
- inventory startup sync is now effectively disabled until inventory is opened
- the biggest remaining startup payload is `Product`

Current startup still syncs roughly the full active product catalog:

- `Product`: about `771`

That is probably legitimate catalog size, but not all of it needs to be fetched from the backend on every startup if the device already has a good local cache.

## Current Architecture
Today products are still treated like a normal DataStore-synced model:

- DataStore syncs Product on app startup
- the app reads products from local DataStore/Redux
- product screens subscribe with `observeQuery(Product)`
- Sales, Back Office product list, barcode search, PLU search, and weighted barcode logic all depend on that shared product source

This means the product catalog is consistent, but startup cost grows with total product count.

## Target Architecture
Move Product to a dedicated incremental sync path:

1. keep a local persisted product cache on device
2. persist a `lastProductSyncAt` watermark
3. at startup:
   - load products from local cache immediately
   - do not wait for a full backend product sync
4. after startup:
   - request only products whose `updatedAt` is greater than `lastProductSyncAt`
   - merge returned products into local cache and Redux
5. periodically or on demand:
   - run a reconciliation pass to catch deletions, missed updates, or data drift

## Non-Goals
- Do not redesign all entity sync at the same time
- Do not replace DataStore everywhere in one pass
- Do not mix this with receipt, order-close, or inventory refactors
- Do not remove the existing product search logic in the same project phase

## Preconditions
Before implementation, confirm all of the following:

1. `Product` has a reliable backend `updatedAt`
2. `updatedAt` is updated whenever product fields relevant to cashier use change
3. soft delete behavior is well understood
4. the backend query surface can filter by `updatedAt > watermark`
5. pagination limits for product delta queries are known

If any of these are not true, the delta strategy will be unsafe.

## Proposed Phases

### Phase 0. Baseline and Safety Gates
Add instrumentation only.

Deliverables:

- log cached product count at startup
- log delta query duration and returned item count
- log merge duration
- log cache version
- log fallback-to-full-sync events

Success criteria:

- we can compare startup with and without incremental product sync
- we can detect stale cache, zero-delta runs, and recovery runs

### Phase 1. Product Cache Layer
Create a dedicated local cache for products outside the current startup DataStore dependency.

Deliverables:

- a persisted product cache store
- a persisted `lastProductSyncAt`
- a persisted cache schema/version marker
- utilities:
  - `loadCachedProducts()`
  - `saveCachedProducts()`
  - `mergeProductDelta()`
  - `clearProductCache()`

Requirements:

- reads must be fast and local-first
- writes must be atomic enough to avoid partial broken caches
- cache version mismatch must trigger reset

Recommended behavior:

- preserve all fields used by Sales, Back Office product list, barcode lookup, PLU lookup, inventory receive/count search, and pricing

### Phase 2. Delta Fetch Path
Add a product delta fetch path based on `updatedAt`.

Deliverables:

- `fetchProductsDelta(since)`
- pagination support
- stable sort/watermark rules
- merge strategy for updated and inserted products

Rules:

- use the highest successfully applied `updatedAt` as the next watermark
- only advance the watermark after all pages merge successfully
- if a delta run fails midway, do not move the watermark

Risks to handle:

- multiple products sharing the same `updatedAt`
- page boundaries splitting identical timestamps
- clock/watermark precision issues

Suggested safeguard:

- use a stable `(updatedAt, id)` ordering or subtract a small overlap window when querying

### Phase 3. Startup Integration
Change app startup so product availability is cache-first.

Startup target behavior:

1. app boots
2. cached products are loaded immediately into Redux
3. Sales and product screens can render from cache
4. background delta sync starts after startup
5. Redux updates after delta merge completes

Requirements:

- no cashier-facing startup wait on full product backend sync
- product search and barcode flows must work from cached products

### Phase 4. Deletion and Reconciliation Strategy
Delta-by-`updatedAt` alone does not safely handle all deletion/drift cases.

We need one of these:

- periodic full reconciliation
- explicit deleted-product delta feed
- versioned product manifest/checksum comparison

Recommended first implementation:

- keep soft-deleted products in delta responses if possible
- add a manual or scheduled full reconciliation path

Suggested reconciliation triggers:

- app version upgrade
- cache schema change
- explicit admin refresh
- once per day or once per week, depending on measured cost

### Phase 5. Screen Migration
Move product-dependent screens to the new product source.

Expected sequence:

1. Sales
2. Product list / Back Office
3. Inventory forms that rely on product search

Requirements:

- preserve current barcode, PLU, and weighed-barcode behavior
- preserve current search behavior
- preserve current product quantities used by cashier flows

### Phase 6. Remove Product Startup DataStore Dependence
Once the incremental path is stable:

- remove Product from startup-critical DataStore assumptions
- decide whether Product remains in DataStore at all for this app

Options:

1. Hybrid
   - keep DataStore model, but do not rely on it for startup
2. Full custom product sync
   - stop treating Product as a DataStore-synced cashier dependency

Recommended default:

- hybrid first
- full removal only if the hybrid approach still carries too much overhead

## Data Model and Merge Rules
Each product merge must preserve:

- `id`
- `name`
- `price`
- `barcode`
- `sku`
- `plu`
- `unitOfMeasure`
- `isActive`
- inventory-related flags used by Sales and inventory flows
- pricing/discount fields used by the current pricing engine
- `updatedAt`

Merge rules:

- same `id` => overwrite with freshest server record
- new `id` => insert
- deleted/inactive handling must be explicit

Do not infer deletes from absence in a delta response.

## Failure Handling

### If cache load fails
- clear product cache
- fall back to a full product fetch path

### If delta fetch fails
- keep cached products
- surface a non-blocking warning if needed
- retry later

### If merge fails
- do not advance watermark
- keep previous cache
- record the failure for diagnostics

### If cache version changes
- clear product cache
- run full rebuild

## Risks

### 1. Missing product updates
If watermark logic is wrong, a changed product may never reach a device.

Mitigation:

- overlap window or `(updatedAt, id)` stable ordering
- periodic full reconciliation

### 2. Missing deletes
Delta by timestamp is weak for deletion unless deletion also updates the row in a visible way.

Mitigation:

- explicit deleted marker support
- scheduled reconciliation

### 3. Divergence between DataStore and custom cache
During migration, screens may accidentally read from different product sources.

Mitigation:

- choose one canonical product selector per phase
- do not mix sources in the same screen

### 4. Barcode/PLU regressions
The product parser/search path is sensitive and already business-critical.

Mitigation:

- preserve all current search tests
- add specific regression coverage for barcode, PLU, and weighed barcode

## Suggested Technical Tasks

### Task Group A. Product Cache Foundation
- create cache repository module
- persist cache metadata
- add cache version constant
- add cache reset utilities

### Task Group B. Product Delta API
- add delta query helper
- add pagination handling
- add watermark handling
- add merge pipeline

### Task Group C. Redux Integration
- add `loadProductsFromCache`
- add `syncProductsIncrementally`
- add cache/delta state to product slice

### Task Group D. Startup Integration
- load cached products before background delta sync
- remove product startup dependence on DataStore readiness

### Task Group E. Recovery and Reconciliation
- add manual full refresh action
- add scheduled or conditional reconciliation

### Task Group F. Test Coverage
- unit tests for merge and watermark logic
- integration tests for startup-from-cache then delta-update
- regression tests for barcode and PLU search after delta merges

## Testing Strategy
Implementation must include:

- unit tests
- integration tests
- manual device validation

The companion test document is here:

- [product-incremental-sync-manual-test.md](/Users/orlando/dev/pos/docs/product-incremental-sync-manual-test.md)

## Rollout Recommendation

### Step 1
Ship cache load + background delta sync behind a feature flag

### Step 2
Validate on one tenant or internal devices first

### Step 3
Compare:

- startup duration
- product load duration
- cache hit ratio
- delta result size
- error rate

### Step 4
Only after stability is confirmed, make incremental product sync the default

## Open Questions

1. Do we have a reliable server-side `updatedAt` filter for Product in every environment?
2. How are soft deletes represented for Product today?
3. Do inactive products need to remain on-device for Back Office only, or also for cashier flows?
4. Should product reconciliation run on a timer, app foreground, admin action, or app version change?
5. Should Back Office and cashier product sources eventually diverge?

## Recommendation
Implement this later as a dedicated product-sync project, not as part of ongoing cashier bug-fixing.

The safest order is:

1. build cache foundation
2. add delta fetch and merge
3. switch startup to cache-first
4. add reconciliation
5. only then consider removing Product from DataStore startup dependency
