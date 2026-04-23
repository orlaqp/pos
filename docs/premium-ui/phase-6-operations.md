# Phase 6: Inventory, Settings, And Operational Screens

## Objective

Upgrade the operational and configuration areas so they feel polished and dependable, not like lower-priority utility screens.

## Guardrail

This phase is visual-only. It must not change inventory rules, receive/count behavior, configuration semantics, service behavior, data flow, or persistence.

## Primary Surfaces

- Inventory:
    - `libs/inventory/native-feature/src/lib/components/inventory/inventory-list.tsx`
    - `libs/inventory/native-feature/src/lib/components/inventory/inventory-line.tsx`
    - `libs/inventory/native-feature/src/lib/components/inventory-counts/inventory-counts.tsx`
    - `libs/inventory/native-feature/src/lib/components/inventory-counts/inventory-count-list.tsx`
    - `libs/inventory/native-feature/src/lib/components/inventory-counts/inventory-count-item.tsx`
    - `libs/inventory/native-feature/src/lib/components/inventory-counts/inventory-count-form.tsx`
    - `libs/inventory/native-feature/src/lib/components/inventory-counts/inventory-count-line.tsx`
    - `libs/inventory/native-feature/src/lib/components/inventory-receives/inventory-receives.tsx`
    - `libs/inventory/native-feature/src/lib/components/inventory-receive-list.tsx`
    - `libs/inventory/native-feature/src/lib/components/inventory-receive-item.tsx`
    - `libs/inventory/native-feature/src/lib/components/inventory-receive-form.tsx`
    - `libs/inventory/native-feature/src/lib/components/inventory-receive-line.tsx`
- Settings and configuration:
    - `libs/settings/native-feature/src/lib/components/settings/settings.tsx`
    - `libs/settings/native-feature/src/lib/components/log-list/log-list.tsx`
    - `libs/store-info/native-feature/src/lib/components/store-info-form/store-info-form.tsx`
    - `libs/store-info/native-feature/src/lib/components/station-form/station-form.tsx`
    - `libs/printings/native-feature/src/lib/components/printer-list/printer-list.tsx`
    - `libs/printings/native-feature/src/lib/components/printer-item/printer-item.tsx`

## UX Goals

- Operational forms should feel efficient and premium, not like legacy admin tooling.
- Counts and receives should support serious work while keeping visual calm.
- Settings should feel structured and intentional instead of miscellaneous.

## Tasks

- [x] Standardize header and summary treatment in inventory modules.
- [x] Improve count and receive forms for dense data entry on iPad.
- [x] Improve line-item readability for inventory rows and transactional subrows.
- [x] Standardize configuration forms in store, station, and printer areas.
- [x] Improve logs/settings readability with better grouping and metadata treatment.
- [x] Reuse earlier list/form/dialog patterns rather than reinventing operational UI.

## Acceptance Criteria

- Inventory screens feel first-class, not secondary.
- Dense operational entry remains fast while looking more premium.
- Settings and device-related screens feel stable and trustworthy.

## Dependencies

- Phase 4 list/form patterns

## Notes / Links

- Inventory stock, count, and receive rows received a visual-only operational polish pass.
- Count and receive forms now use compact operational headers with workspace context and live line counts for faster dense-entry scanning.
- Printer discovery/default selection now uses the shared operational screen, card, badge, and list-item language already established in earlier phases.
- System logs now include event count metadata, readable timestamps, category treatment, and structured payload panels for easier troubleshooting.
- Inventory tests passed with `yarn nx test inventory-native-feature --skip-nx-cache`.
- Focused printings, inventory form, and settings/log tests passed during the Phase 6 closeout pass.
