import { brandsAdapter, brandsReducer, fetchBrands } from './brands.slice';

describe('brands reducer', () => {
  it('returns initial state', () => {
    expect(brandsReducer(undefined, { type: '' })).toEqual(
      brandsAdapter.getInitialState({
        loadingStatus: 'not loaded',
        selected: undefined,
        filterQuery: undefined,
        filteredList: undefined,
      })
    );
  });

  it('handles fetchBrands pending/fulfilled/rejected', () => {
    let state = brandsReducer(undefined, fetchBrands.pending('', undefined));
    expect(state.loadingStatus).toBe('loading');

    state = brandsReducer(
      state,
      fetchBrands.fulfilled([{ id: '1' } as any], '', undefined)
    );
    expect(state.loadingStatus).toBe('loaded');
    expect(state.entities['1']).toEqual(expect.objectContaining({ id: '1' }));

    state = brandsReducer(
      state,
      fetchBrands.rejected(new Error('Uh oh'), '', undefined)
    );
    expect(state.loadingStatus).toBe('error');
    expect(state.error).toBe('Uh oh');
  });
});
