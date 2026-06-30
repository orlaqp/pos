# Credit Card Surcharge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a globally configured credit-card surcharge that applies only to the credit-card sale portion, displays during payment, persists on the paid order, prints on receipts, and reports separately from product sales.

**Architecture:** Follow the existing global tax setting pattern for configuration and add optional surcharge snapshot fields to the embedded `Payment` shape. Keep product/order totals unchanged; calculate surcharge from the base card tender amount and expose fee recovery as separate rows in receipts and reports.

**Tech Stack:** Nx monorepo, React Native, Redux Toolkit, Amplify DataStore generated models, Jest, React Native Testing Library.

---

## File Structure

- Modify `libs/settings/data-access/src/lib/global-settings.dto.ts` to add `creditCardSurchargePercent` with default `0`.
- Modify `libs/settings/data-access/src/lib/services/global-settings.service.ts` to save `creditCardSurchargePercent`.
- Modify `libs/settings/data-access/src/lib/slices/settings.slice.spec.ts` to test defaulting and reducer preservation.
- Modify `libs/settings/native-feature/src/lib/components/settings/settings.tsx` to add the global surcharge percentage input.
- Modify `libs/settings/native-feature/src/lib/components/settings/settings.spec.tsx` to test surcharge rendering, validation, and save payloads.
- Modify `libs/settings/data-access/src/lib/language/en.json` and `libs/settings/data-access/src/lib/language/es.json` to add surcharge labels.
- Create `libs/sales/data-access/src/lib/payment-surcharge.ts` for deterministic surcharge math.
- Modify `libs/sales/data-access/src/lib/cart-entity.ts` and `libs/sales/data-access/src/index.ts` to expose the extended payment type and helper.
- Modify `libs/sales/native-feature/src/lib/components/cart-payment/cart-payment.tsx` to display surcharge and emit enriched CC payment snapshots.
- Modify `libs/sales/native-feature/src/lib/components/cart-payment/cart-payment-dialog.tsx` and `libs/sales/native-feature/src/lib/components/cart/cart.tsx` to pass the global surcharge percentage to payment UI.
- Modify `libs/sales/native-feature/src/lib/components/cart-payment/cart-payment.spec.tsx` and relevant cart tests for card-only and split-tender surcharge behavior.
- Modify generated/shared model copies: `libs/shared/models/src/models/schema.js`, `libs/shared/models/src/models/schema.d.ts`, `libs/shared/models/src/models/index.d.ts`, `libs/shared/api/src/API.ts`, `libs/shared/api/src/graphql/queries.ts`, `libs/shared/api/src/graphql/mutations.ts`, `libs/shared/api/src/graphql/subscriptions.ts`, plus matching `apps/mobile-ui/src/...` copies.
- Modify `libs/orders/data-access/src/lib/order.entity.ts` and `libs/orders/data-access/src/lib/order.service.ts` to map and persist payment surcharge fields.
- Modify `libs/orders/data-access/src/lib/order.entity.spec.ts` and `libs/orders/data-access/src/lib/order.service.spec.ts` to test snapshot persistence and backward compatibility.
- Modify `libs/printings/data-access/src/lib/printing.service.ts` only if needed to preserve aligned payment row formatting; prefer changing ticket rows in order service.
- Modify `libs/printings/data-access/src/lib/printing.service.spec.ts` to verify `Credit Card Surcharge` appears with the existing payment-row text style.
- Modify `libs/reporting/data-access/src/lib/report-aggregations.ts` and `.spec.ts` to add a processing fee recovery payment summary row without inflating card sales.
- Modify `libs/reporting/native-feature/src/lib/components/end-of-day/end-of-day.service.ts`, `.spec.ts`, and `end-of-day.tsx` to show processing fee recovery separately from `CC`.
- Modify `libs/reporting/native-feature/src/lib/components/payment-summary/payment-summary.tsx` only if headers/labels need an explicit processing-fee row label.

## Task 1: Branch And Plan Baseline

**Files:**
- Verify: repository branch state
- Create: `docs/superpowers/plans/2026-06-14-credit-card-surcharge.md`

- [ ] **Step 1: Verify branch**

Run:

```bash
git status --short --branch
```

Expected: branch is `v2.1.5`, created from `2.1.4`; untracked client approval docs may remain untracked.

- [ ] **Step 2: Commit the plan**

Run:

```bash
git add docs/superpowers/plans/2026-06-14-credit-card-surcharge.md
git commit -m "docs: add credit card surcharge implementation plan"
```

