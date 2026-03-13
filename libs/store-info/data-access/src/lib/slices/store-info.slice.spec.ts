import {
  fetchStoreInfo,
  initialStoreInfoState,
  storeInfoActions,
  storeInfoReducer,
} from './store-info.slice';

describe('storeInfo reducer', () => {
  it('returns initial state', () => {
    expect(storeInfoReducer(undefined, { type: '' })).toEqual(initialStoreInfoState);
  });

  it('handles fetchStoreInfo pending/fulfilled/rejected', () => {
    let state = storeInfoReducer(undefined, fetchStoreInfo.pending('', undefined));
    expect(state.loadingStatus).toBe('loading');

    state = storeInfoReducer(
      state,
      fetchStoreInfo.fulfilled({ id: 'store-1' } as any, '', undefined)
    );
    expect(state.loadingStatus).toBe('loaded');
    expect(state.store).toEqual(expect.objectContaining({ id: 'store-1' }));

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
});
