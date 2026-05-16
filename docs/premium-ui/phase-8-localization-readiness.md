# Phase 8: Multilanguage Localization Readiness

## Objective

Make English and Spanish first-class supported languages across every user-facing app screen, dialog, form, report, empty state, error state, alert, and navigation action.

This phase exists because matching `en.json` and `es.json` key counts is not enough. Official Spanish support requires every visible string to flow through translation resources, and every translated screen must still fit well on iPad landscape layouts.

## Guardrail

This phase is presentation and copy-infrastructure only. It must not change business rules, pricing, payment behavior, inventory math, sync behavior, persistence, schemas, or access-control semantics.

Validation messages may be reworded for clarity, but validation rules must not change unless explicitly approved outside this phase.

## Scope

- App shell, navigation actions, logoff/switch employee/reset dialogs, diagnostics, and setup flows
- Auth screens: login, signup, confirmation, remembered session copy, and errors
- Home/PIN employee entry and first-run setup wizard
- Sales catalog, cart, checkout, payment, discounts, price override, promo, product detail, and order summary dialogs
- Orders, open orders, order journal, payment/refund/void flows, receipt actions, and print actions
- Back-office CRUD: products, employees, brands, categories, unit of measure, store profile, station profile, printers, discounts, and settings
- Inventory: stock list, count, receive, compact product pickers, line editors, and item cards
- Reporting: dashboard, end of day, sales reports, refund report, payment summary, EBT summary, open-order aging, low/no sales, category performance, charts, report viewer, exports, and empty states
- Shared UI primitives where they emit user-facing default text

## Current Audit Snapshot

The translation resource files are structurally aligned today:

- `libs/settings/data-access/src/lib/language/en.json`: 154 keys
- `libs/settings/data-access/src/lib/language/es.json`: 154 keys
- Missing keys between EN and ES: 0

The implementation is not yet official-ready because many screen components still contain hardcoded English copy and do not call the translation layer. The highest-impact gaps found in the audit were:

- `apps/mobile-ui/src/app/navigation.tsx`
- `apps/mobile-ui/src/app/HomeScreen.tsx`
- `apps/mobile-ui/src/app/home-setup-wizard.tsx`
- `libs/auth/native-feature/src/lib/components/login/login.tsx`
- `libs/auth/native-feature/src/lib/components/signup/signup.tsx`
- `libs/auth/native-feature/src/lib/components/confirm-signup/confirm-signup.tsx`
- `libs/products/native-feature/src/lib/components/product-form/product-form.tsx`
- `libs/employees/native-feature/src/lib/components/employee-form/employee-form.tsx`
- `libs/store-info/native-feature/src/lib/components/store-info-form/store-info-form.tsx`
- `libs/store-info/native-feature/src/lib/components/station-form/station-form.tsx`
- `libs/discounts/native-feature/src/lib/components/discounts/discount-definition-fields.tsx`
- `libs/discounts/native-feature/src/lib/components/discounts/discount-policy-fields.tsx`
- `libs/sales/native-feature/src/lib/components/sales-screen/sales-catalog-pane.tsx`
- `libs/sales/native-feature/src/lib/components/cart/cart-order-summary-dialog.tsx`
- `libs/sales/native-feature/src/lib/components/cart/cart-discount-actions.tsx`
- `libs/inventory/native-feature/src/lib/components/inventory-counts/inventory-count-form.tsx`
- `libs/inventory/native-feature/src/lib/components/inventory-receives/inventory-receive-form.tsx`
- `libs/reporting/native-feature/src/lib/components/refund-report/refund-report.tsx`

## Implementation Tasks