Expected: one docs commit on `v2.1.5`.

## Task 2: Add Surcharge Math Unit

**Files:**
- Create: `libs/sales/data-access/src/lib/payment-surcharge.ts`
- Modify: `libs/sales/data-access/src/index.ts`
- Test: `libs/sales/data-access/src/lib/payment-surcharge.spec.ts`

- [ ] **Step 1: Write failing tests**

Add tests covering:

```ts
import {
  calculateCreditCardSurcharge,
  enrichCreditCardPaymentsWithSurcharge,
  getPaymentBaseAmount,
  getPaymentSurchargeAmount,
} from './payment-surcharge';

describe('payment surcharge helpers', () => {
  it('calculates surcharge from base card amount and percent', () => {
    expect(calculateCreditCardSurcharge(60, 3)).toBe(1.8);
    expect(calculateCreditCardSurcharge(10.005, 2.5)).toBe(0.25);
  });

  it('returns zero for non-positive or invalid inputs', () => {
    expect(calculateCreditCardSurcharge(60, 0)).toBe(0);
    expect(calculateCreditCardSurcharge(0, 3)).toBe(0);
    expect(calculateCreditCardSurcharge(60, Number.NaN)).toBe(0);
  });

  it('enriches only credit-card payments', () => {
    expect(
      enrichCreditCardPaymentsWithSurcharge(
        [
          { type: 'CASH', amount: 40 },
          { type: 'CC', amount: 60 },
          { type: 'EBT', amount: 5 },
        ],
        3
      )
    ).toEqual([
      { type: 'CASH', amount: 40 },
      { type: 'CC', amount: 60, baseAmount: 60, surchargeRate: 3, surchargeAmount: 1.8 },
      { type: 'EBT', amount: 5 },
    ]);
  });

  it('reads legacy payments as base amount with zero surcharge', () => {
    expect(getPaymentBaseAmount({ type: 'CC', amount: 60 })).toBe(60);
    expect(getPaymentSurchargeAmount({ type: 'CC', amount: 60 })).toBe(0);
  });
});
```

Run:

```bash
yarn nx test sales-data-access --testFile=libs/sales/data-access/src/lib/payment-surcharge.spec.ts
```

Expected: fail because the helper file does not exist.

- [ ] **Step 2: Implement helper**

Create:

```ts
export type SurchargePayment = {
  type: string;
  amount: number;
  baseAmount?: number | null;
  surchargeRate?: number | null;
  surchargeAmount?: number | null;
};

const roundMoney = (value: number) =>
  Math.round(((Number.isFinite(value) ? value : 0) + Number.EPSILON) * 100) / 100;

export const normalizeSurchargePercent = (value: unknown) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

export const isCreditCardPayment = (payment: { type?: string | null }) =>
  String(payment?.type || '').toUpperCase() === 'CC';

export const calculateCreditCardSurcharge = (baseAmount: number, percent: number) => {
  const amount = Number(baseAmount || 0);
  const rate = normalizeSurchargePercent(percent);
  if (amount <= 0 || rate <= 0) return 0;
  return roundMoney(amount * (rate / 100));
};

export const getPaymentBaseAmount = (payment: SurchargePayment) =>
  roundMoney(Number(payment.baseAmount ?? payment.amount ?? 0));

export const getPaymentSurchargeAmount = (payment: SurchargePayment) =>
  roundMoney(Number(payment.surchargeAmount ?? 0));

export const getPaymentChargedAmount = (payment: SurchargePayment) =>
  roundMoney(getPaymentBaseAmount(payment) + getPaymentSurchargeAmount(payment));

export const enrichCreditCardPaymentsWithSurcharge = <T extends SurchargePayment>(
  payments: T[],
  percent: number
) =>
  payments.map((payment) => {
    if (!isCreditCardPayment(payment)) return payment;
    const baseAmount = roundMoney(Number(payment.amount || 0));
    const surchargeRate = normalizeSurchargePercent(percent);
    const surchargeAmount = calculateCreditCardSurcharge(baseAmount, surchargeRate);
    return { ...payment, amount: baseAmount, baseAmount, surchargeRate, surchargeAmount };
  });
```

Export the helper from `libs/sales/data-access/src/index.ts`.

- [ ] **Step 3: Run tests**

Run:

```bash
yarn nx test sales-data-access --testFile=libs/sales/data-access/src/lib/payment-surcharge.spec.ts
```

