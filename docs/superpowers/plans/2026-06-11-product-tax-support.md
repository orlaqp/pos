# Product Tax Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add global percentage tax settings, per-product taxable flags, after-discount tax calculation, and tax-aware reports on branch `2.1.4`.

**Architecture:** Extend the existing Amplify/DataStore models and local DTO/entity mappers instead of adding a new tax subsystem. Keep tax calculation inside `PricingEngine.preview`, then persist order and line tax snapshots so reports never recompute historical tax from current settings.

**Tech Stack:** Nx, TypeScript, React Native, Redux Toolkit, AWS Amplify DataStore, Jest, React Hook Form.

---

## File Map

- `apps/mobile-ui/amplify/backend/api/pos/schema.graphql`: add `GlobalSettings.taxValue` and `Product.taxable`.
- `apps/mobile-ui/src/API.ts`, `apps/mobile-ui/src/graphql/*`, `apps/mobile-ui/src/models/*`, `libs/shared/models/src/models/*`, `libs/shared/api/src/*`: generated schema/API/model outputs after local Amplify codegen.
- `libs/settings/data-access/src/lib/global-settings.dto.ts`: carry `taxValue` through settings mapping.
- `libs/settings/data-access/src/lib/services/global-settings.service.ts`: save and create global settings with `taxValue`.
- `libs/settings/data-access/src/lib/slices/settings.slice.spec.ts`: settings state regression coverage.
- `libs/settings/native-feature/src/lib/components/settings/settings.tsx`: add tax percentage input and validation.
- `libs/settings/native-feature/src/lib/components/settings/settings.spec.tsx`: settings UI coverage for tax input.
- `libs/products/data-access/src/lib/product.entity.ts`: add `taxable` with missing-as-false mapping.
- `libs/products/data-access/src/lib/product.service.ts`: persist `taxable` for create/update.
- `libs/products/data-access/src/lib/product.service.spec.ts`, `libs/products/data-access/src/lib/product.entity.spec.ts`: product data tests.
- `libs/products/native-feature/src/lib/components/product-form/product-form.tsx`: add product tax toggle.
- `libs/products/native-feature/src/lib/components/product-form/product-form.spec.tsx`: product form tests.
- `libs/sales/data-access/src/lib/cart-entity.ts`: add `taxable` to cart products and mapper.
- `libs/sales/data-access/src/lib/slices/cart.slice.ts`: pass `taxable` and `taxRate` into pricing.
- `libs/sales/data-access/src/lib/slices/cart.slice.spec.ts`: cart tax behavior tests.
- `libs/discounts/domain/src/lib/types.ts`: add `taxable` and `taxRate` pricing input fields plus line tax output if missing.
- `libs/discounts/domain/src/lib/pricing-engine.ts`: calculate tax per taxable line after discounts.
- `libs/discounts/domain/src/lib/pricing-engine.spec.ts`: pricing engine tax tests.
- `libs/orders/data-access/src/lib/order.entity.ts`: preserve tax and taxable snapshots in order/cart mapping and refund rebuilds.
- `libs/orders/data-access/src/lib/order.entity.spec.ts`: order mapping tests.
- `libs/reporting/data-access/src/lib/report-aggregations.ts`: add helpers for tax-aware reporting aggregations.
- `libs/reporting/data-access/src/lib/report-aggregations.spec.ts`: reporting aggregation tests.
- `libs/reporting/native-feature/src/lib/components/sales/sales.tsx`: add Sale List tax column.
- `libs/reporting/native-feature/src/lib/components/sales/sales.spec.tsx`: Sale List test coverage.
- `libs/reporting/native-feature/src/lib/components/end-of-day/end-of-day.service.ts`: include tax summary support.
- `libs/reporting/native-feature/src/lib/components/end-of-day/end-of-day.service.spec.ts`: End of Day tax tests.
- `libs/reporting/native-feature/src/lib/components/end-of-day/order-line-details.tsx`: show line tax in details where totals are shown.
- `libs/reporting/native-feature/src/lib/components/end-of-day/order-line-details.spec.tsx`: line detail tax rendering tests.
- `libs/settings/data-access/src/lib/language/en.json`, `libs/settings/data-access/src/lib/language/es.json`: add labels for tax settings and product toggle.

