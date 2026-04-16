import {
  parseImageRestoreJpgArgs,
  runImageRestoreJpg,
} from './s3-asset-migration/src';

const main = async () => {
  const options = parseImageRestoreJpgArgs(process.argv.slice(2));
  const report = await runImageRestoreJpg(options);
  console.log(JSON.stringify(report, null, 2));
};

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
