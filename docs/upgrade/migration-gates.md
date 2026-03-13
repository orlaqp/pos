# Migration Gates

## Mandatory Commands Per Phase

1. `yarn nx lint mobile-ui --skip-nx-cache`
2. `yarn nx test mobile-ui --runInBand --skip-nx-cache`
3. `yarn nx lint sales-native-feature --skip-nx-cache`
4. `yarn nx test sales-native-feature --runInBand --skip-nx-cache`
5. `yarn nx lint back-office-native-feature --skip-nx-cache`
6. `yarn nx test back-office-native-feature --runInBand --skip-nx-cache`

## Native Build Validation

1. iOS: `yarn nx run-ios mobile-ui --simulator "iPad (A16)"`
2. Android: `yarn nx run-android mobile-ui`

## E2E Smoke Gate

1. `yarn nx run mobile-ui-e2e:test-ios`

Required flow coverage:

1. Login.
2. Sales cart flow.
3. Payment flow.
4. Inventory update flow.
5. Report view/export flow.

## Exit Criteria

A phase can be considered complete only when:

1. All mandatory commands pass.
2. No new red-screen runtime errors are introduced.
3. Critical flows remain functional.

