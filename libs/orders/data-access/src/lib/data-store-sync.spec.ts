jest.mock('react-native-localize', () => ({
  findBestLanguageTag: () => null,
}));

jest.mock('react-native-device-info', () => ({
  __esModule: true,
  default: {
    getUniqueIdSync: () => 'device-1',
  },
}));

import { mergeSyncedOrders } from './data-store-sync';

describe('data-store-sync', () => {
  it('merges open and recent closed orders without duplicates', () => {
    const openOrders = [
      { id: 'open-1', status: 'OPEN' },
      { id: 'shared-1', status: 'OPEN' },
    ] as any[];

    const recentClosedOrders = [
      { id: 'paid-1', status: 'PAID' },
      { id: 'shared-1', status: 'PAID' },
    ] as any[];

    expect(mergeSyncedOrders(openOrders, recentClosedOrders)).toEqual([
      { id: 'open-1', status: 'OPEN' },
      { id: 'shared-1', status: 'PAID' },
      { id: 'paid-1', status: 'PAID' },
    ]);
  });
});
