import { runTenantDiscountSeedCli } from './tenant-discount-seed/src/cli';

runTenantDiscountSeedCli().catch((error) => {
  const message = error instanceof Error ? error.stack || error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
