# Sales Tax UI Design

## Context

Product tax support is already implemented in the pricing path: products can be taxable, global settings provide a tax percentage, the pricing engine calculates line and order tax, and the cart footer carries `subtotal`, `tax`, and `total`.

The current sales screen applies tax correctly, but it does not make the tax visible to the cashier. For example, a taxable `$6.99` item at `7%` shows `Receive Payment - $7.48`, while the cart line still shows `$6.99`. The amount is correct, but the UI does not explain the difference.

## Goal

Add a compact cashier-facing tax indication to the sales cart so cashiers can quickly understand and explain the amount due when tax is applied.

This is not a customer-facing receipt redesign and not a full report update. It is a targeted sales screen clarity improvement.

## Decisions

- Show tax details only when `cart.footer.tax > 0`.
- Keep cart line items clean. Do not add tax chips or tax labels to every product row.
- Place the tax details directly above the existing checkout actions in the cart action area.
- Include the configured tax rate in the label when available, for example `Tax (7%)`.
- Keep the existing checkout button amount unchanged; it continues to show the final tax-inclusive total.

## UI Design

When tax is present, the cart action area should show a compact totals block before the checkout buttons:

```text
Subtotal       $6.99
Tax (7%)       $0.49
Total          $7.48
```

The totals block should visually match the existing cart controls: restrained dark surface, existing border treatment, compact spacing, and no decorative styling. The total row should have slightly stronger emphasis than subtotal and tax.

When the cart has no tax, the totals block is hidden entirely. Non-taxable sales should look the same as they do today.

## Data Flow

The component should reuse existing cart and settings data:

- `cart.footer.subtotal` for the subtotal row.
- `cart.footer.tax` to decide visibility and display the tax amount.
- `cart.footer.total` for the total row.
- `globalSettings.taxValue` for the optional rate label.

The UI should not recalculate tax. Pricing remains owned by the existing cart/pricing engine flow.

## Edge Cases

- If `cart.footer.tax` is `0`, missing, or not finite, hide the block.
- If `globalSettings.taxValue` is missing or not positive but `cart.footer.tax` is positive, label the row as `Tax` instead of `Tax (%)`.
- If discounts are present, use the already calculated `cart.footer.subtotal`, which reflects the pricing engine output after discounts.
- The payment button and the totals block must show the same final total.

## Accessibility And Copy

Use plain cashier-facing labels:

- `Subtotal`
- `Tax (7%)` when the configured rate is available
- `Tax` when the rate is unavailable
- `Total`

The block should be readable at register distance and should not rely on color alone to communicate hierarchy.

## Test Coverage

Add focused sales cart tests for:

- Tax totals block is hidden when `cart.footer.tax` is `0`.
- Tax totals block appears when `cart.footer.tax` is positive.
- Tax row includes the configured rate label, such as `Tax (7%)`.
- Tax row falls back to `Tax` if the rate is unavailable.
- Total row matches the checkout button total.

## Out Of Scope

- Customer-facing receipt changes.
- Product-row tax badges.
- A dedicated tax details modal.
- Reporting changes.
- Backend schema or pricing engine changes.
