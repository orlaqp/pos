# Phase 2 Prep: React + React Native Core Upgrade

Date: 2026-03-13

## Current Baseline (from `package.json`)

- `nx`: `14.8.9`
- `react`: `18.2.0`
- `react-native`: `0.70.1`

## Confirmed Target Path

1. `react-native` `0.70.1 -> 0.71.x`
2. `react-native` `0.71.x -> 0.76.x`
3. `react-native` `0.76.x -> 0.84.1`
4. Align `react` to final target once RN hop compatibility is satisfied.

## Phase 2 Safety Gates (per hop)

1. Install/update packages for the hop.
2. `yarn install` and native dependency sync (`pod install` for iOS hop checkpoints).
3. `yarn nx affected:test --all --runInBand --skip-nx-cache`
4. `yarn nx affected:lint --all --skip-nx-cache`
5. App runtime smoke:
   - Launch app
   - Navigate sales/payments/inventory/backoffice
   - Confirm no red screens/native module resolution errors

## Notes

- This workspace already has Nx migration and Jest/Babel config modernization committed.
- Next implementation step is to execute the first RN hop (`0.70.1 -> 0.71.x`) with the same gate pattern.
