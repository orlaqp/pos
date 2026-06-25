#!/usr/bin/env node

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const appDir = path.join(repoRoot, 'apps', 'mobile-ui');
const configPath = path.join(appDir, 'src', 'amplifyconfiguration.json');
const validEnvironments = ['develop', 'ebtdev', 'prod', 'uat'];
const target = process.argv[2];

function printUsage() {
    console.log('Usage: yarn amplify:env <environment|status>');
    console.log('');
    console.log('Environments:');
    for (const env of validEnvironments) {
        console.log(`  - ${env}`);
    }
    console.log('');
    console.log('Examples:');
    console.log('  yarn amplify:env uat');
    console.log('  yarn amplify:env prod');
    console.log('  yarn amplify:env status');
}

function runAmplify(args) {
    const result = spawnSync('amplify', args, {
        cwd: appDir,
        stdio: 'inherit',
        shell: false,
    });

    if (result.error) {
        console.error(`Failed to run amplify ${args.join(' ')}: ${result.error.message}`);
        process.exit(1);
    }

    if (result.status !== 0) {
        process.exit(result.status || 1);
    }
}

function readAppConfig() {
    if (!fs.existsSync(configPath)) {
        console.warn(`Could not find app config at ${path.relative(repoRoot, configPath)}`);
        return null;
    }

    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

function printAppConfigSummary() {
    const config = readAppConfig();
    if (!config) return;

    console.log('');
    console.log('App config now points to:');
    console.log(`  GraphQL endpoint: ${config.aws_appsync_graphqlEndpoint || 'unknown'}`);
    console.log(`  User pool: ${config.aws_user_pools_id || 'unknown'}`);
    console.log(`  Identity pool: ${config.aws_cognito_identity_pool_id || 'unknown'}`);
    console.log(`  S3 bucket: ${config.aws_user_files_s3_bucket || 'unknown'}`);
}

if (!target || target === '--help' || target === '-h') {
    printUsage();
    process.exit(target ? 0 : 1);
}

if (!fs.existsSync(appDir)) {
    console.error(`Could not find Amplify app directory at ${appDir}`);
    process.exit(1);
}

if (target === 'status') {
    runAmplify(['env', 'list']);
    runAmplify(['status']);
    printAppConfigSummary();
    process.exit(0);
}

if (!validEnvironments.includes(target)) {
    console.error(`Unknown Amplify environment: ${target}`);
    console.error('');
    printUsage();
    process.exit(1);
}

runAmplify(['env', 'checkout', target]);
runAmplify(['status']);
printAppConfigSummary();
