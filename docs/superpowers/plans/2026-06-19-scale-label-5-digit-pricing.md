# Scale Label 5-Digit Pricing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add tenant-controlled scale label parsing for `02 + 5-digit PLU + 5-digit total price + check digit` while preserving legacy tenants and prioritizing exact full barcode/SKU matches.

**Architecture:** Store the tenant scale label profile on `GlobalSettings`, map it into settings DTO/state, and pass it into `ProductService.search` from Sales. Extract weighted label parsing into small profile-aware helpers inside `ProductService` so tests can lock down search priority and migration fallback without changing unrelated product flows.

**Tech Stack:** TypeScript, React Native, Amplify DataStore models, Redux Toolkit, Nx/Jest.

---

### Task 1: Product Search Contract And Parser Behavior

**Files:**
- Modify: `libs/products/data-access/src/lib/product.service.spec.ts`
- Modify: `libs/products/data-access/src/lib/product.service.ts`

- [ ] **Step 1: Write failing search behavior tests**

Add tests in `ProductService.search barcode handling` for:

```typescript
it('defaults to legacy weighted barcode parsing when no scale profile is provided', () => {
    const res = ProductService.search(products, {
        text: '204015001990',
        onlyActive: true,
    });

    expect(res.items[0].id).toBe('p2');
    expect(res.price).toBe(199);
    expect(res.quantity).toBeCloseTo(1, 5);
});

it('parses migrated EAN-13 scale labels with five digit PLU and price', () => {
    const res = ProductService.search(products, {
        text: '0206245212998',
        onlyActive: true,
        scaleBarcodePriceFormat: 'EAN13_02_5_PLU_5_PRICE',
    });

    expect(res.items[0].id).toBe('p4');
    expect(res.price).toBe(21299);
    expect(res.quantity).toBeCloseTo(21299 / 100 / 4.25, 5);
});

it('falls back to legacy weighted labels for migrated tenants when new profile does not resolve', () => {
    const res = ProductService.search(products, {
        text: '204015001990',
        onlyActive: true,
        scaleBarcodePriceFormat: 'EAN13_02_5_PLU_5_PRICE',
    });

    expect(res.items[0].id).toBe('p2');
    expect(res.price).toBe(199);
});

it('prioritizes exact full barcode over weighted label parsing', () => {
    const res = ProductService.search([
        ...products,
        {
            id: 'full-barcode',
            name: 'Full Barcode Product',
            description: 'normal barcode',
            barcode: '0206245212998',
            sku: null,
            plu: null,
            price: 9.99,
            quantity: 10,
            unitOfMeasure: 'EA',
            isActive: true,
        },
    ] as any, {
        text: '0206245212998',
        onlyActive: true,
        scaleBarcodePriceFormat: 'EAN13_02_5_PLU_5_PRICE',
    });

    expect(res.items).toHaveLength(1);
    expect(res.items[0].id).toBe('full-barcode');
    expect(res.price).toBeUndefined();
    expect(res.quantity).toBeUndefined();
});

it('prefers migrated profile when migrated and legacy candidates resolve different products', () => {
    const res = ProductService.search([
        ...products,
        {
            id: 'legacy-conflict',
            name: 'Legacy Conflict',
            description: 'legacy candidate',
            barcode: null,
            sku: null,
            plu: '0624',
            price: 1,
            quantity: 10,
            unitOfMeasure: 'LB',
            isActive: true,
        },
    ] as any, {
        text: '0206245212998',
        onlyActive: true,
        scaleBarcodePriceFormat: 'EAN13_02_5_PLU_5_PRICE',
    });

    expect(res.items[0].id).toBe('p4');
    expect(res.price).toBe(21299);
});
```

- [ ] **Step 2: Run product tests and verify failure**

Run:

```bash
PATH=/Users/orlando/dev/pos/node_modules/.bin:$PATH yarn nx test products-data-access --runInBand
```

Expected: FAIL because `scaleBarcodePriceFormat` is not part of `ProductSearchRequest` and exact barcode does not yet win before scale parsing.

