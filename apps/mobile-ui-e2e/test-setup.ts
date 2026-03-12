import { device } from 'detox';

beforeAll(async () => {
  await device.launchApp({ newInstance: false });
  await device.disableSynchronization();
});
