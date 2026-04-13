import { DataStore } from '@pos/shared/amplify';
import { mergeSyncedOrders, subscribeToOrderChanges } from './data-store-sync';

jest.mock('react-native-localize', () => ({
  findBestLanguageTag: () => null,
}));

jest.mock('react-native-device-info', () => ({
  __esModule: true,
  default: {
    getUniqueIdSync: () => 'device-1',
  },
}));

const mockSubscribe = jest.fn();

jest.mock('@pos/shared/utils', () => ({
  sortByCreatedAt: jest.fn(),
  logSyncDebug: jest.fn(),
  startSyncMeasure: jest.fn(() => jest.fn()),
  trackSyncSubscription: jest.fn(() => jest.fn()),
}));

jest.mock('@pos/shared/amplify', () => ({
  DataStore: {
    query: jest.fn(),
    observeQuery: jest.fn(() => ({
      subscribe: mockSubscribe,
    })),
  },
}));

describe('data-store-sync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSubscribe.mockReset();
  });

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

  it('shares a single observeQuery set across multiple subscribers', () => {
    const dispatch = jest.fn();
    const unsubscribers = [jest.fn(), jest.fn(), jest.fn()];

    mockSubscribe
      .mockImplementationOnce(() => ({ unsubscribe: unsubscribers[0] }))
      .mockImplementationOnce(() => ({ unsubscribe: unsubscribers[1] }))
      .mockImplementationOnce(() => ({ unsubscribe: unsubscribers[2] }));

    const firstSub = subscribeToOrderChanges(dispatch);
    const secondSub = subscribeToOrderChanges(dispatch);

    expect(DataStore.observeQuery).toHaveBeenCalledTimes(3);

    firstSub.unsubscribe();
    unsubscribers.forEach((unsubscribe) => {
      expect(unsubscribe).not.toHaveBeenCalled();
    });

    secondSub.unsubscribe();
    unsubscribers.forEach((unsubscribe) => {
      expect(unsubscribe).toHaveBeenCalledTimes(1);
    });
  });
});
