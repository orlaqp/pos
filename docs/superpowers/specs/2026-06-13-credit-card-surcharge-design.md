# Credit Card Surcharge Design

## Executive Summary

This feature adds a consistent global credit card surcharge to the POS. The surcharge is configured once as a percentage and applies only to the portion of a transaction paid by credit card. Cash, check, and EBT payments do not generate a surcharge.

The surcharge is shown clearly during payment, printed on receipts, and reported separately from product sales. This gives the merchant transparent processing fee recovery without inflating sales, product, tax, discount, or employee performance totals.

## Business Rules

- The credit card surcharge is defined globally in settings as a percentage.
- The same percentage applies to every credit card payment.
- Cashiers cannot edit the surcharge percentage at checkout.
- The surcharge applies only to the credit card sale portion of a payment.
- Cash, check, and EBT amounts are excluded from surcharge calculation.
- Product sale totals remain separate from surcharge recovery.
- Receipts and reports show the surcharge as a distinct payment/processing fee line.
- Historical orders retain the surcharge rate and amount used at the time of payment.

Example with a `3%` surcharge:

| Item | Amount |
| --- | ---: |
| Product sale total | `$100.00` |
| Cash / EBT tender | `$40.00` |
| Credit card sale portion | `$60.00` |
| Credit card surcharge | `$1.80` |
| Total charged to card | `$61.80` |
| Total collected from customer | `$101.80` |
| Reported product sales | `$100.00` |
| Reported processing fee recovery | `$1.80` |

## Configuration

Global settings will include a credit card surcharge percentage field. A value such as `3` means `3%`. Missing or blank values behave as `0%` for backward compatibility.

The settings UI should treat this as a numeric percentage:

- Allow decimal values.
- Reject negative values.
- Use a practical upper bound to prevent accidental entries.
- Save blank input as `0`.
- Make the setting clear that it applies to credit card payments only.

## Checkout Experience

The payment screen will continue to ask the cashier for tender amounts that satisfy the product sale total. The cashier enters the credit card sale portion before surcharge. The app then calculates and displays the surcharge automatically.

For a split payment, the payment screen should show:

- Product sale total.
- Non-card tender amounts.
- Credit card sale portion.
- Credit card surcharge.
- Final amount to charge to the card.

Payment validation should compare tender sale portions against the product sale total, excluding surcharge. In the example above, `$40.00` cash/EBT plus `$60.00` credit card satisfies the `$100.00` sale. The additional `$1.80` is collected as surcharge recovery and is not treated as product sale tender.

## Data And Persistence

The surcharge must be snapshotted when the order is paid so future settings changes do not alter historical receipts or reports.

Each completed credit card payment should preserve:

- Base card amount: the credit card portion applied to the product sale.
- Surcharge rate: the global percentage used at the time of payment.
- Surcharge amount: the rounded surcharge collected for that card payment.

The paid order should also expose a convenient order-level surcharge total for reporting, derived from its credit card payment snapshots. Existing orders and payments without surcharge fields behave as having `0` surcharge.

## Receipts

Receipts will show the credit card surcharge in the payment section, not in the product totals section. The order total remains the product sale total.

The new receipt row should use the same payment-row alignment and formatting that receipts use today. It should not introduce a separate visual layout or misaligned text block.

Expected receipt treatment:

- Product totals show subtotal, discounts, tax when applicable, and total.
- Payment rows show tender amounts.
- `Credit Card Surcharge` appears as a separate payment row.
- The card charge can be shown as the card sale portion plus surcharge where receipt space allows.

## Reporting

Reports that show credit card amounts will separate the card sale amount from surcharge recovery.

Sales reports should keep these values out of product sales:

- Processing fee recovery.
- Total charged to card above the product sale amount.

Money-focused reports should surface surcharge recovery where it helps reconciliation:

- Payment Summary: show credit card sale amount separately from processing fee recovery.
- End of Day: include processing fee recovery alongside payment method totals.
- Order Details: show card base amount, surcharge amount, and total charged to card.
- Sale List or transaction rows: include surcharge when credit card payment amounts are shown.
- Refund reports: keep product refunds separate from any explicit surcharge refund.

Product/category/employee sales, discounts, tax, and net sales remain based on order and line values, not surcharge recovery.

## Refund Handling

Product refunds do not automatically refund the credit card surcharge. If the business wants to refund a processing fee, the refund flow should capture that as an explicit surcharge refund amount and report it separately from product refunds.

This keeps fee recovery accounting deliberate and avoids changing product sales or refund totals when a payment fee is waived or returned.

## Backward Compatibility

The feature is backward-compatible:

- Missing global surcharge setting means `0%`.
- Existing payments without surcharge fields show no surcharge.
- Historical receipts for old orders continue to render with the existing payment rows.
- Reports treat missing surcharge amounts as `0`.

## Error Handling

Invalid surcharge settings should be handled before checkout:

- Blank or missing value saves as `0`.
- Negative values are rejected.
- Non-numeric input is rejected.
- The UI should protect against accidental extreme percentages.

Rounding should happen at the payment calculation boundary. The displayed surcharge, stored surcharge, receipt row, and report value must match to the cent.

## Test Coverage

Implementation should include focused tests for:

- Global settings loading, saving, and defaulting the surcharge percentage.
- Payment screen calculation for credit-card-only payments.
- Payment screen calculation for split tender payments.
- Cash, check, and EBT not generating surcharge.
- Paid order persistence snapshotting the surcharge rate and amount.
- Receipt preview output adding the surcharge row with existing payment alignment.
- End-of-day and payment summary reports separating card sales from processing fee recovery.
- Order detail reporting showing base card amount, surcharge, and charged-to-card total.
- Old orders with no surcharge fields rendering and reporting correctly.

## Out Of Scope

- Per-transaction surcharge overrides.
- Different surcharge rates by card brand, station, cashier, store, or customer.
- Treating surcharge as a product, SKU, or order line.
- Automatically refunding surcharge during product refunds.
- Processor integration or card-network compliance validation.
