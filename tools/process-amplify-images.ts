import { parseImageArgs, runImageMigration } from './s3-asset-migration/src';

const main = async () => {
  const options = parseImageArgs(process.argv.slice(2));
  await runImageMigration(options);
};

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
