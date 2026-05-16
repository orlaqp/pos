import { CloudFormationClient } from '@aws-sdk/client-cloudformation';
import { fromIni } from '@aws-sdk/credential-provider-ini';
import { DEFAULT_PROFILE, DEFAULT_TARGET_ENV } from './constants';
import { createDocumentClient } from './dynamo';
import { loadTenantCatalogSnapshot } from './catalog';
import { seedTenantDiscounts } from './seed';
import type { Logger, SeedOptions } from './types';
import { resolveEnvironment } from '../../dynamo-migration/src/amplify-env';

const logger: Logger = {
  info: (message) => console.log(message),
  error: (message) => console.error(message),
};

const readArg = (args: string[], name: string) => {
  const index = args.indexOf(name);
  if (index === -1) return undefined;
  return args[index + 1];
};

const parseOptions = (argv: string[]): SeedOptions => {
  const tenantId = readArg(argv, '--tenant-id');
  if (!tenantId) {
    throw new Error('--tenant-id is required');
  }

  return {
    tenantId,
    profile: readArg(argv, '--profile') || DEFAULT_PROFILE,
    targetEnv: readArg(argv, '--target-env') || DEFAULT_TARGET_ENV,
    dryRun: !argv.includes('--apply'),
    outputPath: readArg(argv, '--output-path'),
  };
};

export const runTenantDiscountSeedCli = async () => {
  const options = parseOptions(process.argv.slice(2));
  const cf = new CloudFormationClient({
    region: 'us-east-1',
    credentials: fromIni({ profile: options.profile }),
  });
  const env = await resolveEnvironment(cf, options.profile, options.targetEnv);
  const documentClient = createDocumentClient(env.region, options.profile);

  logger.info(`Target env: ${env.envName}`);
  logger.info(`Target stack: ${env.stackName}`);
  logger.info(`Profile: ${options.profile}`);
  logger.info(`Dry run: ${options.dryRun ? 'enabled' : 'disabled'}`);

  const snapshot = await loadTenantCatalogSnapshot(documentClient, env, options.tenantId);
  logger.info(
    `Tenant snapshot: ${snapshot.categories.length} categories, ${snapshot.products.length} products, ${snapshot.employees.length} employees, ${snapshot.discountDefinitions.length} existing discounts, ${snapshot.employeeDiscountPolicies.length} existing policies`
  );

  const report = await seedTenantDiscounts(snapshot, options, {
    env,
    logger,
    documentClient,
  });

  logger.info(JSON.stringify(report, null, 2));
};
