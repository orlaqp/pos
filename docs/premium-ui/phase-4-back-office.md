# Phase 4: Back Office Lists, Forms, And Navigation

## Objective
Upgrade the administrative shell so the app feels premium for managers, not just cashiers.

## Guardrail
This phase is visual-only. It must not change business rules, save behavior, validation semantics, service behavior, data flow, or persistence.

## Primary Surfaces
- `libs/back-office/native-feature/src/lib/components/back-office/back-office.tsx`
- `libs/back-office/native-feature/src/lib/components/sidebar/sidebar.tsx`
- `libs/back-office/native-feature/src/lib/components/sidebar/single-item.tsx`
- `libs/back-office/native-feature/src/lib/components/sidebar/submenu.tsx`
- Catalog:
  - `libs/products/native-feature/src/lib/components/products/products.tsx`
  - `libs/products/native-feature/src/lib/components/product-list/product-list.tsx`
  - `libs/products/native-feature/src/lib/components/product-item/product-item.tsx`
  - `libs/products/native-feature/src/lib/components/product-form/product-form.tsx`
  - `libs/categories/native-feature/src/lib/components/categories/categories.tsx`
  - `libs/categories/native-feature/src/lib/components/category-list/category-list.tsx`
  - `libs/categories/native-feature/src/lib/components/category-item/category-item.tsx`
  - `libs/categories/native-feature/src/lib/components/category-form/category-form.tsx`
  - `libs/brands/native-feature/src/lib/components/brands/brands.tsx`
  - `libs/brands/native-feature/src/lib/components/brand-list/brand-list.tsx`
  - `libs/brands/native-feature/src/lib/components/brand-item/brand-item.tsx`
  - `libs/brands/native-feature/src/lib/components/brand-form/brand-form.tsx`
  - `libs/unit-of-measures/native-feature/src/lib/components/unit-of-measures/unit-of-measures.tsx`
  - `libs/unit-of-measures/native-feature/src/lib/components/unit-of-measure-list/unit-of-measure-list.tsx`
  - `libs/unit-of-measures/native-feature/src/lib/components/unit-of-measure-item/unit-of-measure-item.tsx`
  - `libs/unit-of-measures/native-feature/src/lib/components/unit-of-measure-form/unit-of-measure-form.tsx`
- Employees:
  - `libs/employees/native-feature/src/lib/components/employees/employees.tsx`
  - `libs/employees/native-feature/src/lib/components/employee-list/employee-list.tsx`
  - `libs/employees/native-feature/src/lib/components/employee-item/employee-item.tsx`
  - `libs/employees/native-feature/src/lib/components/employee-form/employee-form.tsx`
- Discounts:
  - `libs/discounts/native-feature/src/lib/components/discounts/discounts.tsx`
  - `libs/discounts/native-feature/src/lib/components/discounts/discounts-list-screen.tsx`
  - `libs/discounts/native-feature/src/lib/components/discounts/discount-definition-fields.tsx`
  - `libs/discounts/native-feature/src/lib/components/discounts/discount-policy-fields.tsx`

## UX Goals
- Back Office should feel like a premium admin workspace with confident navigation and strong information hierarchy.
- Lists, tables, and forms should all feel like they belong to the same system.
- Managers should feel the app is powerful and polished, not cobbled together.

## Tasks
- [x] Redesign sidebar spacing, grouping, and active-state treatment.
- [x] Standardize page headers across all admin screens.
- [x] Standardize list empty states, filter bars, search fields, and action rows.
- [x] Standardize form sections, labels, helper text, save/cancel rail, and validation patterns.
- [x] Improve list row hierarchy for entity screens such as products, categories, employees, printers, and discounts.
- [x] Make dense configuration screens feel structured instead of form-heavy.

## Acceptance Criteria
- Switching between catalog, employees, discounts, and settings feels cohesive.
- Lists and forms share recognizable patterns instead of each feature inventing its own.
- The sidebar feels premium and branded rather than purely utilitarian.

## Dependencies
- Phase 0 layout primitives

## Notes / Links
- Add screenshots, references, or PRs here as this phase progresses.

## Progress Notes
- The back-office shell now has a calmer premium frame with a stronger left rail, cleaner employee header treatment, and softer content separation.
- Sidebar groups, row spacing, and active states now feel more intentional without changing any navigation behavior.
- Sidebar-related tests and the back-office shell test are passing again after tightening the test harness around native-feature imports.
- Catalog, employee, and discount list headers now share a stronger admin page hierarchy with eyebrow labels, clearer titles, calmer subtitles, and rounded action treatment.
- Product, category, brand, unit-of-measure, employee, and discount list rows now share a darker premium surface, softer borders, stronger title weight, and clearer action hierarchy.
- Shared form action buttons now use a softer rounded shape so save/cancel rails feel closer to the premium admin language.
- Shared admin lists now keep the header, search, refresh, and create actions visible even when empty, with a cohesive action rail and premium empty-state card treatment.
- Product, category, brand, unit-of-measure, employee, and discount forms now share premium section cards, stronger section headings, quieter helper/error text, and a consistent rounded action rail.
- Discount definition and policy forms now include scannable section guidance so dense rule configuration reads as grouped decisions instead of a wall of controls.
