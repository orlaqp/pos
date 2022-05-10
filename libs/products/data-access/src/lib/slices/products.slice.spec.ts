
import {
  fetchProducts,
  ProductsAdapter,
  ProductsReducer,
} from './products.slice';

describe('Products reducer', () => {
  it('should handle initial state', () => {
    const expected = ProductsAdapter.getInitialState({
      loadingStatus: 'not loaded',
      error: null,
    });

    expect(ProductsReducer(undefined, { type: '' })).toEqual(expected);
  });

  it('should handle fetchProducts', () => {
    let state = productsReducer(
      undefined,
      fetchProducts.pending(null, null)
    );

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loading',
        error: null,
        entities: {},
      })
    );

    state = productsReducer(
      state,
      fetchProducts.fulfilled([{ id: 1 }], null, null)
    );

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loaded',
        error: null,
        entities: { 1: { id: 1 } },
      })
    );

    state = productsReducer(
      state,
      fetchProducts.rejected(new Error('Uh oh'), null, null)
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
