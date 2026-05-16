# Phase 0 Baseline Snapshot

Date: 2026-03-13  
Branch: `codex/nx-rn-upgrade-phase01`

## Toolchain Baseline

1. Node: `v22.21.0`
2. Yarn: `1.22.22`
3. Nx CLI: `13.10.3`

## Runtime Baseline (pre-upgrade)

1. React: `17.0.2`
2. React Native: `0.67.4`
3. Nx core: `13.10.3`

## Program Decisions Locked

1. Nx upgrade is mandatory first step.
2. Stripe is deferred.
3. i18n v1 is EN/ES.
4. Multi-tenancy v1 uses a single backend with `tenantId` scoping.

## Rollback Anchor

Use this branch point as the pre-migration rollback anchor for Phase 1.

