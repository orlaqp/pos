# Scale Label 5-Digit Pricing Design

## Goal

Support scale labels that encode a 5-digit PLU and 5-digit total price while preserving existing tenants that use the current 4-digit price format.

The target migrated scale label format is:

```text
02 + 5-digit PLU + 5-digit total price + check digit
```

This change must be tenant-controlled because customers must reconfigure their physical scales before using the new format.

## Current Behavior

Weighted label parsing lives in `ProductService.search`.

The current parser builds weighted barcode candidates from numeric scanner input and resolves those candidates by matching the parsed PLU against product `plu`.

The current search behavior is risky for migration because scale parsing can happen before exact full barcode matching, and the label profile is implicit instead of controlled per tenant.

## Non-Goals

- Do not expose this as a cashier-facing setting.
- Do not automatically migrate all tenants.
- Do not remove legacy 4-digit price label support.
- Do not redesign product sync or product catalog management.
- Do not require product-level scale configuration for this phase.

## Tenant Setting

Add a tenant-level scale label profile to `GlobalSettings`.

Field:

```text
scaleBarcodePriceFormat
```

Supported values:

```text
LEGACY_4_DIGIT_PRICE
EAN13_02_5_PLU_5_PRICE
```

Missing or unknown values must behave as `LEGACY_4_DIGIT_PRICE`.

The setting is support-controlled. It should not appear as a normal Settings screen toggle. The intended operator is the system owner or support/admin workflow, after confirming the customer has reconfigured their scales.

## Search Priority

Product search should use this priority for scanner-like numeric input:

1. Exact full barcode/SKU match against the complete scanned value.
2. Tenant-profile scale label parsing.
3. Exact PLU match for manual PLU entry.
4. Embedded or noisy scanner recovery for prefixed/suffixed scanner input.
5. Partial text search across name, description, barcode, SKU, and PLU.

Exact full barcode/SKU must win before any scale parsing. This protects normal UPC/EAN products from being interpreted as weighed labels.

## Scale Parser Behavior

Move weighted label parsing behind a small dedicated parser API rather than keeping substring rules inline in search.

The parser should return format-aware candidates containing:

- profile/format
- PLU
- total price in cents
- source label

Quantity is derived only after the parsed PLU resolves to a product:

```text
quantity = totalPriceInCents / 100 / product.price
```

For `LEGACY_4_DIGIT_PRICE`, preserve existing legacy 4-digit-price samples.

For `EAN13_02_5_PLU_5_PRICE`, parse:

```text
02 + 5-digit PLU + 5-digit total price + check digit
```

When a tenant is migrated to `EAN13_02_5_PLU_5_PRICE`, the search must try the new EAN-13 profile first. If it does not resolve to a product, it must fall back to the legacy parser so old labels can continue to work during transition.

If both new and legacy candidates could resolve to different products, the selected tenant profile wins.

## Runtime Flow

`GlobalSettings` already syncs into Redux. Sales product search should receive or read `globalSettings.scaleBarcodePriceFormat`.

If settings have not synced yet, or the field is missing, search must default to `LEGACY_4_DIGIT_PRICE`.

For migrated tenants:

1. Search exact full barcode/SKU first.
2. Try `EAN13_02_5_PLU_5_PRICE`.
3. If no product resolves, try legacy scale parsing.
4. Try exact PLU.
5. Continue with noisy scanner recovery and partial text search.

For legacy tenants:

1. Search exact full barcode/SKU first.
2. Try legacy scale parsing.
3. Try exact PLU.
4. Continue with noisy scanner recovery and partial text search.

## Migration Plan

Migration is opt-in per tenant.

Operational sequence:

1. Confirm the customer scale emits `02 + 5-digit PLU + 5-digit total price + check digit`.
2. Confirm product PLUs are stored as the matching 5-digit PLUs. Leading zero normalization may continue to support labels and stored PLUs that differ only by leading zeroes.
3. Update `GlobalSettings.scaleBarcodePriceFormat` for the tenant to `EAN13_02_5_PLU_5_PRICE`.
4. Test a known new label on one POS.
5. Test a known legacy label on the same POS if the store still has legacy labels.
6. Roll the updated scale configuration to the rest of the store.

## Error Handling And Safety

- Missing `GlobalSettings` defaults to legacy.
- Unknown setting values default to legacy.
- A scale candidate with no matching product should not produce a cart item.
- If product price is zero or invalid, the parser should not derive an infinite or invalid quantity.
- Fallback from new profile to legacy must happen only after the new profile fails to resolve a product.
- Scanner input with newline, tab, or known prefix/suffix noise should continue to work where it works today.

## Testing

Add focused coverage for:

- missing setting defaults to legacy
- legacy profile preserves current 4-digit-price weighted samples
- migrated profile parses `02 + 5-digit PLU + 5-digit total price + check digit`
- migrated profile falls back to old labels when the new profile does not resolve
- exact full barcode/SKU beats scale parsing
- exact PLU still works for manual PLU entry
- ambiguous migrated labels prefer the selected tenant profile
- noisy scanner input still resolves existing supported cases
- invalid or zero product price does not create an invalid quantity

## Acceptance Criteria

- Existing tenants keep current weighted label behavior without configuration changes.
- A tenant can be migrated by changing one tenant-level `GlobalSettings` value.
- Migrated tenants can scan the new 5-digit PLU/5-digit price label format.
- Migrated tenants can still scan legacy labels when those labels are not ambiguous with the selected profile.
- Full barcode scans are prioritized over scale parsing.
- The behavior is covered by unit tests around `ProductService.search` or the extracted parser.
