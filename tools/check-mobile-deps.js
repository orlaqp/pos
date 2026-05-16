const fs = require('fs');
const path = require('path');

const rootPackagePath = path.join(__dirname, '..', 'package.json');
const appPackagePath = path.join(
  __dirname,
  '..',
  'apps',
  'mobile-ui',
  'package.json'
);

const rootPackage = JSON.parse(fs.readFileSync(rootPackagePath, 'utf8'));
const appPackage = JSON.parse(fs.readFileSync(appPackagePath, 'utf8'));

const rootVersions = {
  ...(rootPackage.dependencies || {}),
  ...(rootPackage.devDependencies || {}),
};
const appDependencies = appPackage.dependencies || {};

const mismatches = [];
const missing = [];

for (const [name, version] of Object.entries(appDependencies)) {
  const rootVersion = rootVersions[name];

  if (!rootVersion) {
    missing.push(name);
    continue;
  }

  const normalizedRootVersion = rootVersion.replace(/^[~^]/, '');
  const normalizedAppVersion = version.replace(/^[~^]/, '');

  if (normalizedRootVersion !== normalizedAppVersion) {
    mismatches.push({ name, appVersion: version, rootVersion });
  }
}

if (missing.length === 0 && mismatches.length === 0) {
  console.log(
    'apps/mobile-ui/package.json dependencies match root package versions.'
  );
  process.exit(0);
}

if (missing.length > 0) {
  console.error('Missing from root package.json:');
  for (const name of missing) {
    console.error(`- ${name}`);
  }
}

if (mismatches.length > 0) {
  console.error('Version mismatches between root and apps/mobile-ui:');
  for (const mismatch of mismatches) {
    console.error(
      `- ${mismatch.name}: app=${mismatch.appVersion} root=${mismatch.rootVersion}`
    );
  }
}

process.exit(1);
