#!/usr/bin/env node

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const appRoot = path.join(repoRoot, 'apps', 'mobile-ui');
const iosRoot = path.join(appRoot, 'ios');
const derivedDataPath = path.join(iosRoot, '.derived-data');
const workspace = 'MobileUi.xcworkspace';
const scheme = 'MobileUi';
const configuration = process.env.IOS_CONFIGURATION || 'Debug';
const simulatorName = process.env.IOS_SIMULATOR || 'iPad (A16)';
const bundleId = 'com.bincrafters.pos';
const appPath = path.join(
  derivedDataPath,
  'Build',
  'Products',
  `${configuration}-iphonesimulator`,
  'MobileUi.app'
);

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: options.cwd || repoRoot,
    stdio: options.capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    encoding: options.capture ? 'utf8' : undefined,
    env: process.env,
  });
}

function parseVersion(runtime) {
  const match = runtime.match(/iOS-(\d+)-(\d+)(?:-(\d+))?/);
  if (!match) {
    return [0, 0, 0];
  }

  return [
    Number(match[1] || 0),
    Number(match[2] || 0),
    Number(match[3] || 0),
  ];
}

function compareVersions(a, b) {
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    const diff = (a[i] || 0) - (b[i] || 0);
    if (diff !== 0) {
      return diff;
    }
  }

  return 0;
}

function getSimulator() {
  const raw = run('xcrun', ['simctl', 'list', '--json', 'devices'], {
    capture: true,
  });
  const data = JSON.parse(raw);
  const candidates = [];

  Object.entries(data.devices || {}).forEach(([runtime, devices]) => {
    if (!runtime.includes('iOS-')) {
      return;
    }

    (devices || [])
      .filter((device) => device.isAvailable && device.name === simulatorName)
      .forEach((device) => {
        candidates.push({
          ...device,
          runtime,
          version: parseVersion(runtime),
        });
      });
  });

  if (candidates.length === 0) {
    throw new Error(`No available simulator found named "${simulatorName}"`);
  }

  const booted = candidates.find((device) => device.state === 'Booted');
  if (booted) {
    return booted;
  }

  return candidates.sort((left, right) => compareVersions(right.version, left.version))[0];
}

function ensureSimulatorBooted(device) {
  run('open', ['-a', 'Simulator'], { cwd: repoRoot });

  if (device.state !== 'Booted') {
    try {
      run('xcrun', ['simctl', 'boot', device.udid], { cwd: repoRoot });
    } catch (error) {
      // Ignore "already booted" type failures and rely on bootstatus.
    }
  }

  run('xcrun', ['simctl', 'bootstatus', device.udid, '-b'], { cwd: repoRoot });
}

function main() {
  const device = getSimulator();

  console.log(`Using simulator: ${device.name} (${device.runtime.replace('com.apple.CoreSimulator.SimRuntime.', '')}) ${device.udid}`);
  ensureSimulatorBooted(device);

  fs.mkdirSync(derivedDataPath, { recursive: true });

  run(
    'xcodebuild',
    [
      '-workspace',
      workspace,
      '-scheme',
      scheme,
      '-configuration',
      configuration,
      '-derivedDataPath',
      '.derived-data',
      '-destination',
      `id=${device.udid}`,
      'build',
    ],
    { cwd: iosRoot }
  );

  if (!fs.existsSync(appPath)) {
    throw new Error(`Built app not found at ${appPath}`);
  }

  run('xcrun', ['simctl', 'install', device.udid, appPath], { cwd: repoRoot });
  run('xcrun', ['simctl', 'launch', device.udid, bundleId], { cwd: repoRoot });
}

try {
  main();
} catch (error) {
  console.error(error.message || error);
  process.exit(1);
}