---

### Task 1: Schema And Generated Model Baseline

**Files:**
- Modify: `apps/mobile-ui/amplify/backend/api/pos/schema.graphql`
- Modify after codegen: `apps/mobile-ui/src/API.ts`
- Modify after codegen: `apps/mobile-ui/src/graphql/mutations.ts`
- Modify after codegen: `apps/mobile-ui/src/graphql/queries.ts`
- Modify after codegen: `apps/mobile-ui/src/graphql/subscriptions.ts`
- Modify after codegen: `apps/mobile-ui/src/models/index.d.ts`
- Modify after codegen: `apps/mobile-ui/src/models/schema.d.ts`
- Modify after codegen: `apps/mobile-ui/src/models/schema.js`
- Modify after sync: `libs/shared/models/src/models/index.d.ts`
- Modify after sync: `libs/shared/models/src/models/schema.d.ts`
- Modify after sync: `libs/shared/models/src/models/schema.js`

- [ ] **Step 1: Update GraphQL schema**

In `GlobalSettings`, add:

```graphql
taxValue: Float @default(value: "0")
```

In `Product`, add:

```graphql
taxable: Boolean @default(value: "false")
```

- [ ] **Step 2: Run local codegen**

Run:

```bash
yarn update-amplify-local
```

Expected: command exits `0` and updates generated API/model files.

- [ ] **Step 3: Verify generated files include the fields**

Run:

```bash
rg "taxValue|taxable" apps/mobile-ui/src/API.ts apps/mobile-ui/src/models libs/shared/models/src/models
```

Expected: matches for `GlobalSettings.taxValue` and `Product.taxable`.

- [ ] **Step 4: Commit**

Run:

```bash
git add apps/mobile-ui/amplify/backend/api/pos/schema.graphql apps/mobile-ui/src/API.ts apps/mobile-ui/src/graphql apps/mobile-ui/src/models libs/shared/models/src/models
git commit -m "feat: add tax fields to generated models"
```

Expected: commit succeeds on branch `2.1.4`.

---

### Task 2: Global Tax Setting Data Flow

**Files:**
- Modify: `libs/settings/data-access/src/lib/global-settings.dto.ts`
- Modify: `libs/settings/data-access/src/lib/services/global-settings.service.ts`
- Modify: `libs/settings/data-access/src/lib/slices/settings.slice.spec.ts`

- [ ] **Step 1: Write failing settings tests**

Add cases in `settings.slice.spec.ts` and `global-settings.service.spec.ts` if service mocks already exist. The core expectations:

```ts
expect(GlobalSettingsEntityMapper.from({
  id: 'settings-1',
  enforceSalesBasedOnInventory: false,
  timezone: 'America/New_York',
  taxValue: undefined,
} as any)).toEqual(expect.objectContaining({ taxValue: 0 }));

state = settingsReducer(
  state,
  settingsActions.setGlobalSettings({ id: 'settings-1', enforceSalesBasedOnInventory: false, taxValue: 8.25 } as any)
);
expect(state.globalSettings).toEqual(expect.objectContaining({ taxValue: 8.25 }));
```

- [ ] **Step 2: Run failing tests**

Run:

```bash
yarn nx test settings-data-access --runTestsByPath libs/settings/data-access/src/lib/slices/settings.slice.spec.ts
```

Expected: fails because `taxValue` is not mapped.

- [ ] **Step 3: Implement DTO mapping**

Update `GlobalSettingsDTO`:

```ts
export type GlobalSettingsDTO = {
    id: string;
    enforceSalesBasedOnInventory: boolean;
    taxValue: number;
    timezone?: string;
    createdAt?: string | null;
    updatedAt?: string | null;
}
```

Update mapper return:

```ts
taxValue: p.taxValue ?? 0,
```

- [ ] **Step 4: Implement service persistence**

In `GlobalSettingsService.updateSettings`, update existing settings with:

```ts
updated.taxValue = Number.isFinite(newSettings.taxValue)
    ? newSettings.taxValue
    : 0;
```

When creating settings, include:

