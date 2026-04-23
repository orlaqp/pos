# Phase 5: Reporting And Analytics

## Objective
Make analytics and reports feel like a polished executive console: clear, trustworthy, and visually premium without sacrificing density.

## Guardrail
This phase is visual-only. It must not change calculations, aggregation rules, sorting semantics, filtering semantics, reporting logic, service behavior, data flow, or persistence.

## Primary Surfaces
- `libs/reporting/native-feature/src/lib/components/dashboard/dashboard.tsx`
- `libs/reporting/native-feature/src/lib/components/report-viewer/report-viewer.tsx`
- `libs/reporting/native-feature/src/lib/components/end-of-day/end-of-day.tsx`
- `libs/reporting/native-feature/src/lib/components/end-of-day/order-details.tsx`
- `libs/reporting/native-feature/src/lib/components/end-of-day/order-line-details.tsx`
- `libs/reporting/native-feature/src/lib/components/sales/sales.tsx`
- `libs/reporting/native-feature/src/lib/components/sales-by-employee/sales-by-employee.tsx`
- `libs/reporting/native-feature/src/lib/components/sales-by-product/sales-by-product.tsx`
- `libs/reporting/native-feature/src/lib/components/category-performance/category-performance.tsx`
- `libs/reporting/native-feature/src/lib/components/payment-summary/payment-summary.tsx`
- `libs/reporting/native-feature/src/lib/components/discount-report/discount-report.tsx`
- `libs/reporting/native-feature/src/lib/components/refund-report/refund-report.tsx`
- `libs/reporting/native-feature/src/lib/components/hourly-sales/hourly-sales.tsx`
- `libs/reporting/native-feature/src/lib/components/ebt-summary/ebt-summary.tsx`
- `libs/reporting/native-feature/src/lib/components/open-orders-aging/open-orders-aging.tsx`
- `libs/reporting/native-feature/src/lib/components/low-sales-items/low-sales-items.tsx`
- Shared report primitives:
  - `libs/reporting/native-feature/src/lib/components/widget/widget.tsx`
  - `libs/reporting/native-feature/src/lib/components/list-widget/list-widget.tsx`
  - `libs/reporting/native-feature/src/lib/components/line-chart/line-chart.tsx`
  - `libs/reporting/native-feature/src/lib/components/pie-chart/pie-chart.tsx`

## UX Goals
- High information density should still feel elegant.
- Summary metrics, filters, charts, and tables should feel related and consistent.
- Drill-down areas should feel like premium detail workspaces, not just raw utility output.

## Tasks
- [x] Standardize dashboard and report-page headers.
- [x] Standardize metric cards across dashboard and End of Day.
- [x] Standardize filter bars and date-range surfaces.
- [x] Improve chart framing, legends, and surrounding whitespace.
- [x] Make report tables feel more premium through spacing, column rhythm, and empty states.
- [x] Continue polishing End of Day detail cards and detail drawers with shared patterns.
- [x] Harmonize financial color semantics so gains, refunds, discounts, and warnings feel deliberate.

## Acceptance Criteria
- Reports feel premium and trustworthy.
- Visual hierarchy helps the eye move from summary to detail naturally.
- Dense financial data remains readable without feeling cramped.

## Dependencies
- Earlier phase decisions on headers, chips, list rows, and summary cards

## Notes / Links
- Add screenshots, references, or PRs here as this phase progresses.

## Progress Notes
- Dashboard and shared report pages now use a more consistent executive-header treatment with an eyebrow, stronger title weight, calmer subtitle rhythm, and premium dark report-card surface.
- Dashboard and End of Day metric cards now share the same rounded, bordered, high-contrast `Widget` treatment while preserving each report's existing values and color semantics.
- End of Day filter/date controls now sit in a premium dark toolbar with compact uppercase labels, rounded date action, and matching dropdown/search surfaces while preserving the existing filter behavior.
- Shared line and pie chart components now render inside framed dark chart surfaces with stronger section headings, calmer empty states, responsive width handling, and refreshed legend/color treatment.
- Shared report tables and list widgets now use framed dark table/list shells, compact uppercase headers, rounded row rhythm, subtle alternate rows, and stronger totals/empty-state treatments without changing row data or sorting/filtering behavior.
- End of Day detail cards now use a stronger premium drill-down surface, subtler order chips, calmer summary/payment panels, and a more deliberate item-table container while preserving existing refund, discount, and payment values.
- End of Day financial detail colors now separate collected sales, discounts, and refunds more deliberately with success, amber, and violet-tinted surfaces while leaving all numbers and aggregation behavior unchanged.
