# Amplify Safety Runbook (EBT Feature)

## Critical mapping
- `develop` is production. Treat as protected.
- `ebtdev` is the only writable environment for EBT development.
- Note: this older Amplify CLI enforces lowercase alphanumeric env names (no hyphen), so `ebt-dev` is represented as `ebtdev`.
- For the web admin system, Amplify backend logic is read-only unless Orlando explicitly asks for a specific backend change.
- The web admin must reuse the same Cognito, AppSync, DataStore, schema, resolver, Lambda, storage, and tenant behavior already used by the iPad app.

## Forbidden during EBT development
- `amplify env checkout develop`
- `amplify push` while on `develop`
- Any schema/codegen promotion steps to production without explicit release approval
- Any web-admin-driven backend schema, resolver, Lambda, auth group, IAM, or Amplify environment change without explicit approval

## Mandatory preflight before backend mutation
Run from `apps/mobile-ui`:

```bash
amplify env checkout ebtdev
cat amplify/.config/local-env-info.json
```

Expected:

```json
"envName": "ebtdev"
```

## Shell guard (recommended)

```bash
cd /Users/orlando/dev/pos/apps/mobile-ui
test "$(node -e "console.log(require('./amplify/.config/local-env-info.json').envName)")" = "ebtdev" || { echo "ABORT: not on ebtdev"; exit 1; }
```

Run the guard before any mutating command, including:
- `amplify push`
- `amplify codegen ...`
- any schema migration or generated model sync command

## Allowed commands by environment

### On `ebtdev`
- `amplify push`
- `amplify codegen ...`
- schema/model changes
- feature test data setup

### On `develop` (read-only during feature work)
- `amplify pull`
- non-mutating inspect/list/status commands

## Promotion checklist (later)
1. Confirm EBT feature fully validated in `ebtdev`.
2. Freeze release commit/tag.
3. Explicitly approve promotion window.
4. Execute release-only steps against `develop`.
5. Run smoke tests and keep rollback commit ready.