```ts
taxValue: Number.isFinite(newSettings.taxValue) ? newSettings.taxValue : 0,
```

- [ ] **Step 5: Run tests**

Run:

```bash
yarn nx test settings-data-access --runTestsByPath libs/settings/data-access/src/lib/slices/settings.slice.spec.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

Run:

```bash
git add libs/settings/data-access/src/lib/global-settings.dto.ts libs/settings/data-access/src/lib/services/global-settings.service.ts libs/settings/data-access/src/lib/slices/settings.slice.spec.ts
git commit -m "feat: persist global tax setting"
```

Expected: commit succeeds.

---

### Task 3: Settings UI Tax Percentage Input

**Files:**
- Modify: `libs/settings/native-feature/src/lib/components/settings/settings.tsx`
- Modify: `libs/settings/native-feature/src/lib/components/settings/settings.spec.tsx`
- Modify: `libs/settings/data-access/src/lib/language/en.json`
- Modify: `libs/settings/data-access/src/lib/language/es.json`

- [ ] **Step 1: Write failing UI tests**

In `settings.spec.tsx`, add coverage that renders an input labeled tax percentage, changes it to `8.25`, and dispatches `updateGlobalSettings` with `taxValue: 8.25`. Add a validation test that negative input does not save.

- [ ] **Step 2: Run failing tests**

Run:

```bash
yarn nx test settings-native-feature --runTestsByPath libs/settings/native-feature/src/lib/components/settings/settings.spec.tsx
```

Expected: fails because no tax input exists.

- [ ] **Step 3: Add translations**

Add English keys:

```json
"SETTINGS_TaxPercentage": "Tax percentage",
"SETTINGS_TaxPercentageInvalid": "Enter a tax percentage from 0 to 100"
```

Add Spanish keys:

```json
"SETTINGS_TaxPercentage": "Porcentaje de impuesto",
"SETTINGS_TaxPercentageInvalid": "Ingresa un porcentaje de impuesto entre 0 y 100"
```

- [ ] **Step 4: Add local input state and validation**

In `Settings`, derive:

```ts
const [taxInput, setTaxInput] = React.useState(
    String(settings.globalSettings?.taxValue ?? 0)
);

React.useEffect(() => {
    setTaxInput(String(settings.globalSettings?.taxValue ?? 0));
}, [settings.globalSettings?.taxValue]);

const saveTaxValue = () => {
    if (!settings.globalSettings) return;
    const parsed = Number(taxInput || 0);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
        Alert.alert(
            translate('COMMON_InvalidValue'),
            translate('SETTINGS_TaxPercentageInvalid')
        );
        return;
    }
    dispatch(updateGlobalSettings({
        ...settings.globalSettings,
        taxValue: parsed,
    }));
};
```

Use the repo’s existing input component if present in settings UI; otherwise use `TextInput` with `keyboardType="decimal-pad"`, `testID="settings-tax-percentage-input"`, and a small save button `testID="settings-tax-percentage-save"`.

- [ ] **Step 5: Run tests**

Run:

```bash
yarn nx test settings-native-feature --runTestsByPath libs/settings/native-feature/src/lib/components/settings/settings.spec.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit**

Run:

```bash
git add libs/settings/native-feature/src/lib/components/settings/settings.tsx libs/settings/native-feature/src/lib/components/settings/settings.spec.tsx libs/settings/data-access/src/lib/language/en.json libs/settings/data-access/src/lib/language/es.json
git commit -m "feat: add tax percentage setting"
```

Expected: commit succeeds.

---

### Task 4: Product Taxable Data Flow And Form Toggle

**Files:**
- Modify: `libs/products/data-access/src/lib/product.entity.ts`
- Modify: `libs/products/data-access/src/lib/product.service.ts`
- Modify: `libs/products/data-access/src/lib/product.entity.spec.ts`
- Modify: `libs/products/data-access/src/lib/product.service.spec.ts`
- Modify: `libs/products/native-feature/src/lib/components/product-form/product-form.tsx`
- Modify: `libs/products/native-feature/src/lib/components/product-form/product-form.spec.tsx`
- Modify: `libs/settings/data-access/src/lib/language/en.json`
- Modify: `libs/settings/data-access/src/lib/language/es.json`

