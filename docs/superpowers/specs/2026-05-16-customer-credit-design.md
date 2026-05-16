# Customer Credit Design

## Context

The POS app already has a minimal Amplify/DataStore `Customer` model and `Order`
already has a `Customer @hasOne` relationship through `orderCustomerId`. The
current native app does not expose a customer management flow, cart state does
not carry a selected customer, and customer credit is not represented in
payments, orders, reporting, receipts, or customer history.

All implementation work for this feature must start from the latest `main` and
finish with a pull request. The final implementation PR must include manual test
steps for the customer and credit workflows.

## Goals

Support tenant-wide customer accounts with credit limits, partial credit
purchases, account payments, full payment and ledger history, refund reversals,
receipts, and reports in the native iPad POS app.

## Non-Goals

The first version does not add customer credit management to the web admin app.
It also does not reserve credit for open or printed orders. Credit exposure
changes only when an order is paid/closed with credit or when an account payment
or refund reversal is recorded.

## Data Model

Extend the existing `Customer` model with operational credit fields:

- `active`: whether the customer can be used for new credit purchases.
- `creditLimit`: tenant-wide maximum unpaid credit allowed for the customer.
- `creditBalance`: current unpaid customer credit balance. Negative values are
  allowed and represent store credit from overpayment.
- `creditStatus`: `OK` or `OVER_LIMIT`.

Keep the existing identity/contact fields and require first name plus at least
one contact method, phone or email. Date of birth remains optional. Phone and
email are each unique within the tenant. No active or inactive customer may
share the same phone or email with another customer.

Add a `CustomerCreditTransaction` DataStore model as the audit ledger:

- `tenantId`
- `customerId`
- customer snapshot fields, such as display name, phone, and email
- transaction type: `CREDIT_PURCHASE`, `ACCOUNT_PAYMENT`,
  `REFUND_REVERSAL`, `ADJUSTMENT`
- signed amount, where purchases increase balance and payments/refunds reduce
  balance
- payment method for account payments: cash, card, check, or EBT
- linked `orderId` and `orderNo` when the transaction comes from an order or
  refund
- employee id/name
- station/store context when available
- timestamp
- optional notes
- idempotency/reference key for order close and refund retry safety

The ledger is the audit history. `Customer.creditBalance` is the operational
snapshot used by cart, customer list, and checkout screens.

## Permissions

Add customer-credit-specific roles:

- `Create Customers`: may create and edit basic customer records during
  checkout and in Back Office.
- `Manage Customer Credit`: may set or change credit limits and customer active
  status. Admins also have this permission.
- `Receive Customer Credit Payments`: may record account payments. Admins also
  have this permission.

Existing Sales and Payments roles continue to control access to sales and
payment workflows. A cashier may create a customer during checkout if they have
`Create Customers`, but they may not grant credit unless they also have
`Manage Customer Credit` or are an Admin.

## Native Sales Flow

Add a compact customer bar near the top of the cart area.

Default state:

- Shows `Walk-in customer`.
- Offers customer selection.
- Offers customer creation only when the current employee has `Create
  Customers` or Admin.

Selected state:

- Shows customer display name.
- Shows active/inactive state.
- Shows unpaid balance, credit limit, and available credit.
- Offers clear customer, select another customer, and account payment actions.

Credit payment behavior:

- `Customer Credit` appears as a payment method alongside cash, card, check,
  and EBT.
- `Customer Credit` is disabled until an active customer is selected on the cart.
- Partial credit is allowed with any other tender combination.
- Payment submit re-checks the latest locally known customer available credit.
- If credit is insufficient, payment is blocked and the dialog shows balance,
  limit, and available credit.
- If credit is sufficient, the order closes and creates a
  `CREDIT_PURCHASE` ledger transaction.

Open/printed orders do not reserve customer credit. If an open order is paid
later, the credit check happens at that final payment/close moment.

## Customer Management

Re-enable Customers in the native Back Office area and add customer management
screens.

The Customers screen supports:

- search by name, phone, and email
- active/inactive status
- customer create/edit
- credit limit controls for authorized employees
- current balance, available credit, and over-limit status
- full customer credit ledger history

Customer save must block duplicate phone or email values within the tenant.

## Account Payments

Customer account payments can be started from:

- the Customers screen
- the selected-customer cart bar

The employee must be Admin or have `Receive Customer Credit Payments`.

Account payments support cash, card, check, and EBT. Payments reduce
`creditBalance` and create an `ACCOUNT_PAYMENT` ledger transaction. Overpayment
is allowed and creates a negative balance/store credit, but the UI must show a
confirmation warning before saving.

Account payment receipts are required in the first version. Printed receipts
show the transaction amount only, not remaining balance or available credit.

## Refunds