Expected: pass.

- [ ] **Step 4: Commit**

Run:

```bash
git add libs/sales/data-access/src/lib/payment-surcharge.ts libs/sales/data-access/src/lib/payment-surcharge.spec.ts libs/sales/data-access/src/index.ts
git commit -m "feat: add credit card surcharge helper"
```

## Task 3: Add Global Surcharge Setting

**Files:**
- Modify: settings DTO/service/slice/UI/language files listed above
- Test: settings data-access and native-feature specs

- [ ] **Step 1: Write failing settings tests**

Add expectations that `GlobalSettingsEntityMapper.from` maps missing `creditCardSurchargePercent` to `0` and persisted `3.5` to `3.5`. Add service tests or extend existing mocks so `GlobalSettingsService.updateSettings` writes `creditCardSurchargePercent`.

Run:

```bash
yarn nx test settings-data-access --testFile=libs/settings/data-access/src/lib/slices/settings.slice.spec.ts
```

Expected: fail because DTO does not contain the new property.

- [ ] **Step 2: Implement DTO and service**

Add `creditCardSurchargePercent: number` to `GlobalSettingsDTO`. In `GlobalSettingsEntityMapper.from`, return `creditCardSurchargePercent: p.creditCardSurchargePercent ?? 0`. In `GlobalSettingsService.updateSettings`, write `updated.creditCardSurchargePercent = Number.isFinite(newSettings.creditCardSurchargePercent) ? newSettings.creditCardSurchargePercent : 0` and include the same field when creating a new model.

- [ ] **Step 3: Add UI tests**

In `settings.spec.tsx`, include `creditCardSurchargePercent: 0` in mock settings. Add one test that changes `settings-card-surcharge-input` to `3.5`, presses `settings-save-card-surcharge-button`, and expects the update payload to include the existing settings plus `creditCardSurchargePercent: 3.5`. Add one invalid value test for `-1` expecting an alert and no dispatch.

- [ ] **Step 4: Implement UI**

In `settings.tsx`, mirror the tax input pattern:

```ts
const [cardSurchargeInput, setCardSurchargeInput] = React.useState(
  String(settings.globalSettings?.creditCardSurchargePercent ?? 0)
);
```

Add a save function validating `0 <= value <= 100`, then dispatch `updateGlobalSettings({ ...settings.globalSettings, creditCardSurchargePercent: parsed })`. Add labels and test IDs:

- `settings-card-surcharge-input`
- `settings-save-card-surcharge-button`

- [ ] **Step 5: Run tests**

Run:

```bash
yarn nx test settings-data-access --testFile=libs/settings/data-access/src/lib/slices/settings.slice.spec.ts
yarn nx test settings-native-feature --testFile=libs/settings/native-feature/src/lib/components/settings/settings.spec.tsx
```

Expected: pass.

- [ ] **Step 6: Commit**

Run:

```bash
git add libs/settings
git commit -m "feat: add global credit card surcharge setting"
```

## Task 4: Extend Payment Snapshot Models

**Files:**
- Modify generated/shared API and model copies listed in File Structure

- [ ] **Step 1: Add optional payment fields**

Add optional Float fields to the embedded `Payment` type in both shared and app model schema files:

```ts
baseAmount?: number | null;
surchargeRate?: number | null;
surchargeAmount?: number | null;
```

The DataStore schema entries must mark all three fields as non-required Float attributes.

- [ ] **Step 2: Update GraphQL/API type copies**

Update `PaymentInput` and `Payment` in both API type files. Update order query/mutation/subscription payment selections to include:

```graphql
baseAmount
surchargeRate
surchargeAmount
```

- [ ] **Step 3: Typecheck generated consumers**

Run:

```bash
yarn nx test orders-data-access --testFile=libs/orders/data-access/src/lib/order.entity.spec.ts
```

Expected: existing tests still compile; test behavior may not cover the new fields yet.

- [ ] **Step 4: Commit**

Run:

```bash
git add libs/shared apps/mobile-ui/src
git commit -m "feat: extend payment surcharge snapshots"
```

## Task 5: Payment Screen Calculation

**Files:**
- Modify: `libs/sales/native-feature/src/lib/components/cart-payment/cart-payment.tsx`
- Modify: `libs/sales/native-feature/src/lib/components/cart-payment/cart-payment-dialog.tsx`
- Modify: `libs/sales/native-feature/src/lib/components/cart/cart.tsx`
- Test: `libs/sales/native-feature/src/lib/components/cart-payment/cart-payment.spec.tsx`

