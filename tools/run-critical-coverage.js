const { spawnSync } = require('child_process');
const { existsSync, readFileSync } = require('fs');
const { resolve } = require('path');

const root = process.cwd();
const jestBin = resolve(root, 'node_modules/.bin/jest');

const targets = [
  {
    name: 'sales-critical-logic',
    cwd: 'libs/sales/native-feature',
    args: [
      '--config',
      'jest.config.ts',
      '--runInBand',
      '--coverage',
      '--coverageThreshold={}',
      '--collectCoverageFrom=src/lib/components/cart/cart-discount.helpers.ts',
      '--collectCoverageFrom=src/lib/components/cart/cart.logic.ts',
      '--collectCoverageFrom=src/lib/components/cart-payment/cart-payment.logic.ts',
      '--collectCoverageFrom=src/lib/components/product-details/product-details.logic.ts',
      '--collectCoverageFrom=src/lib/components/product-selection/product-selection.logic.ts',
      '--collectCoverageFrom=src/lib/components/sales-screen/sales-screen.logic.ts',
      '--coverageReporters=text-summary',
      '--coverageReporters=json-summary',
    ],
    summaryPath: 'coverage/coverage-summary.json',
  },
  {
    name: 'inventory-critical-flows',
    cwd: 'libs/inventory/native-feature',
    args: [
      '--config',
      'jest.config.ts',
      '--runInBand',
      '--coverage',
      '--coverageThreshold={}',
      '--collectCoverageFrom=src/lib/components/inventory-counts/inventory-count-form.tsx',
      '--collectCoverageFrom=src/lib/components/inventory-receives/inventory-receive-form.tsx',
      '--collectCoverageFrom=src/lib/components/shared/dedupe-products.ts',
      '--coverageReporters=text-summary',
      '--coverageReporters=json-summary',
    ],
    summaryPath: 'coverage/coverage-summary.json',
  },
  {
    name: 'shared-translation',
    cwd: 'libs/shared/utils',
    args: [
      'src/lib/translation.spec.ts',
      '--config',
      'jest.config.ts',
      '--runInBand',
      '--coverage',
      '--coverageThreshold={}',
      '--collectCoverageFrom=src/lib/translation.ts',
      '--coverageReporters=text-summary',
      '--coverageReporters=json-summary',
    ],
    summaryPath: '../../../coverage/libs/shared/utils/coverage-summary.json',
  },
];

const totals = {
  statements: { total: 0, covered: 0 },
  lines: { total: 0, covered: 0 },
  functions: { total: 0, covered: 0 },
  branches: { total: 0, covered: 0 },
};

for (const target of targets) {
  console.log(`\n== ${target.name} ==`);
  const result = spawnSync(jestBin, target.args, {
    cwd: resolve(root, target.cwd),
    stdio: 'inherit',
    shell: false,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }

  const summaryPath = resolve(root, target.cwd, target.summaryPath);
  if (!existsSync(summaryPath)) {
    console.error(`Missing coverage summary: ${summaryPath}`);
    process.exit(1);
  }

  const summary = JSON.parse(readFileSync(summaryPath, 'utf8')).total;
  for (const metric of Object.keys(totals)) {
    totals[metric].total += summary[metric].total;
    totals[metric].covered += summary[metric].covered;
  }
}

const pct = (metric) =>
  totals[metric].total === 0
    ? 100
    : Number(((totals[metric].covered / totals[metric].total) * 100).toFixed(2));

const statements = pct('statements');
const lines = pct('lines');
const functions = pct('functions');
const branches = pct('branches');

console.log('\nCritical coverage summary:');
console.log(`- statements: ${statements}% (${totals.statements.covered}/${totals.statements.total})`);
console.log(`- lines: ${lines}% (${totals.lines.covered}/${totals.lines.total})`);
console.log(`- functions: ${functions}% (${totals.functions.covered}/${totals.functions.total})`);
console.log(`- branches: ${branches}% (${totals.branches.covered}/${totals.branches.total})`);

if (statements < 90 || lines < 90 || functions < 90) {
  console.error('\nCritical coverage gate failed.');
  process.exit(1);
}

console.log('\nCritical coverage gate passed.');
