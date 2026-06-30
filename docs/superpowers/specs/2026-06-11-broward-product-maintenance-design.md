# Broward Product Maintenance Design

## Context

The Broward tenant needs a one-time Product table maintenance operation in the production Amplify environment.

- Tenant ID: `f4287488-b0b1-709f-86f8-868782693a83`
- Target environment: `prod`
- AWS profile: `pos`
- Product inventory field: `quantity`
- Product UPC-like field: `barcode`

The operation must only affect Product records owned by the Broward tenant.

## Goals

1. Set the inventory count for every Broward product to `1000`.
2. For every Broward product whose `barcode` string is longer than 14 characters, remove the first 4 characters and keep the rest.
3. Provide a dry-run preview before any write.
4. Keep the update narrowly scoped and auditable.

## Non-Goals

- Do not update products for any tenant other than Broward.
- Do not create inventory receive/count documents.
- Do not rewrite full product records.
- Do not change product schema or application behavior.

## Recommended Approach

Add a focused TypeScript maintenance CLI under `tools/`, modeled after the existing tenant-scoped DynamoDB tools.

The CLI resolves the Product table from the `prod` Amplify environment instead of hardcoding a physical DynamoDB table name. It scans the Product table with a tenant filter for Broward, computes a plan, prints the planned changes, and only writes when called with `--apply`.

Dry-run is the default.

## CLI Behavior

Default options:

- `--tenant-id f4287488-b0b1-709f-86f8-868782693a83`
- `--target-env prod`
- `--profile pos`

The command should log:

- target environment
- target stack
- AWS profile
- dry-run or apply mode
- resolved Product table name
- total Broward products scanned
- products whose `quantity` would change
- products whose `barcode` would change
- a small sample of barcode before/after values

## Update Rules

For each matching Product record:

- Set `quantity` to `1000`.
- If `barcode` is a string with length greater than `14`, set `barcode` to `barcode.slice(4)`.
- Leave `barcode` unchanged when it is missing, not a string, empty, or 14 characters or shorter.
- Set `updatedAt` to the current ISO timestamp.
- Set `_lastChangedAt` to the current epoch timestamp in milliseconds.
- Set `_version` to the current numeric `_version + 1`; if `_version` is missing or not numeric, set it to `1`.

Use DynamoDB `UpdateCommand` instead of full-item writes so unrelated fields are not rewritten.

Each write should include a conditional expression requiring:

- the item still exists
- `tenantId` still equals `f4287488-b0b1-709f-86f8-868782693a83`

## Safety

The CLI must not write unless `--apply` is present.

The barcode cleanup is a one-time transformation, not an idempotent operation. If an original barcode is long enough that `barcode.slice(4)` is still longer than 14 characters, a second apply run would trim another 4 characters. Because of that, the dry-run report must be reviewed before apply, and the apply command must not be rerun without a fresh review of planned barcode changes.

Before applying, the dry-run output should be reviewed for:

- expected tenant ID
- expected environment and profile
- reasonable product count
- reasonable barcode change examples

The apply run should use the same command plus `--apply`.

## Testing

Add focused unit tests for the planning logic:

- includes only the selected tenant
- sets all selected product quantities to `1000`
- trims only barcodes longer than 14 characters
- trims barcodes with `slice(4)`
- leaves barcodes of length 14 or less unchanged
- reports quantity and barcode change counts correctly

Manual verification should include:

1. Run dry-run and inspect the report.
2. Run apply only after dry-run looks correct.
3. Spot-check updated products from the dry-run sample and confirm `quantity = 1000` and each sampled `barcode` equals the planned before value with the first 4 characters removed.
4. If a post-apply dry-run is executed, treat any remaining barcode changes as a new plan that needs review rather than automatic evidence that the first apply failed.
