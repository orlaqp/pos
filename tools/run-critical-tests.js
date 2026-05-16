const { spawnSync } = require('child_process');
const { resolve } = require('path');

const root = process.cwd();
const jestBin = resolve(root, 'node_modules/.bin/jest');
const nxBin = resolve(root, 'node_modules/.bin/nx');

const run = (name, command, args, cwd = root) => {
  console.log(`\n== ${name} ==`);
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    shell: false,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

run('mobile-ui critical startup', jestBin, [
  'apps/mobile-ui/src/app/home-pin-login.spec.tsx',
  'apps/mobile-ui/src/app/app-lifecycle-diagnostics.spec.ts',
  'apps/mobile-ui/src/app/foreground-session-guard.spec.ts',
  'apps/mobile-ui/src/app/app-error-boundary.spec.tsx',
  'apps/mobile-ui/src/app/install-state.spec.ts',
  'apps/mobile-ui/src/app/startup-diagnostics.spec.ts',
  'apps/mobile-ui/src/app/home-route-grid.spec.tsx',
  '--config',
  'apps/mobile-ui/jest.config.ts',
  '--runInBand',
]);

run('auth critical helpers', jestBin, [
  'libs/auth/data-access/src/lib/sample-account-seed.runtime.spec.ts',
  '--config',
  'libs/auth/data-access/jest.config.ts',
  '--runInBand',
]);

run('settings critical suites', jestBin, [
  'libs/settings/data-access/src/lib/data-store-sync.spec.ts',
  'libs/settings/data-access/src/lib/language/language.utils.spec.ts',
  'libs/settings/data-access/src/lib/services/device-settings.service.spec.ts',
  'libs/settings/data-access/src/lib/services/station.service.spec.ts',
  'libs/settings/data-access/src/lib/slices/aws-config.slice.spec.ts',
  'libs/settings/data-access/src/lib/slices/settings.slice.spec.ts',
  '--config',
  'libs/settings/data-access/jest.config.ts',
  '--runInBand',
]);

run('sales native-feature suites', jestBin, [
  '--config',
  'jest.config.ts',
  '--runInBand',
], resolve(root, 'libs/sales/native-feature'));

run('orders critical suites', jestBin, [
  'libs/orders/native-feature/src/lib/components/open-order-payment-dialog/open-order-payment-dialog.spec.tsx',
  'libs/orders/native-feature/src/lib/components/order-item/order-item.spec.tsx',
  'libs/orders/native-feature/src/lib/components/order-list/order-list.spec.tsx',
  'libs/orders/native-feature/src/lib/components/order-refunded-details-dialog/order-refunded-details-dialog.spec.tsx',
  'libs/orders/native-feature/src/lib/components/order-refunded-details-dialog/order-refunded-details.logic.spec.ts',
  'libs/orders/native-feature/src/lib/components/order-void-form/order-void-form.layout.spec.tsx',
  'libs/orders/native-feature/src/lib/components/order-void-form/order-void-form.spec.ts',
  'libs/orders/native-feature/src/lib/components/order-journal-list/order-journal-list.spec.tsx',
  'libs/orders/native-feature/src/lib/components/compact-order-list/compact-order-list.spec.tsx',
  'libs/orders/native-feature/src/lib/components/order-voidable-item/order-voidable-item.spec.tsx',
  '--config',
  'libs/orders/native-feature/jest.config.ts',
  '--runInBand',
]);

run('orders data-access suites', jestBin, [
  '--config',
  'jest.config.ts',
  '--runInBand',
], resolve(root, 'libs/orders/data-access'));

run('inventory native-feature suites', jestBin, [
  '--config',
  'jest.config.ts',
  '--runInBand',
], resolve(root, 'libs/inventory/native-feature'));

run('inventory data-access suites', jestBin, [
  '--config',
  'jest.config.ts',
  '--runInBand',
], resolve(root, 'libs/inventory/data-access'));

run('reporting end-of-day suite', jestBin, [
  'libs/reporting/native-feature/src/lib/components/end-of-day/end-of-day.spec.tsx',
  '--config',
  'libs/reporting/native-feature/jest.config.ts',
  '--runInBand',
]);

run('shared utils translation suite', jestBin, [
  'libs/shared/utils/src/lib/translation.spec.ts',
  '--config',
  'libs/shared/utils/jest.config.ts',
  '--runInBand',
]);

run('ios critical detox', nxBin, ['run', 'mobile-ui-e2e:test-ios-critical']);

console.log('\nCritical test lane passed.');
