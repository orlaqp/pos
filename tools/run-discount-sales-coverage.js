const { spawnSync } = require('child_process');
const { existsSync, readFileSync } = require('fs');
const { resolve } = require('path');

const root = process.cwd();

const targets = [
  {
    name: 'discounts-domain',
    cwd: 'libs/discounts/domain',
    config: 'jest.config.ts',
    coverageDir: '../../../coverage/libs/discounts/domain',
    collectCoverageFrom: 'src/lib/**/*.{ts,tsx}',
  },
  {
    name: 'discounts-data-access',
    cwd: 'libs/discounts/data-access',
    config: 'jest.config.ts',
    coverageDir: '../../../coverage/libs/discounts/data-access',
    collectCoverageFrom: 'src/lib/**/*.{ts,tsx}',
  },
  {
    name: 'discounts-native-feature',
    cwd: 'libs/discounts/native-feature',
    config: 'jest.config.ts',
    coverageDir: '../../../coverage/libs/discounts/native-feature',
    collectCoverageFrom: 'src/lib/components/**/*.{ts,tsx}',
  },
  {
    name: 'sales-data-access',
    cwd: 'libs/sales/data-access',
    config: 'jest.config.ts',
    coverageDir: '../../../coverage/libs/sales/data-access',
    collectCoverageFrom: 'src/lib/**/*.{ts,tsx}',
  },
  {
    name: 'sales-native-feature',
    cwd: 'libs/sales/native-feature',
    config: 'jest.config.ts',
    coverageDir: 'coverage',
    collectCoverageFrom: 'src/lib/components/**/*.{ts,tsx}',
  },
];

const run = (target) => {
  const args = [
    '../../../node_modules/.bin/jest',
    '--config',
    target.config,
    '--coverage',
    '--runInBand',
    '--collectCoverageFrom',
    target.collectCoverageFrom,
    '--coverageThreshold={}',
    '--coverageReporters=text-summary',
    '--coverageReporters=json-summary',
  ];

  const result = spawnSync(args[0], args.slice(1), {
    cwd: resolve(root, target.cwd),
    stdio: 'inherit',
    shell: false,
  });

  const summaryPath = resolve(root, target.cwd, target.coverageDir, 'coverage-summary.json');
  const summary = existsSync(summaryPath)
    ? JSON.parse(readFileSync(summaryPath, 'utf8')).total
    : null;

  return {
    name: target.name,
    exitCode: result.status || 0,
    summary,
  };
};

const results = targets.map(run);

console.log('\nCoverage summary:');
results.forEach((result) => {
  if (!result.summary) {
    console.log(`- ${result.name}: no summary generated`);
    return;
  }

  console.log(
    `- ${result.name}: statements ${result.summary.statements.pct}%, branches ${result.summary.branches.pct}%, functions ${result.summary.functions.pct}%, lines ${result.summary.lines.pct}%`
  );
});

const failed = results.filter((result) => result.exitCode !== 0);
if (failed.length) {
  process.exitCode = 1;
}