Refunding an order that used customer credit must create a `REFUND_REVERSAL`
ledger transaction for the refunded credit-paid amount. The reversal reduces
the unpaid credit balance. Refund reversal creation must be idempotent so
retrying a refund cannot double-reduce the balance.

Printed refund receipts should show the transaction/refund amount only.

## Offline And Sync Behavior

Credit purchases are allowed offline. Payment-time credit validation uses the
locally known DataStore customer snapshot. If multiple offline stations later
sync credit purchases that push the customer over their limit, the app flags
the customer as `OVER_LIMIT` after reconciliation.

Over-limit status blocks additional credit purchases until the customer balance
is brought back within limit or the limit is raised by an authorized employee.

## Reporting And Reconciliation

Credit must be included in reporting from the first version.

Updates to existing reporting:

- Payment Summary includes `Customer Credit` as its own tender/payment method.
- Sale List and order details show credit in each order payment breakdown.
- End of Day reports credit purchases as receivables, not cash collected.
- Refund Report includes credit refund reversals for credit-paid orders.

New native reporting:

- Customer Credit / Accounts Receivable report showing customer, active status,
  credit status, credit limit, unpaid balance, available credit, over-limit
  flag, and last credit/payment activity.
- Account Payment report or report section showing customer account payments by
  method, employee, date, and amount.

Account payments must be separate from sales tender totals so paying down old
credit does not inflate product sales.

## Architecture

Add bounded customer modules:

- `libs/customers/data-access`
  - customer entity mapping
  - customer service
  - customer slice/selectors
  - duplicate phone/email checks
  - credit availability calculation
  - ledger transaction service
  - balance snapshot update helpers
- `libs/customers/native-feature`
  - Back Office customer list and detail form
  - checkout customer picker/create dialog
  - cart customer bar
  - account payment dialog
  - transaction history and reporting screens

Update existing domains:

- `libs/sales/data-access`
  - cart state stores selected customer summary
  - payment types include customer credit
  - cart reset/snapshot/open-order restore handles customer selection
- `libs/sales/native-feature`
  - credit-aware cart bar and payment dialog behavior
- `libs/orders/data-access`
  - order close links the selected customer
  - order close creates credit ledger transaction when credit is used
  - refund creates idempotent credit reversal ledger transaction
- `libs/printings/data-access`
  - credit purchase/account payment/refund receipt support
- `libs/reporting/data-access` and native reporting screens
  - credit-aware tender aggregation
  - accounts receivable and account payment reporting
- Amplify generated models/API
  - update schema and run the existing model/API sync workflow

Order lifecycle code should call customer data-access service functions rather
than owning all customer credit rules directly.

## Error Handling

- Duplicate phone/email blocks customer save with a clear message.
- Inactive customer blocks credit payment.
- Missing selected customer disables credit payment.
- Insufficient available credit blocks payment submit.
- Offline credit purchases are allowed based on local customer state.
- Post-sync over-limit accounts are flagged.
- Account overpayment requires confirmation.
- Order close must not silently succeed with missing credit ledger history.
- Refund reversal must be idempotent.

## Automated Testing

Add focused tests for:

- role and permission gates
- customer duplicate checks
- credit available calculation
- customer create/edit validation
- cart selected-customer state and reset behavior
- partial credit payments mixed with other tenders
- submit-time credit re-check
- blocked credit payment without selected customer
- blocked credit payment for inactive customer
- blocked insufficient credit
- account payment and overpayment confirmation
- order close creates order, ledger entry, and customer balance update
- refund creates one reversal ledger entry
- report aggregations for credit, account payments, refunds, and over-limit
  states
- receipt builders showing transaction amount only

## Manual Test Steps For The Implementation PR

The implementation PR must include manual steps covering:

1. Start from latest `main`, create the feature branch, and run schema/codegen
   setup if needed.
2. Create a customer during checkout with first name and phone or email.
3. Verify duplicate phone/email is blocked.
4. Verify customer creation is blocked without the `Create Customers` role.
5. Set a customer credit limit as Admin or `Manage Customer Credit`.
6. Verify a non-authorized cashier cannot change the credit limit.
7. Select an active customer on the cart and complete a partial credit purchase
   with another tender.
8. Attempt credit payment with no selected customer and confirm Customer Credit
   is disabled.
9. Attempt credit payment above available credit and confirm it is blocked.
10. Receive an account payment from the cart customer bar.
11. Receive an account payment from Back Office Customers.
12. Overpay an account and confirm the warning appears before saving.
13. Refund a credit-paid order and confirm the customer balance is reduced.
14. Print/reprint credit purchase and account payment receipts and confirm only
   transaction amounts are shown.
15. Check Payment Summary, Sale List, End of Day, Refund Report, Customer
   Credit report, and Account Payment report for correct credit treatment.
