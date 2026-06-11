# Product Tax Support Design

## Context

The POS already has order-level and line-level tax fields, and the pricing engine accepts a tax rate, but the cart currently does not pass a configured rate and products do not expose a taxable flag. This feature adds a global tax percentage in settings, a per-product toggle for whether tax applies, and reporting support for the resulting tax snapshots.

## Decisions

- Tax is configured globally as a percentage. For example, `8.25` means 8.25%.
- Tax is calculated after discounts and after order-level discounts are allocated to lines.
- Products are non-taxable by default when the new field is missing.
- Missing or blank global tax settings behave as `0`.
- Reports use stored order and order-line tax snapshots instead of recomputing tax from current settings.

## Data Model

Add `taxValue: Float` to `GlobalSettings`. The value is stored as a percentage and converted to a decimal rate only when pricing is calculated. Existing settings without this value are treated as `0`.

Add `taxable: Boolean` to `Product`. Existing products without this value are treated as `false`. The product form will expose this as a toggle labeled clearly, such as `Apply tax` or `Taxable`.

Use the existing `Order.tax`, `OrderLine.tax`, `OrderLine.lineTotalBeforeTax`, and `OrderLine.lineTotalAfterTax` fields as the historical tax snapshot for completed orders. No separate tax rules table is part of this scope.

## Pricing And Checkout

The cart will pass the global `taxValue` into `PricingEngine.preview` as a decimal rate. A configured value of `8.25` becomes `0.0825`.

Each cart line will carry the product `taxable` flag into pricing. For each line, the pricing engine will:

1. Compute base line amount from product price and quantity.
2. Apply price overrides and line discounts.
3. Allocate order-level discounts.
4. Calculate tax only when `taxable` is true, using the final line amount after discounts.
5. Store line tax and line totals before and after tax.

Cart summary, payment dialogs, order save, order details, receipts, and open-order restore should consume the pricing engine totals rather than recomputing tax. Old open orders should remain stable because restored order snapshots already include their stored tax and totals.

## Settings And Product UX

Settings will add a numeric tax percentage input near the existing global business preferences. It should accept decimals, reject negative values, and use a practical upper bound such as `100`. Blank input saves as `0`.

The product form will add a taxable toggle alongside existing catalog toggles such as availability and EBT eligibility. New products default to non-taxable unless the user turns the toggle on.

The settings and product data-access layers will preserve the new fields through DTO/entity mapping, service save/update calls, store slices, generated API types, and shared model copies.

## Reporting

Reports will rely on stored order and order-line tax values so historical reporting stays correct after a tax rate changes.

Tax should be surfaced in money-focused reports where it helps reconcile totals:

- Sale List: add a tax column and keep amount as the tax-inclusive transaction total after refunds.
- End of Day: include tax in summary totals alongside gross sales, discounts, refunds, and net sales.
- Order Details and line details: show line tax where line totals are displayed.
- Sales by employee, product, category, and dashboard money totals: confirm totals include the correct stored values and do not accidentally drop tax.
- Refund reports: continue using refund snapshots; tax-inclusive refund amounts should be labeled clearly.

Refund handling should subtract tax from aggregates using stored refund amounts where available. When only line quantities are available, tax should be prorated from the original line snapshot.

## Backward Compatibility And Rollout

Runtime behavior is backward-compatible:

- Missing `GlobalSettings.taxValue` means `0`.
- Missing `Product.taxable` means `false`.
- Existing orders retain their stored tax and total values.

Schema and generated model updates are required for Amplify/API models and the shared model copies used by the app. Any migration or regeneration should avoid changing unrelated generated files beyond what the schema update requires.

## Test Coverage

Add or update focused tests for:

- Global settings DTO/service/slice loading and saving `taxValue`.
- Product entity/form defaulting and saving `taxable`.
- Pricing engine tax on taxable lines only, calculated after discounts.
- Cart totals passing the configured rate into pricing.
- Order mapping persisting order tax and line tax.
- Reporting aggregations including tax and preserving historical snapshots.

## Out Of Scope

- Multiple tax rates by product, category, location, or jurisdiction.
- Tax exemptions by customer.
- A dedicated tax rule management screen.
- Backend tax validation beyond the existing pricing/reconciliation flow.