- [ ] **Step 1: Write failing product entity tests**

Add expectations:

```ts
expect(ProductEntityMapper.fromProduct({ taxable: true } as any)).toEqual(
  expect.objectContaining({ taxable: true })
);
expect(ProductEntityMapper.fromProduct({ taxable: undefined } as any)).toEqual(
  expect.objectContaining({ taxable: false })
);
```

- [ ] **Step 2: Write failing service/form tests**

Assert product create/update passes `taxable ?? false`, and product form renders `product-taxable-switch` with default `false`.

- [ ] **Step 3: Run failing tests**

Run:

```bash
yarn nx test products-data-access --runTestsByPath libs/products/data-access/src/lib/product.entity.spec.ts libs/products/data-access/src/lib/product.service.spec.ts
yarn nx test products-native-feature --runTestsByPath libs/products/native-feature/src/lib/components/product-form/product-form.spec.tsx
```

Expected: fails because `taxable` is missing.

- [ ] **Step 4: Implement product entity and service**

Add to `ProductEntity`:

```ts
taxable?: boolean | null | undefined;
```

Map from model:

```ts
taxable: p.taxable ?? false,
```

In product create normalization:

```ts
taxable: product.taxable ?? false,
```

In update copy:

```ts
updated.taxable = product.taxable ?? false;
```

- [ ] **Step 5: Implement form toggle**

Add default value:

```ts
taxable: product?.taxable ?? false,
```

Add toggle near EBT:

```tsx
<View style={styles.toggleItem}>
    <Text style={styles.toggleLabel}>
        {t('PRODUCT_TaxableLabel', 'Apply tax')}
    </Text>
    <View style={styles.toggleSwitchWrap}>
        <UISwitch name="taxable" testID="product-taxable-switch" />
    </View>
</View>
```

Add translations:

```json
"PRODUCT_TaxableLabel": "Apply tax"
```

```json
"PRODUCT_TaxableLabel": "Aplicar impuesto"
```

- [ ] **Step 6: Run tests**

Run:

