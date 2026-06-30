import { runBrowardProductMaintenanceCli } from './cli';

runBrowardProductMaintenanceCli().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