- [ ] **Step 3: Implement profile-aware product search**

In `ProductService`, add:

```typescript
export type ScaleBarcodePriceFormat =
    | 'LEGACY_4_DIGIT_PRICE'
    | 'EAN13_02_5_PLU_5_PRICE';
```

Extend `ProductSearchRequest` with optional `scaleBarcodePriceFormat?: ScaleBarcodePriceFormat | null`.

Refactor weighted parsing so legacy candidates and migrated EAN-13 candidates are built separately. Default missing or unknown values to legacy. For complete numeric scans, run exact barcode/SKU before scale parsing, then exact PLU.

- [ ] **Step 4: Run product tests and verify pass**

Run:

```bash
PATH=/Users/orlando/dev/pos/node_modules/.bin:$PATH yarn nx test products-data-access --runInBand
```

Expected: PASS.

### Task 2: GlobalSettings Model Mapping

**Files:**
- Modify: `apps/mobile-ui/amplify/backend/api/pos/schema.graphql`
- Modify: `libs/settings/data-access/src/lib/global-settings.dto.ts`
- Modify: `libs/settings/data-access/src/lib/services/global-settings.service.ts`
- Modify generated model/query files only as needed for TypeScript compatibility on this branch.
- Modify: `libs/settings/data-access/src/lib/slices/settings.slice.spec.ts`

- [ ] **Step 1: Write failing settings mapping tests**

Extend settings slice specs to verify `GlobalSettingsEntityMapper.from` maps `scaleBarcodePriceFormat` and defaults missing values to `LEGACY_4_DIGIT_PRICE`.

- [ ] **Step 2: Run settings tests and verify failure**

Run:

```bash
PATH=/Users/orlando/dev/pos/node_modules/.bin:$PATH yarn nx test settings-data-access --runInBand
```

Expected: FAIL because DTO/model mapping does not include the new field.

- [ ] **Step 3: Implement settings schema and DTO mapping**

Add `scaleBarcodePriceFormat: String @default(value: "LEGACY_4_DIGIT_PRICE")` to `GlobalSettings` in the GraphQL schema. Add the field to `GlobalSettingsDTO`, mapper, and service create/update copy logic. Default missing values to `LEGACY_4_DIGIT_PRICE`.

- [ ] **Step 4: Run settings tests and verify pass**

Run:

```bash
PATH=/Users/orlando/dev/pos/node_modules/.bin:$PATH yarn nx test settings-data-access --runInBand
```

Expected: PASS.

### Task 3: Sales Integration

**Files:**
- Modify: `libs/sales/native-feature/src/lib/components/sales-screen/sales-screen.tsx`
- Modify sales tests if existing mocked settings shape requires the new field.

- [ ] **Step 1: Pass tenant profile into product search**

Update Sales product search calls to pass `globalSettings?.scaleBarcodePriceFormat` into `ProductService.search`.

- [ ] **Step 2: Run sales tests**

Run:

```bash
PATH=/Users/orlando/dev/pos/node_modules/.bin:$PATH yarn nx test sales-native-feature --runInBand
```

Expected: PASS or only unrelated baseline failures. Fix type/test issues caused by the new setting.

### Task 4: Final Verification And Commit

**Files:**
- All touched files.

- [ ] **Step 1: Run focused tests**

Run:

```bash
PATH=/Users/orlando/dev/pos/node_modules/.bin:$PATH yarn nx test products-data-access --runInBand
PATH=/Users/orlando/dev/pos/node_modules/.bin:$PATH yarn nx test settings-data-access --runInBand
PATH=/Users/orlando/dev/pos/node_modules/.bin:$PATH yarn nx test sales-native-feature --runInBand
```

- [ ] **Step 2: Review diff**

Run:

```bash
git diff --check
git status --short
git diff --stat
```

- [ ] **Step 3: Commit implementation**

Commit with:

```bash
git add <touched files>
git commit -m "feat: add tenant scale label pricing profile"
```