```bash
yarn nx test products-data-access --runTestsByPath libs/products/data-access/src/lib/product.entity.spec.ts libs/products/data-access/src/lib/product.service.spec.ts
yarn nx test products-native-feature --runTestsByPath libs/products/native-feature/src/lib/components/product-form/product-form.spec.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit**

Run:

```bash
git add libs/products/data-access/src/lib/product.entity.ts libs/products/data-access/src/lib/product.service.ts libs/products/data-access/src/lib/product.entity.spec.ts libs/products/data-access/src/lib/product.service.spec.ts libs/products/native-feature/src/lib/components/product-form/product-form.tsx libs/products/native-feature/src/lib/components/product-form/product-form.spec.tsx libs/settings/data-access/src/lib/language/en.json libs/settings/data-access/src/lib/language/es.json
git commit -m "feat: add product taxable flag"
```

Expected: commit succeeds.

---

### Task 5: Pricing Engine Tax Calculation

**Files:**
- Modify: `libs/discounts/domain/src/lib/types.ts`
- Modify: `libs/discounts/domain/src/lib/pricing-engine.ts`
- Modify: `libs/discounts/domain/src/lib/pricing-engine.spec.ts`

- [ ] **Step 1: Write failing pricing tests**

Add tests:

```ts
it('taxes only taxable lines after discounts', () => {
  const result = PricingEngine.preview({
    taxRate: 0.1,
    employee: { employeeId: 'e1', employeeName: 'Employee' },
    definitions: [{
      id: 'auto-20',
      name: '20% off',
      status: 'ACTIVE',
      type: 'AUTOMATIC',
      method: 'PERCENT',
      scope: 'LINE',
      value: 20,
      stackMode: 'BEST_PRICE_ONLY',
      active: true,
    }],
    lines: [
      { lineId: 'taxable', productId: 'p1', productName: 'Taxable', quantity: 1, baseUnitPrice: 10, unitOfMeasure: 'EA', taxable: true },
      { lineId: 'not-taxable', productId: 'p2', productName: 'No Tax', quantity: 1, baseUnitPrice: 10, unitOfMeasure: 'EA', taxable: false },
    ],
    manualDiscounts: [],
    priceOverrides: [],
    promoCodes: [],
    approvalEvents: [],
  });

  expect(result.order.subtotal).toBe(16);
  expect(result.order.tax).toBe(0.8);
  expect(result.order.total).toBe(16.8);
  expect(result.order.lines.find((line) => line.lineId === 'taxable')?.tax).toBe(0.8);
  expect(result.order.lines.find((line) => line.lineId === 'not-taxable')?.tax).toBe(0);
});
```

- [ ] **Step 2: Run failing tests**

Run:

```bash
yarn nx test discounts-domain --runTestsByPath libs/discounts/domain/src/lib/pricing-engine.spec.ts
```

Expected: fails because `taxable` and line `tax` are missing or ignored.

- [ ] **Step 3: Update pricing types**

Add to `PricingCartLineInput`:

```ts
taxable?: boolean | null;
```

Add to `PricingLineResult` if missing:

```ts
tax: number;
taxable?: boolean | null;
```

Ensure `PricingCartInput` includes:

```ts
taxRate?: number | null;
```

- [ ] **Step 4: Implement line tax**

In the order line initial result, include:

```ts
tax: 0,
taxable: line.taxable ?? false,
```

Replace the tax loop with:

```ts
const taxRate = input.taxRate || 0;
orderLines.forEach((line) => {
  const allocated = roundCurrency(allocations[line.lineId] || 0);
  line.allocatedOrderDiscountTotal = allocated;
  line.lineTotalBeforeTax = roundCurrency(line.lineSubtotalBeforeOrderDiscount - allocated);
  line.tax = line.taxable ? roundCurrency(line.lineTotalBeforeTax * taxRate) : 0;
  line.lineTotalAfterTax = roundCurrency(line.lineTotalBeforeTax + line.tax);
});
```

- [ ] **Step 5: Run tests**

Run:

```bash
yarn nx test discounts-domain --runTestsByPath libs/discounts/domain/src/lib/pricing-engine.spec.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

Run:

```bash
git add libs/discounts/domain/src/lib/types.ts libs/discounts/domain/src/lib/pricing-engine.ts libs/discounts/domain/src/lib/pricing-engine.spec.ts
git commit -m "feat: calculate tax after discounts"
```

Expected: commit succeeds.

---

### Task 6: Cart Tax Rate Integration

**Files:**
- Modify: `libs/sales/data-access/src/lib/cart-entity.ts`
- Modify: `libs/sales/data-access/src/lib/slices/cart.slice.ts`
- Modify: `libs/sales/data-access/src/lib/slices/cart.slice.spec.ts`

- [ ] **Step 1: Write failing cart tests**

Add a test that sets `state.pricingContext.taxRate = 0.1` or the chosen cart-level field, upserts one taxable and one non-taxable item, and expects footer `tax` to include only taxable lines.

- [ ] **Step 2: Run failing tests**

Run:

```bash
yarn nx test sales-data-access --runTestsByPath libs/sales/data-access/src/lib/slices/cart.slice.spec.ts
```

Expected: fails because the cart cannot carry tax rate or taxable status.

- [ ] **Step 3: Add cart fields**

Add to `CartProduct`:

```ts
taxable?: boolean | null;
```

Add to `ProductLike` and mapper:

```ts
taxable?: Product['taxable'];
taxable: p.taxable ?? false,
```

Add to `CartPricingContext`:

```ts
taxRate?: number | null;
```

- [ ] **Step 4: Pass tax into pricing**

In `updateTotals`, pass:

```ts
taxRate: state.pricingContext?.taxRate ?? 0,
```

For each line, pass:

```ts
taxable: item.product.taxable ?? false,
```

- [ ] **Step 5: Run tests**

Run:

