
import {
  fetchBrands,
  BrandsAdapter,
  BrandsReducer,
} from './brands.slice';

describe('Brands reducer', () => {
  it('should handle initial state', () => {
    const expected = BrandsAdapter.getInitialState({
      loadingStatus: 'not loaded',
      error: null,
    });

    expect(BrandsReducer(undefined, { type: '' })).toEqual(expected);
  });

  it('should handle fetchBrands', () => {
    let state = brandsReducer(
      undefined,
      fetchBrands.pending(null, null)
    );

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loading',
        error: null,
        entities: {},
      })
    );

    state = brandsReducer(
      state,
      fetchBrands.fulfilled([{ id: 1 }], null, null)
    );

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loaded',
        error: null,
        entities: { 1: { id: 1 } },
      })
    );

    state = brandsReducer(
      state,
      fetchBrands.rejected(new Error('Uh oh'), null, null)
    );

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'error',
        error: 'Uh oh',
        entities: { 1: { id: 1 } },
      })
    );
  });
});