- [x] Create or standardize a small local translation helper pattern for components that cannot use hooks cleanly.
- [ ] Convert all app shell and auth/setup copy to translation keys.
- [ ] Convert all back-office form headings, labels, placeholders, validation messages, alerts, and status badges to translation keys.
- [~] Convert all sales/cart/payment/order dialog copy to translation keys.
- [ ] Convert all inventory count/receive/list copy to translation keys.
- [ ] Convert all reporting/dashboard/table/chart/export/empty-state copy to translation keys.
- [ ] Convert shared UI primitive default copy to translation keys where the component owns visible text.
- [ ] Review interpolated strings for Spanish grammar rather than concatenating English word order.
- [ ] Review pluralization-sensitive strings such as order counts, item counts, role counts, refunds, minutes, and products.
- [ ] Review currency/date/time formatting so labels are translated while numeric values remain locale-appropriate.
- [ ] Review layout fit in Spanish for buttons, badges, tab labels, table headers, and compact cards.
- [x] Add tests or static checks that catch missing EN/ES keys before merge.
- [x] Add a hardcoded visible-string scan to CI or document a required local command for this phase.

## Translation Key Rules

- Use stable semantic keys, not English sentences as keys.
- Prefer module prefixes: `APP_`, `AUTH_`, `HOME_`, `SALES_`, `CART_`, `PAYMENT_`, `ORDERS_`, `PRODUCT_`, `EMPLOYEE_`, `INVENTORY_`, `REPORT_`, `SETTINGS_`, `DISCOUNT_`, `COMMON_`.
- Every new key must be added to both `en.json` and `es.json` in the same change.
- Alerts must translate title, body, and button labels.
- Inputs must translate label, placeholder, and validation messages.
- Buttons and actions must translate disabled/empty/error alternatives too.
- Do not reuse a key if the Spanish translation would need different wording in another context.

## Screen Review Checklist

For every screen reviewed, verify:

- [ ] Screen title and navigation title are translated.
- [ ] Section headers and helper/subtitle text are translated.
- [ ] Buttons, icon actions, dialog actions, and menu actions are translated.
- [ ] Form labels, placeholders, validation messages, and field-level errors are translated.
- [ ] Empty, loading, offline, disabled, and error states are translated.
- [ ] Alerts/toasts/dialogs translate every visible string and action.
- [ ] Dynamic copy uses interpolation/pluralization instead of string concatenation.
- [ ] Spanish copy fits without clipping, awkward wrapping, or unreadable truncation.
- [ ] Tests cover at least one Spanish render path for critical flows.

## Acceptance Criteria

- EN and ES dictionaries contain the same keys.
- No critical screen contains hardcoded user-facing English copy outside approved exceptions.
- Language switching updates app shell, active screen copy, dialogs opened after switching, and navigation labels.
- Spanish copy is reviewed on iPad landscape for the primary cashier/admin flows.
- Critical flows pass in both languages:
    - login/signup/session restore
    - PIN employee entry
    - sales cart and checkout
    - open-order payment
    - order journal
    - product create/edit
    - employee create/edit
    - store/station settings
    - inventory count/receive
    - dashboard/report viewing

## Suggested Verification Commands

Run these during the phase and record results here:

```sh
python3 - <<'PY'
import json, pathlib
base = pathlib.Path('libs/settings/data-access/src/lib/language')
en = json.loads((base / 'en.json').read_text())
es = json.loads((base / 'es.json').read_text())
missing_es = sorted(set(en) - set(es))
missing_en = sorted(set(es) - set(en))
print('missing_in_es', missing_es)
print('missing_in_en', missing_en)
raise SystemExit(1 if missing_es or missing_en else 0)
PY
```

```sh
rg -n "title=\"[A-Za-z]|label=\"[A-Za-z]|placeholder=\"[A-Za-z]|<Text[^>]*>[^<{]*[A-Za-z][^<]*</Text>" \
  apps/mobile-ui/src/app libs/*/native-feature/src/lib/components \
  --glob '!**/coverage/**' --glob '!**/*.spec.*'
```

The hardcoded-string scan is intentionally noisy. Each hit should be converted to a key or explicitly documented as an approved exception.

## Notes / Links

- Added `translateWithFallback` as a lightweight shared helper at `@pos/shared/utils/translation`, with a settings re-export for existing settings consumers.
- Sales and orders components that already had local `i18next` fallback helpers now use the shared helper.
- Added a language resource test that fails if English and Spanish keys drift apart.
- Sales/order conversion is partial: the fallback pattern is standardized, but many remaining hardcoded screen strings still need new keys.
