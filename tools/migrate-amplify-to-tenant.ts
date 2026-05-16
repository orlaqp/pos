import { parseArgs, runMigration } from './dynamo-migration/src';

const main = async () => {
  const options = parseArgs(process.argv.slice(2));
  await runMigration(options);
};

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
