import { parseAssetArgs, runAssetMigration } from './s3-asset-migration/src';

const main = async () => {
  const options = parseAssetArgs(process.argv.slice(2));
  await runAssetMigration(options);
};

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