```bash
yarn nx test sales-data-access --runTestsByPath libs/sales/data-access/src/lib/slices/cart.slice.spec.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

Run:

```bash
git add libs/sales/data-access/src/lib/cart-entity.ts libs/sales/data-access/src/lib/slices/cart.slice.ts libs/sales/data-access/src/lib/slices/cart.slice.spec.ts
git commit -m "feat: pass tax settings into cart pricing"
```

Expected: commit succeeds.

---

### Task 7: Wire Settings Tax Into Sales Screen

**Files:**
- Modify: `libs/sales/native-feature/src/lib/components/sales-screen/sales-screen.tsx`
- Modify: `libs/sales/native-feature/src/lib/components/sales-screen/sales-screen.spec.tsx`

- [ ] **Step 1: Write failing sales screen test**

Mock global settings with `taxValue: 10`, add a taxable product to cart, and assert the cart receives pricing context with `taxRate: 0.1`.

- [ ] **Step 2: Run failing test**

Run:

```bash
yarn nx test sales-native-feature --runTestsByPath libs/sales/native-feature/src/lib/components/sales-screen/sales-screen.spec.tsx
```

Expected: fails because sales screen does not set tax rate from global settings.

- [ ] **Step 3: Implement tax context dispatch**

Use `getGlobalSettings` selector from `@pos/settings/data-access`, then convert percent to decimal:

```ts
const taxRate = Math.max(0, Number(globalSettings?.taxValue || 0)) / 100;
dispatch(cartActions.setPricingContext({
    ...cart.pricingContext,
    timezone: globalSettings?.timezone,
    taxRate,
}));
```

Keep existing timezone/store/station context intact when present.

- [ ] **Step 4: Run test**

Run:

```bash
yarn nx test sales-native-feature --runTestsByPath libs/sales/native-feature/src/lib/components/sales-screen/sales-screen.spec.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add libs/sales/native-feature/src/lib/components/sales-screen/sales-screen.tsx libs/sales/native-feature/src/lib/components/sales-screen/sales-screen.spec.tsx
git commit -m "feat: apply global tax rate to sales cart"
```

Expected: commit succeeds.

---

### Task 8: Order Persistence And Refund Cart Tax Snapshots

**Files:**
- Modify: `libs/orders/data-access/src/lib/order.entity.ts`
- Modify: `libs/orders/data-access/src/lib/order.entity.spec.ts`
- Modify as needed: `libs/sales/data-access/src/lib/slices/cart.slice.ts`

- [ ] **Step 1: Write failing order mapping tests**

Add tests asserting:

```ts
expect(OrderEntityMapper.fromLine({ tax: 0.8, taxable: true } as any)).toEqual(
  expect.objectContaining({ tax: 0.8, taxable: true })
);
```

Add a refund rebuild test where original line has `tax: 0.8`, quantity `2`, refunded quantity `1`, and expected rebuilt cart tax is `0.4`.

- [ ] **Step 2: Run failing tests**

Run:

```bash
yarn nx test orders-data-access --runTestsByPath libs/orders/data-access/src/lib/order.entity.spec.ts
```

Expected: fails because `fromLine` currently sets `tax: 0` and taxable is not preserved.

- [ ] **Step 3: Preserve line tax and taxable**

In `OrderLineEntity`, add:

```ts
taxable?: boolean | null;
```

In `fromLine`:

```ts
tax: l.tax ?? 0,
taxable: l.taxable ?? false,
```

In `asCartState` and `fromRefundedCart`, carry:

```ts
taxable: i.taxable ?? false,
```

- [ ] **Step 4: Rebuild refunded tax proportionally**

In `fromRefundedCart`, compute tax from rebuilt summary and original line tax by active quantity ratio:

```ts
const tax = OrderEntityMapper.roundMoney(
  state.items.reduce((sum, item) => {
    const originalLine = cart.items.find((source) => source.identifier === item.identifier);
    const originalQuantity = Number(originalLine?.quantity || 0);
    const originalTax = Number(
      cart.appliedDiscountSummary?.lineSummaries.find((line) => line.lineId === item.identifier)?.tax || 0
    );
    if (originalQuantity <= 0) return sum;
    return sum + originalTax * (item.quantity / originalQuantity);
  }, 0)
);
```

If the summary lacks line tax, fall back to `cart.footer.tax` prorated by subtotal ratio.

- [ ] **Step 5: Run tests**

Run:

```bash
yarn nx test orders-data-access --runTestsByPath libs/orders/data-access/src/lib/order.entity.spec.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

