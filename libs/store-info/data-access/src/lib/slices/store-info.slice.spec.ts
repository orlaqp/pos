jest.mock('@pos/shared/amplify', () => ({
  DataStore: {
    observeQuery: jest.fn(),
  },
}));

jest.mock('react-native-device-info', () => ({
  __esModule: true,
  default: {
    getUniqueIdSync: jest.fn(() => 'test-device-id'),
  },
}));

import {
  fetchStoreInfo,
  initialStoreInfoState,
  storeInfoActions,
  storeInfoReducer,
} from './store-info.slice';
import { DataStore } from '@pos/shared/amplify';

const observeQueryMock = DataStore.observeQuery as jest.Mock;

describe('storeInfo reducer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns initial state', () => {
    expect(storeInfoReducer(undefined, { type: '' })).toEqual(initialStoreInfoState);
  });

  it('handles fetchStoreInfo pending/fulfilled/rejected', () => {
    let state = storeInfoReducer(undefined, fetchStoreInfo.pending('', undefined));
    expect(state.loadingStatus).toBe('loading');

    state = storeInfoReducer(
      state,
      fetchStoreInfo.fulfilled(
        { store: { id: 'store-1' } as any, initialSyncComplete: true },
        '',
        undefined
      )
    );
    expect(state.loadingStatus).toBe('loaded');
    expect(state.store).toEqual(expect.objectContaining({ id: 'store-1' }));
    expect(state.initialSyncComplete).toBe(true);

    state = storeInfoReducer(
      state,
      fetchStoreInfo.rejected(new Error('Uh oh'), '', undefined)
    );
    expect(state.loadingStatus).toBe('error');
    expect(state.error).toBe('Uh oh');
  });

  it('handles set', () => {
    const state = storeInfoReducer(
      undefined,
      storeInfoActions.set({ id: 'store-2' } as any)
    );
    expect(state.store).toEqual(expect.objectContaining({ id: 'store-2' }));
  });

  it('waits for synced store info before fulfilling fetchStoreInfo', async () => {
    observeQueryMock.mockImplementation(() => ({
      subscribe: ({ next }: { next: (value: unknown) => void }) => {
        next({ isSynced: false, items: [] });
        next({
          isSynced: true,
          items: [{ id: 'store-1', name: 'Main Store' }],
        });

        return { unsubscribe: jest.fn() };
      },
    }));

    const action = await fetchStoreInfo()(
      jest.fn(),
      jest.fn(),
      undefined
    );

    expect(action.type).toBe('storeInfo/fetchStatus/fulfilled');
    expect(action.payload).toEqual({
      store: expect.objectContaining({ id: 'store-1', name: 'Main Store' }),
      initialSyncComplete: true,
    });
  });
});
