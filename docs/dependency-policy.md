# Dependency Policy

This repository uses the root [package.json](/Users/orlando/dev/pos/package.json) and `yarn.lock` as the source of truth for dependency versions.

## Rules

1. Use explicit versions in manifests. Do not use `"*"` ranges.
2. Add new dependencies at the root unless there is a strong reason not to.
3. Keep [apps/mobile-ui/package.json](/Users/orlando/dev/pos/apps/mobile-ui/package.json) aligned with the root for app-consumed dependencies.
4. Upgrade dependencies in batches:
   - `safe patch/minor`
   - `security-driven`
   - `runtime major`
   - `tooling major`
5. Validate each batch with install, Metro startup, iOS build, and targeted smoke tests before moving to the next batch.

## Runtime baselines

- Node: `20.19.4`
- Yarn: `1.22.22`
- Nx: `22.5.4`
- React Native: `0.84.1`
