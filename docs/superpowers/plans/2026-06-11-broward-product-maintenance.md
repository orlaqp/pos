# Broward Product Maintenance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dry-run-first tenant maintenance CLI that updates only Broward Product records by setting `quantity` to `1000` and trimming long `barcode` values.

**Architecture:** Add a focused `tools/broward-product-maintenance` Nx/Jest tool with pure planning logic, DynamoDB update helpers, and a CLI runner. Add a root `package.json` script that invokes the CLI through `ts-node`.

**Tech Stack:** TypeScript, Nx Jest, AWS SDK v3 DynamoDB DocumentClient, Amplify CloudFormation environment resolution, `ts-node`.

---

## File Structure

- Create `tools/broward-product-maintenance/src/types.ts` for shared option, product, plan, and report types.
- Create `tools/broward-product-maintenance/src/planner.ts` for pure tenant filtering and update planning.
- Create `tools/broward-product-maintenance/src/planner.spec.ts` for focused unit tests.
- Create `tools/broward-product-maintenance/src/dynamo.ts` for table scanning and conditional update writes.
- Create `tools/broward-product-maintenance/src/cli.ts` for argument parsing, environment resolution, dry-run reporting, and apply mode.
- Create `tools/broward-product-maintenance/src/index.ts` to run the CLI from `ts-node`.
- Create `tools/broward-product-maintenance/jest.config.ts`, `tsconfig.json`, `tsconfig.spec.json`, and `project.json` matching existing tool projects.
- Modify `package.json` to add `maintain:broward-products`.

### Task 1: Planning Logic

**Files:**
- Create: `tools/broward-product-maintenance/src/types.ts`
- Create: `tools/broward-product-maintenance/src/planner.ts`
- Test: `tools/broward-product-maintenance/src/planner.spec.ts`
- Create: `tools/broward-product-maintenance/jest.config.ts`
- Create: `tools/broward-product-maintenance/tsconfig.json`
- Create: `tools/broward-product-maintenance/tsconfig.spec.json`
- Create: `tools/broward-product-maintenance/project.json`

- [ ] **Step 1: Write planner tests**

```ts
import { buildMaintenancePlan, summarizePlan } from './planner';

const tenantId = 'f4287488-b0b1-709f-86f8-868782693a83';

describe('broward product maintenance planner', () => {
  it('plans quantity updates only for the selected tenant', () => {
    const plan = buildMaintenancePlan(
      [
        { id: 'p1', tenantId, quantity: 4, barcode: '12345678901234', _version: 2 },
        { id: 'p2', tenantId: 'other', quantity: 3, barcode: '999999999999999', _version: 1 },
      ],
      tenantId
    );

    expect(plan).toHaveLength(1);
    expect(plan[0]).toMatchObject({ id: 'p1', tenantId, currentQuantity: 4, nextQuantity: 1000 });
  });

  it('trims only barcodes longer than 14 characters with slice(4)', () => {
    const plan = buildMaintenancePlan(
      [
        { id: 'long', tenantId, quantity: 1000, barcode: '000012345678901', _version: 1 },
        { id: 'exact', tenantId, quantity: 1000, barcode: '12345678901234', _version: 1 },
        { id: 'short', tenantId, quantity: 1000, barcode: '123', _version: 1 },
      ],
      tenantId
    );

    expect(plan.find((item) => item.id === 'long')?.nextBarcode).toBe('12345678901');
    expect(plan.find((item) => item.id === 'exact')?.nextBarcode).toBeUndefined();
    expect(plan.find((item) => item.id === 'short')?.nextBarcode).toBeUndefined();
  });

  it('summarizes quantity and barcode change counts', () => {
    const plan = buildMaintenancePlan(
      [
        { id: 'qty', tenantId, quantity: 9, barcode: '12345678901234', _version: 1 },
        { id: 'barcode', tenantId, quantity: 1000, barcode: '000012345678901', _version: 1 },
      ],
      tenantId
    );

    expect(summarizePlan(plan)).toMatchObject({
      totalProducts: 2,
      quantityChanges: 1,
      barcodeChanges: 1,
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `yarn nx test broward-product-maintenance --skip-nx-cache`

Expected: FAIL because `buildMaintenancePlan` and project files are not implemented yet.

- [ ] **Step 3: Implement pure planner**

Implement `ProductRecord`, `ProductUpdatePlan`, `MaintenanceSummary`, `buildMaintenancePlan`, and `summarizePlan`. Planner must filter by tenant, set `nextQuantity` to `1000`, set `nextBarcode` only when `barcode.length > 14`, and preserve enough before/after data for reporting and writes.

- [ ] **Step 4: Run tests to verify they pass**

Run: `yarn nx test broward-product-maintenance --skip-nx-cache`

Expected: PASS.

### Task 2: DynamoDB Runner and CLI

**Files:**
- Create: `tools/broward-product-maintenance/src/dynamo.ts`
- Create: `tools/broward-product-maintenance/src/cli.ts`
- Create: `tools/broward-product-maintenance/src/index.ts`
- Modify: `package.json`

- [ ] **Step 1: Implement DynamoDB helpers**

Create helpers to scan Products by tenant using `ScanCommand` and write planned changes using `UpdateCommand` with `ConditionExpression: 'attribute_exists(id) AND tenantId = :tenantId'`.

- [ ] **Step 2: Implement CLI**

Parse `--tenant-id`, `--target-env`, `--profile`, and `--apply`. Defaults are Broward tenant, `prod`, and `pos`. Resolve the Product table from CloudFormation via `resolveEnvironment`, build the maintenance plan, print dry-run/apply details, and run updates only with `--apply`.

- [ ] **Step 3: Add package script**

Add `"maintain:broward-products": "ts-node --project tools/tsconfig.tools.json tools/broward-product-maintenance/src/index.ts"` to root `package.json`.

- [ ] **Step 4: Run TypeScript/Jest validation**

Run: `yarn nx test broward-product-maintenance --skip-nx-cache`

Expected: PASS.

Run: `yarn maintain:broward-products`

Expected: CLI resolves prod with profile `pos`, scans Broward products, prints dry-run summary, and performs no writes.

### Task 3: Review and Commit

**Files:**
- All files from Tasks 1 and 2.

- [ ] **Step 1: Inspect changed files**

Run: `git diff --stat && git diff -- tools/broward-product-maintenance package.json docs/superpowers/plans/2026-06-11-broward-product-maintenance.md`

Expected: Changes are limited to the new maintenance tool, package script, and this plan.

- [ ] **Step 2: Commit implementation**

```bash
git add docs/superpowers/plans/2026-06-11-broward-product-maintenance.md tools/broward-product-maintenance package.json
git commit -m "feat: add broward product maintenance tool"
```

Expected: Commit succeeds without staging unrelated user changes.
