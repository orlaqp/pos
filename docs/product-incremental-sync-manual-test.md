# Product Incremental Sync Manual Test Plan

## Status
Prepared for a future implementation. Do not use this as a release gate until the product incremental sync project exists.

## Goal
Verify that a future product incremental-sync implementation:

- loads products from local cache first
- fetches only changed products from the backend
- merges changes correctly
- preserves product search and barcode behavior
- recovers safely from stale or broken cache states

## Core Expectations

### Startup
- app should render product-dependent flows from cache without waiting for full backend product sync
- background product delta sync should not block cashier startup

### Correctness
- changed products must update locally after delta sync
- new products must appear locally after delta sync
- deleted/inactive products must be handled according to the final reconciliation strategy

### Business-critical behavior
- Sales search must still work
- barcode search must still work
- PLU search must still work
- weighed-barcode parsing must still work

## Test Data Setup
Prepare at least these product cases:

1. active standard product with barcode
2. active product with SKU only
3. active product with PLU
4. active weighed product with barcode and PLU
5. inactive product
6. newly created product not present in old cache
7. updated product with changed name or price
8. product deleted or soft-deleted after cache build

Use a tenant with known product ids so results are easy to verify.

## Manual Test Scenarios

### 1. Cold Start With Empty Cache
Purpose:
- validate recovery/full-build path

Steps:
1. clear product cache
2. launch app
3. wait for startup
4. open Sales
5. open Back Office product list

Expected:
- app does not crash
- product data eventually becomes available
- cache is rebuilt
- `lastProductSyncAt` is written

### 2. Warm Start With Valid Cache
Purpose:
- validate cache-first startup

Steps:
1. launch app with existing populated cache
2. measure time to reach Sales-ready state
3. confirm products are visible/searchable before delta sync completes

Expected:
- startup does not block on full product backend fetch
- product list/search is available from cache immediately

### 3. Delta Adds New Product
Purpose:
- validate insert merge

Steps:
1. build cache baseline
2. create a new active product in backend
3. relaunch app or trigger delta sync
4. search for the new product

Expected:
- new product appears after delta sync
- no duplicate rows

### 4. Delta Updates Existing Product
Purpose:
- validate overwrite merge

Steps:
1. cache an existing product
2. update product name, price, or barcode in backend
3. trigger delta sync
4. inspect product in Sales and Back Office

Expected:
- updated fields replace cached values
- no stale duplicate copy remains

### 5. Delta Keeps Barcode Search Working
Purpose:
- protect sales-critical lookup

Steps:
1. scan or type a known exact barcode
2. confirm product auto-add/search behavior
3. update that product in backend
4. trigger delta sync
5. scan again

Expected:
- barcode lookup still resolves correctly before and after delta update

### 6. PLU Search Regression
Purpose:
- preserve current PLU behavior

Steps:
1. type a known direct PLU in product list
2. type the same PLU in Sales search if supported there
3. update that product in backend
4. trigger delta sync
5. repeat search

Expected:
- PLU results remain correct

### 7. Weighed Barcode Regression
Purpose:
- preserve weighted barcode parsing

Steps:
1. use a real weighed barcode sample
2. verify product resolution and quantity derivation
3. update product data in backend
4. trigger delta sync
5. repeat weighed barcode scan

Expected:
- weighted barcode still resolves correctly
- quantity calculation remains correct

### 8. Inactive Product Handling
Purpose:
- verify business rule for inactive products

Steps:
1. cache a product while active
2. mark it inactive in backend
3. trigger delta sync
4. inspect Sales and Back Office behavior

Expected:
- matches intended business rule
- inactive product does not remain incorrectly sellable

### 9. Delete / Soft Delete Handling
Purpose:
- verify reconciliation behavior

Steps:
1. cache a product
2. delete or soft-delete it in backend
3. trigger delta sync or reconciliation
4. inspect local cache and UI

Expected:
- product handling matches final implementation rule
- no orphan product remains incorrectly visible if it should be removed

### 10. Cache Version Reset
Purpose:
- verify schema-change safety

Steps:
1. populate cache
2. change cache version marker
3. relaunch app

Expected:
- old cache is cleared
- rebuild path runs cleanly

### 11. Mid-Sync Failure
Purpose:
- validate watermark safety

Steps:
1. populate cache
2. trigger delta sync
3. force a network or merge failure mid-process
4. relaunch app and retry

Expected:
- old cache remains usable
- watermark is not advanced incorrectly
- retry eventually recovers

### 12. Large Delta Pagination
Purpose:
- validate multi-page merge behavior

Steps:
1. create enough updated products to require multiple pages
2. trigger delta sync
3. verify all changed products arrive

Expected:
- no missing page
- no duplicate products
- watermark only advances after full success

## Performance Checks

Capture before/after for:

- app startup duration
- time to Sales-ready state
- time to first product search
- delta sync duration
- number of products returned by delta

## Logging Checklist
Future implementation should log:

- cache load start/end
- cached product count
- watermark used
- delta fetch page count
- delta item count
- merge duration
- cache save duration
- fallback-to-full-sync reason

## Pass Criteria
A future implementation should pass if:

- startup is visibly faster than full product sync baseline
- product-dependent cashier flows work before delta completion
- all product lookup behaviors remain correct
- failures recover without corrupting local product state

## Regression Focus Areas
These are the most important manual regression checks:

1. Sales product search
2. barcode search
3. PLU search
4. weighed barcode search
5. Back Office product list accuracy
6. price updates reflected after delta sync
7. inactive/deleted product handling

## Notes
This document is intentionally implementation-ready but not release-ready.

When the product incremental-sync project starts, update this file with:

- exact feature flag name
- exact debug log labels
- exact cache storage location
- exact reconciliation trigger rules
