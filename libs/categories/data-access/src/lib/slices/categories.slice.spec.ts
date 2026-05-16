import {
  categoriesAdapter,
  categoriesActions,
  categoriesReducer,
  fetchCategories,
  initialCategoriesState,
} from './categories.slice';

describe('categories reducer', () => {
  it('returns initial state', () => {
    expect(categoriesReducer(undefined, { type: '' })).toEqual(initialCategoriesState);
  });

  it('handles fetchCategories pending/fulfilled/rejected', () => {
    let state = categoriesReducer(undefined, fetchCategories.pending('', undefined));
    expect(state.loadingStatus).toBe('loading');

    state = categoriesReducer(
      state,
      fetchCategories.fulfilled([{ id: '1' } as any], '', undefined)
    );
    expect(state.loadingStatus).toBe('loaded');
    expect(state.entities['1']).toEqual(expect.objectContaining({ id: '1' }));

    state = categoriesReducer(
      state,
      fetchCategories.rejected(new Error('Uh oh'), '', undefined)
    );
    expect(state.loadingStatus).toBe('error');
    expect(state.error).toBe('Uh oh');
  });

  it('adds/removes entities', () => {
    let state = categoriesReducer(undefined, { type: '' });
    state = categoriesReducer(state, categoriesActions.add({ id: '2' } as any));
    expect(categoriesAdapter.getSelectors().selectById(state, '2')).toBeTruthy();
  });
});