- [ ] **Step 1: Write failing payment tests**

Add tests that render `CartPayment` with `creditCardSurchargePercent={3}`, activate card for a `$100` card-only sale, and expect:

```ts
expect(getByText('Credit Card Surcharge')).toBeTruthy();
expect(getByText('$ 3.00')).toBeTruthy();
expect(getByText('Charge to card')).toBeTruthy();
expect(getByText('$ 103.00')).toBeTruthy();
```

Submit and expect:

```ts
expect(onPaymentEntered).toHaveBeenCalledWith([
  { type: 'CC', amount: 100, baseAmount: 100, surchargeRate: 3, surchargeAmount: 3 },
]);
```

Add split tender test for `$40` cash plus `$60` card at `3%`, expecting cash unchanged and card surcharge `1.8`.

- [ ] **Step 2: Implement props and display**

Add `creditCardSurchargePercent?: number` to `CartPaymentProps`. Calculate the active card surcharge from watched `cc` value. Display a compact summary row only when CC is active and surcharge is greater than zero:

- `Credit Card Surcharge`
- `Charge to card`

Keep existing exact-payment validation based on sale portions, not surcharge-inclusive collected amount.

- [ ] **Step 3: Emit enriched payments**

In `completeOrder`, after building base tender rows and validating totals, call:

```ts
onPaymentEntered(enrichCreditCardPaymentsWithSurcharge(result, creditCardSurchargePercent));
```

- [ ] **Step 4: Pass setting from cart**

In `cart.tsx`, select global settings if not already available and pass `settings.globalSettings?.creditCardSurchargePercent ?? 0` to `CartPaymentDialog`. Pass the prop through `CartPaymentDialog` to `CartPayment`.

- [ ] **Step 5: Run tests and commit**

Run:

```bash
yarn nx test sales-native-feature --testFile=libs/sales/native-feature/src/lib/components/cart-payment/cart-payment.spec.tsx
yarn nx test sales-native-feature --testFile=libs/sales/native-feature/src/lib/components/cart/cart.spec.tsx
```

Commit:

```bash
git add libs/sales
git commit -m "feat: show credit card surcharge at payment"
```

## Task 6: Persist And Restore Surcharge Payment Snapshots

**Files:**
- Modify: `libs/orders/data-access/src/lib/order.entity.ts`
- Modify: `libs/orders/data-access/src/lib/order.service.ts`
- Test: `libs/orders/data-access/src/lib/order.entity.spec.ts`
- Test: `libs/orders/data-access/src/lib/order.service.spec.ts`

- [ ] **Step 1: Write failing mapper tests**

Add tests asserting `OrderEntityMapper.fromModel` maps `baseAmount`, `surchargeRate`, and `surchargeAmount` from `paymentInfo.payments`, and `asCartState` preserves them where payments are restored.

- [ ] **Step 2: Implement payment entity fields**

Extend `PaymentEntity` with:

```ts
baseAmount?: number | null;
surchargeRate?: number | null;
surchargeAmount?: number | null;
```

Update `fromPayment` and payment restoration mapping to preserve the optional fields with `?? null`.

- [ ] **Step 3: Write failing persistence tests**

In `order.service.spec.ts`, add tests for `createPaidOrder` and `closeExistingOrder` where request payments contain `CC` surcharge fields. Expect saved `new Payment({ type: 'CC', amount: 60, baseAmount: 60, surchargeRate: 3, surchargeAmount: 1.8 })`.

- [ ] **Step 4: Implement persistence**

In both `createPaidOrder` and `closeExistingOrder`, include optional surcharge fields when creating `Payment` models.

- [ ] **Step 5: Run tests and commit**

Run:

```bash
yarn nx test orders-data-access --testFile=libs/orders/data-access/src/lib/order.entity.spec.ts
yarn nx test orders-data-access --testFile=libs/orders/data-access/src/lib/order.service.spec.ts
```

Commit:

```bash
git add libs/orders/data-access
git commit -m "feat: persist credit card surcharge snapshots"
```

## Task 7: Add Receipt Surcharge Rows

**Files:**
- Modify: `libs/orders/data-access/src/lib/order.service.ts`
- Test: `libs/printings/data-access/src/lib/printing.service.spec.ts`
- Test: `libs/orders/data-access/src/lib/order.service.spec.ts`

