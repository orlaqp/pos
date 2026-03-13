import { fetchProducts, productsAdapter, productsReducer } from './products.slice';

describe('products reducer', () => {
  it('returns initial state', () => {
    expect(productsReducer(undefined, { type: '' })).toEqual(
      productsAdapter.getInitialState({
        loadingStatus: 'not loaded',
        selected: undefined,
        filterQuery: undefined,
        filteredList: undefined,
      })
    );
  });

  it('handles fetchProducts pending/fulfilled/rejected', () => {
    let state = productsReducer(undefined, fetchProducts.pending('', undefined));
    expect(state.loadingStatus).toBe('loading');

    state = productsReducer(
      state,
      fetchProducts.fulfilled([{ id: '1' } as any], '', undefined)
    );
    expect(state.loadingStatus).toBe('loaded');
    expect(state.entities['1']).toEqual(expect.objectContaining({ id: '1' }));

    state = productsReducer(
      state,
      fetchProducts.rejected(new Error('Uh oh'), '', undefined)
    );
    expect(state.loadingStatus).toBe('error');
    expect(state.error).toBe('Uh oh');
  });
});
