import {
  fetchCategories,
  categoriesAdapter,
  categoriesReducer,
} from './categories.slice';

describe('categories reducer', () => {
  it('should handle initial state', () => {
    const expected = categoriesAdapter.getInitialState({
      loadingStatus: 'not loaded',
      error: null,
    });

    expect(categoriesReducer(undefined, { type: '' })).toEqual(expected);
  });

  it('should handle fetchCategoriess', () => {
    let state = categoriesReducer(
      undefined,
      fetchCategories.pending(null, null)
    );

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loading',
        error: null,
        entities: {},
      })
    );

    state = categoriesReducer(
      state,
      fetchCategories.fulfilled([{ id: 1 }], null, null)
    );

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loaded',
        error: null,
        entities: { 1: { id: 1 } },
      })
    );

    state = categoriesReducer(
      state,
      fetchCategories.rejected(new Error('Uh oh'), null, null)
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
