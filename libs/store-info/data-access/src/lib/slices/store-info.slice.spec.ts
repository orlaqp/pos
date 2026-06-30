/* eslint-disable import/first */
jest.mock('@pos/shared/amplify', () => ({
  DataStore: {},
}));

jest.mock('./store-info.service', () => ({
  StoreInfoService: {
    getStore: jest.fn(),
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
import {
  isStoreInfoIncomplete,
  selectPreferredStore,
} from './store-info.entity';
import { StoreInfoService } from './store-info.service';

const getStoreMock = StoreInfoService.getStore as jest.Mock;

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

  it('fulfills fetchStoreInfo from the local store cache immediately', async () => {
    getStoreMock.mockResolvedValue([
      { id: 'store-1', name: 'Main Store' },
    ]);

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

  it('returns readable errors when fetchStoreInfo receives an object-shaped failure', async () => {
    getStoreMock.mockRejectedValue({
      errors: [{ message: 'Store query failed' }],
    });

    const action = await fetchStoreInfo()(
      jest.fn(),
      jest.fn(),
      undefined
    );

    expect(action.type).toBe('storeInfo/fetchStatus/rejected');
    expect(action.payload).toBe('Store query failed');

    const state = storeInfoReducer(undefined, action);
    expect(state.error).toBe('Store query failed');
  });

  it('prefers a completed store record over a placeholder record', () => {
    const selected = selectPreferredStore([
      {
        id: 'placeholder-store',
        address: 'Update in settings',
        city: 'Update in settings',
        state: 'NA',
        zipCode: '00000',
        phone: '000-000-0000',
        updatedAt: '2026-03-14T00:00:00.000Z',
      } as any,
      {
        id: 'configured-store',
        address: '145 Market Street',
        city: 'Brooklyn',
        state: 'NY',
        zipCode: '11201',
        phone: '718-555-0110',
        updatedAt: '2026-03-13T00:00:00.000Z',
      } as any,
    ]);

    expect(selected).toEqual(expect.objectContaining({ id: 'configured-store' }));
  });

  it('marks placeholder store records as incomplete', () => {
    expect(
      isStoreInfoIncomplete({
        address: 'Update in settings',
        city: 'Update in settings',
        state: 'NA',
        zipCode: '00000',
        phone: '000-000-0000',
      } as any)
    ).toBe(true);

    expect(
      isStoreInfoIncomplete({
        address: '145 Market Street',
        city: 'Brooklyn',
        state: 'NY',
        zipCode: '11201',
        phone: '718-555-0110',
      } as any)
    ).toBe(false);
  });
});
