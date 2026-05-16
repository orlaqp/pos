# Phase 0 Token And Layout Reference

## Status
Complete enough to guide visual work

This reference translates the current repo tokens into practical premium-UI usage rules for the redesign phases.

## Source Of Truth
- `libs/theme/native/src/design-tokens.ts`
- `libs/theme/native/src/shared-styles.ts`

## Core Tokens In Repo Today

### Spacing
- `xxs = 2`
- `xs = 4`
- `sm = 8`
- `md = 12`
- `lg = 16`
- `xl = 24`
- `xxl = 32`

### Radii
- `sm = 6`
- `md = 10`
- `lg = 14`
- `xl = 20`

### Typography
- `caption = 12`
- `body = 16`
- `subtitle = 18`
- `title = 24`
- `hero = 42`

### Color Roles
- `canvas = #000000`
- `surface = #2f374244`
- `surfaceMuted = #2f37422a`
- `surfaceAccent = #4aa3eb33`
- `border = #2f374288`
- `textPrimary = #f7f9fc`
- `textSecondary = #aab6c2`
- `textMuted = #8491a2`
- `accent = #4aa3eb`
- `success = #34c759`
- `warning = #ffb020`
- `danger = #ff5a5f`

## Premium Usage Rules

### Page Padding
- Standard page padding: `xl`
- Dense report pages: `lg` outer padding, `xl` section spacing
- Dialog body padding: `lg` to `xl` depending on complexity

### Section Rhythm
- Page header to first section: `xl`
- Between major sections: `lg` or `xl`
- Between card header and card content: `md`
- Between dense rows inside the same card: `xs` to `sm`

### Card Hierarchy
- Primary workspace card:
  - radius `xl` preferred on flagship screens
  - stronger contrast than supporting cards
  - internal padding `lg` or `xl`
- Secondary summary card:
  - radius `lg`
  - internal padding `md` or `lg`
- Read-only metadata chip:
  - radius `md` or `lg`
  - internal padding around `xs` to `sm`

### Typography Roles
- Hero screen title:
  - base on `hero`
  - reserved for Home or visually dominant landing states
- Page title:
  - base on `title`
  - high contrast, bold, minimal decoration
- Section title:
  - between `subtitle` and `title`
  - stronger than normal text, lighter than page title
- Primary numeric metric:
  - larger than `title` when needed
  - used sparingly for money/summary values
- Standard body/value:
  - around `body`
- Quiet metadata:
  - around `caption` to `13`
  - muted color

## Recommended Layout Primitives

### 1. Premium Page Header
- Left: title + one-line subtitle
- Right: filter/date/actions or summary value
- Uses `xl` bottom spacing

### 2. Summary Rail
- Horizontal set of 2 to 5 cards
- Internal card padding `md` to `lg`
- Metric label uses muted caption styling

### 3. Table-Like Data Box
- Header row with quiet labels
- Strong right-edge alignment for numbers
- Adjustment rows indented or visually softened

### 4. Landscape Modal Shell
- Two-column when task complexity justifies it
- Sticky action footer where completion matters
- Main workspace gets more width than control rail

## Cashier vs Admin Surface Guidance

### Cashier-Facing
- Higher contrast
- Bigger primary actions
- Faster visual scan
- Fewer quiet metadata labels
- More obvious active/selected state

### Admin / Reporting
- Higher information density
- More visible metadata and context
- Stronger section grouping
- Better column rhythm and numeric alignment
- Emphasis on trust and auditability over speed alone

## Current Gaps To Fix In Later Phases
- Shared styles and design tokens are both in use, but not always consistently.
- Some legacy screens still rely on ad hoc spacing instead of token rhythm.
- Large dialogs sometimes have premium size but not premium internal layout.
- Summary cards and financial tables need stricter consistency across modules.

## Safe Scope Reminder
This document governs visual-only work. It does not authorize any business-logic changes.