- [ ] **Step 1: Write failing receipt tests**

Add receipt preview test with payment rows containing `{ type: 'CC', amount: 60, surchargeAmount: 1.8 }`. Expect receipt text to contain:

```ts
expect(receiptText).toContain('CC: $ 60.00');
expect(receiptText).toContain('Credit Card Surcharge: $ 1.80');
```

Use existing `getReceiptPaymentsText` formatting so alignment remains the same as current payment rows.

- [ ] **Step 2: Implement ticket payment rows**

In `buildTicketPaymentRows`, when a positive CC payment has `surchargeAmount > 0`, push the base payment row first, then:

```ts
{ kind: 'payment', label: 'Credit Card Surcharge', amount: surchargeAmount }
```

For legacy payments, use `amount` as the base row and no surcharge row.

- [ ] **Step 3: Run tests and commit**

Run:

```bash
yarn nx test printings-data-access --testFile=libs/printings/data-access/src/lib/printing.service.spec.ts
yarn nx test orders-data-access --testFile=libs/orders/data-access/src/lib/order.service.spec.ts
```

Commit:

```bash
git add libs/orders/data-access libs/printings/data-access
git commit -m "feat: print credit card surcharge on receipts"
```

## Task 8: Report Processing Fee Recovery Separately

**Files:**
- Modify: `libs/reporting/data-access/src/lib/report-aggregations.ts`
- Modify: `libs/reporting/native-feature/src/lib/components/end-of-day/end-of-day.service.ts`
- Modify: `libs/reporting/native-feature/src/lib/components/end-of-day/end-of-day.tsx`
- Test: corresponding reporting specs

- [ ] **Step 1: Write failing payment summary tests**

In `report-aggregations.spec.ts`, use a paid order with `CC amount: 60, surchargeAmount: 1.8` and `CASH amount: 40`. Expect `buildPaymentSummaryRows` to include card sales as `60` and processing fee recovery as `1.8`, not `61.8`.

- [ ] **Step 2: Implement aggregation**

Add helper:

```ts
const getPaymentSurchargeRecovery = (payment: { surchargeAmount?: number | null }) =>
  round(Number(payment.surchargeAmount || 0));
```

When aggregating payment rows, keep `CC` at base amount and add a separate label such as `Processing Fee Recovery`.

- [ ] **Step 3: Write and implement end-of-day tests**

Update end-of-day service summary to track `processingFeeRecovery`. End-of-day widgets should show this value separately from `Credit Card`.

- [ ] **Step 4: Run tests and commit**

Run:

```bash
yarn nx test reporting-data-access --testFile=libs/reporting/data-access/src/lib/report-aggregations.spec.ts
yarn nx test reporting-native-feature --testFile=libs/reporting/native-feature/src/lib/components/end-of-day/end-of-day.service.spec.ts
yarn nx test reporting-native-feature --testFile=libs/reporting/native-feature/src/lib/components/end-of-day/end-of-day.spec.tsx
```

Commit:

```bash
git add libs/reporting
git commit -m "feat: report card surcharge recovery separately"
```

## Task 9: Integration Verification

**Files:**
- No source edits expected unless tests expose an implementation gap

- [ ] **Step 1: Run focused suites**

Run:

```bash
yarn nx test settings-data-access
yarn nx test settings-native-feature
yarn nx test sales-data-access
yarn nx test sales-native-feature
yarn nx test orders-data-access
yarn nx test printings-data-access
yarn nx test reporting-data-access
yarn nx test reporting-native-feature
```

Expected: all pass.

- [ ] **Step 2: Run release-critical coverage if available**

Run:

```bash
node tools/run-critical-tests.js
```

Expected: command completes successfully. If it fails for unrelated existing reasons, capture the failing suite and rerun the focused surcharge suites to isolate regression risk.

- [ ] **Step 3: Final status**

Run:

```bash
git status --short --branch
git log --oneline -8
```

Expected: on `v2.1.5`; committed surcharge implementation commits are visible; only intentionally untracked client docs remain.

## Self-Review

- Spec coverage: configuration, payment screen display, credit-card-only calculation, split tender, persistence, receipt rows, reporting separation, backward compatibility, and refund non-automation are represented by tasks.
- Placeholder scan: no task uses placeholder markers or an undefined implementation handwave.
- Type consistency: payment snapshot fields are consistently named `baseAmount`, `surchargeRate`, and `surchargeAmount`; global setting is consistently named `creditCardSurchargePercent`.