Run:

```bash
git add libs/orders/data-access/src/lib/order.entity.ts libs/orders/data-access/src/lib/order.entity.spec.ts libs/sales/data-access/src/lib/slices/cart.slice.ts
git commit -m "feat: preserve tax snapshots on orders"
```

Expected: commit succeeds.

---

### Task 9: Tax-Aware Reporting Aggregations

**Files:**
- Modify: `libs/reporting/data-access/src/lib/report-aggregations.ts`
- Modify: `libs/reporting/data-access/src/lib/report-aggregations.spec.ts`
- Modify: `libs/reporting/native-feature/src/lib/components/end-of-day/end-of-day.service.ts`
- Modify: `libs/reporting/native-feature/src/lib/components/end-of-day/end-of-day.service.spec.ts`

- [ ] **Step 1: Write failing aggregation tests**

Add tests for:

```ts
expect(buildTaxSummaryRows([paidOrderWithTax], [])).toEqual([
  { label: 'Tax', amount: 0.8 }
]);
```

Add a partially refunded order case where original order tax is `1.60`, half quantity is refunded, and tax summary returns `0.80`.

- [ ] **Step 2: Run failing tests**

Run:

```bash
yarn nx test reporting-data-access --runTestsByPath libs/reporting/data-access/src/lib/report-aggregations.spec.ts
yarn nx test reporting-native-feature --runTestsByPath libs/reporting/native-feature/src/lib/components/end-of-day/end-of-day.service.spec.ts
```

Expected: fails because tax summary helpers do not exist.

- [ ] **Step 3: Add tax helpers**

Add exported helpers:

```ts
export const getOrderNetTax = (
    order: Order,
    refundedAmountsByOrderId: Record<string, number>
) => {
    const total = Number(order.total || 0);
    const tax = Number(order.tax || 0);
    if (total <= 0 || tax <= 0) return 0;
    return round(tax * getOrderNetRatio(order, refundedAmountsByOrderId));
};

export const buildTaxSummaryRows = (
    orders: Order[],
    refunds: OrderRefund[] = []
) => {
    const refundedAmountsByOrderId = getRefundAmountByOrderId(refunds);
    const amount = orders.reduce(
        (sum, order) => sum + getOrderNetTax(order, refundedAmountsByOrderId),
        0
    );
    return [{ label: 'Tax', amount: round(amount) }];
};
```

- [ ] **Step 4: Add End of Day tax field**

Extend `EndOfDayReferenceSummary`:

```ts
tax: number;
```

When building reference summaries, compute tax from `buildTaxSummaryRows` and include it in returned summary rows.

- [ ] **Step 5: Run tests**

Run:

```bash
yarn nx test reporting-data-access --runTestsByPath libs/reporting/data-access/src/lib/report-aggregations.spec.ts
yarn nx test reporting-native-feature --runTestsByPath libs/reporting/native-feature/src/lib/components/end-of-day/end-of-day.service.spec.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

Run:

```bash
git add libs/reporting/data-access/src/lib/report-aggregations.ts libs/reporting/data-access/src/lib/report-aggregations.spec.ts libs/reporting/native-feature/src/lib/components/end-of-day/end-of-day.service.ts libs/reporting/native-feature/src/lib/components/end-of-day/end-of-day.service.spec.ts
git commit -m "feat: include tax in reporting summaries"
```

Expected: commit succeeds.

---

### Task 10: Report UI Tax Columns And Line Details

**Files:**
- Modify: `libs/reporting/native-feature/src/lib/components/sales/sales.tsx`
- Modify: `libs/reporting/native-feature/src/lib/components/sales/sales.spec.tsx`
- Modify: `libs/reporting/native-feature/src/lib/components/end-of-day/order-line-details.tsx`
- Modify: `libs/reporting/native-feature/src/lib/components/end-of-day/order-line-details.spec.tsx`
- Modify: `libs/settings/data-access/src/lib/language/en.json`
- Modify: `libs/settings/data-access/src/lib/language/es.json`

- [ ] **Step 1: Write failing UI tests**

In Sale List tests, assert headers include `Tax` and row tax is net of refunds:

```ts
expect(buildSalesRows([orderWithTax], [])).toEqual([
  expect.objectContaining({ tax: 0.8, amount: 10.8 })
]);
```

In order line details tests, assert rendered line details show tax for a line with `tax: 0.8`.

- [ ] **Step 2: Run failing tests**

Run:

```bash
yarn nx test reporting-native-feature --runTestsByPath libs/reporting/native-feature/src/lib/components/sales/sales.spec.tsx libs/reporting/native-feature/src/lib/components/end-of-day/order-line-details.spec.tsx
```

Expected: fails because no tax column/line display exists.

- [ ] **Step 3: Add Sale List tax row field and header**

In `buildSalesRows`, compute:

```ts
const refundRatio = Number(order.total || 0) > 0
    ? Math.max(0, Math.min(1, 1 - refundedAmount / Number(order.total || 0)))
    : 0;
