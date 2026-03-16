# Tenant Discount Seed QA

Run the tenant discount seed in dry-run first:

```bash
yarn seed:tenant-discounts --tenant-id <tenant-id>
```

Then run the live seed:

```bash
yarn seed:tenant-discounts --tenant-id <tenant-id> --apply
```

The seed writes a tenant-specific QA checklist to:

```text
tools/tenant-discount-seed/out/<tenant-id>-discount-qa.md
```

That generated file contains:

- the real store selected for the tenant
- the real category and product targets chosen from the tenant catalog
- the seeded discount names and promo codes
- a manual validation matrix with expected discount behavior

The seed is additive and rerunnable. It uses deterministic ids, so reruns update the same discount definitions and employee policies instead of creating duplicates.
