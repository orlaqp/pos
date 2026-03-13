# POS Upgrade Program

This folder tracks the phased modernization effort:

1. Nx modernization first.
2. React/React Native upgrade in controlled hops.
3. Dependency compatibility pass.
4. Stability hardening.
5. i18n (EN/ES).
6. Multi-tenancy v1.

Stripe is intentionally deferred until post-upgrade stability.

## Execution Discipline

1. Each phase must be release-safe.
2. Each phase must include lint/test/build validation.
3. Keep a rollback point before each major migration hop.
4. Record every migration command and result in this folder.