const tax = roundCurrency(Number(order.tax || 0) * refundRatio);
```

Return `tax`. Add header:

```ts
{ label: t('REPORT_Header_Tax', 'Tax'), field: 'tax', width: 1, format: 'money', align: 'right', sum: true },
```

- [ ] **Step 4: Add line detail tax display**

Where line totals are displayed, include:

```tsx
<Text>{t('REPORT_LineTax', 'Tax')}: ${Number(line.tax || 0).toFixed(2)}</Text>
```

Use existing layout/text styles from the component.

- [ ] **Step 5: Add translations**

English:

```json
"REPORT_Header_Tax": "Tax",
"REPORT_LineTax": "Tax"
```

Spanish:

```json
"REPORT_Header_Tax": "Impuesto",
"REPORT_LineTax": "Impuesto"
```

- [ ] **Step 6: Run tests**

Run:

```bash
yarn nx test reporting-native-feature --runTestsByPath libs/reporting/native-feature/src/lib/components/sales/sales.spec.tsx libs/reporting/native-feature/src/lib/components/end-of-day/order-line-details.spec.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit**

Run:

```bash
git add libs/reporting/native-feature/src/lib/components/sales/sales.tsx libs/reporting/native-feature/src/lib/components/sales/sales.spec.tsx libs/reporting/native-feature/src/lib/components/end-of-day/order-line-details.tsx libs/reporting/native-feature/src/lib/components/end-of-day/order-line-details.spec.tsx libs/settings/data-access/src/lib/language/en.json libs/settings/data-access/src/lib/language/es.json
git commit -m "feat: show tax in sales reports"
```

Expected: commit succeeds.

---

### Task 11: Full Verification

**Files:**
- Verify all modified feature libraries.

- [ ] **Step 1: Run focused test suite**

Run:

```bash
yarn nx test discounts-domain
yarn nx test sales-data-access
yarn nx test sales-native-feature
yarn nx test products-data-access
yarn nx test products-native-feature
yarn nx test settings-data-access
yarn nx test settings-native-feature
yarn nx test orders-data-access
yarn nx test reporting-data-access
yarn nx test reporting-native-feature
```

Expected: all commands exit `0`.

- [ ] **Step 2: Run critical tests**

Run:

```bash
yarn test:critical
```

Expected: command exits `0`.

- [ ] **Step 3: Inspect generated and handwritten diff**

Run:

```bash
git status --short
git diff --stat
```

Expected: only intended product tax support files are changed.

- [ ] **Step 4: Final commit if verification changed snapshots or generated files**

Run:

```bash
git add .
git commit -m "test: verify product tax support"
```

Expected: either commit succeeds with verification-related updates or git reports there is nothing to commit.

---

## Self-Review

- Spec coverage: global percentage tax setting is handled in Tasks 1-3; product taxable flag in Task 4; after-discount pricing in Tasks 5-7; order snapshots/refunds in Task 8; reports in Tasks 9-10; verification in Task 11.
- Placeholder scan: no placeholder markers or intentionally vague implementation steps remain.
- Type consistency: use `taxValue` for global percentage, `taxRate` for decimal pricing context, and `taxable` for product/cart/order-line eligibility.
