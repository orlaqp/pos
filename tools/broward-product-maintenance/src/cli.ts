import { CloudFormationClient } from '@aws-sdk/client-cloudformation';
import { fromIni } from '@aws-sdk/credential-provider-ini';

import { resolveEnvironment } from '../../dynamo-migration/src/amplify-env';
import { applyProductUpdates, createDocumentClient, scanProductsByTenant } from './dynamo';
import { buildMaintenancePlan, getBarcodeSamples, summarizePlan } from './planner';
import {
  CliOptions,
  DEFAULT_PROFILE,
  DEFAULT_TARGET_ENV,
  DEFAULT_TENANT_ID,
} from './types';

const readArg = (args: string[], name: string) => {
  const index = args.indexOf(name);
  if (index === -1) return undefined;
  return args[index + 1];
};

export const parseOptions = (argv: string[]): CliOptions => ({
  tenantId: readArg(argv, '--tenant-id') || DEFAULT_TENANT_ID,
  targetEnv: readArg(argv, '--target-env') || DEFAULT_TARGET_ENV,
  profile: readArg(argv, '--profile') || DEFAULT_PROFILE,
  apply: argv.includes('--apply'),
});

const resolveProductTable = (
  tables: Record<string, { physicalTableName?: string } | undefined>
) => {
  const tableName = tables.Product?.physicalTableName;
  if (!tableName) {
    throw new Error('Unable to resolve Product table from Amplify environment');
  }

  return tableName;
};

const logReport = (
  summary: ReturnType<typeof summarizePlan>,
  samples: ReturnType<typeof getBarcodeSamples>
) => {
  console.log(`Total Broward products scanned: ${summary.totalProducts}`);
  console.log(`Products whose quantity would change: ${summary.quantityChanges}`);
  console.log(`Products whose barcode would change: ${summary.barcodeChanges}`);

  if (samples.length === 0) {
    console.log('Barcode change samples: none');
    return;
  }

  console.log('Barcode change samples:');
  for (const sample of samples) {
    console.log(`- ${sample.id}: ${sample.before} -> ${sample.after}`);
  }
};

export const runBrowardProductMaintenanceCli = async (argv = process.argv.slice(2)) => {
  const options = parseOptions(argv);
  const cf = new CloudFormationClient({
    region: 'us-east-1',
    credentials: fromIni({ profile: options.profile }),
  });
  const env = await resolveEnvironment(cf, options.profile, options.targetEnv);
  const productTable = resolveProductTable(env.tables);
  const documentClient = createDocumentClient(env.region, options.profile);

  console.log(`Target tenant: ${options.tenantId}`);
  console.log(`Target env: ${env.envName}`);
  console.log(`Target stack: ${env.stackName}`);
  console.log(`Profile: ${options.profile}`);
  console.log(`Dry run: ${options.apply ? 'disabled' : 'enabled'}`);
  console.log(`Product table: ${productTable}`);

  const products = await scanProductsByTenant(documentClient, productTable, options.tenantId);
  const plan = buildMaintenancePlan(products, options.tenantId);
  const summary = summarizePlan(plan);
  const samples = getBarcodeSamples(plan);

  logReport(summary, samples);

  if (!options.apply) {
    console.log('No writes performed. Re-run with --apply to update products.');
    return { summary, samples, applied: false };
  }

  await applyProductUpdates(documentClient, productTable, plan);
  console.log(`Applied updates to ${summary.totalProducts} products.`);

  return { summary, samples, applied: true };
};

