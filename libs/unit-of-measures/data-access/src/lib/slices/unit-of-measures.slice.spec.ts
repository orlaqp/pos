
import {
  fetchUnitOfMeasures,
  unitOfMeasuresAdapter,
  unitOfMeasuresReducer,
} from './unit-of-measures.slice';

describe('UnitOfMeasures reducer', () => {
  it('should handle initial state', () => {
    const expected = unitOfMeasuresAdapter.getInitialState({
      loadingStatus: 'not loaded',
      selected: undefined,
      filterQuery: undefined,
      filteredList: undefined,
    });

    expect(unitOfMeasuresReducer(undefined, { type: '' })).toEqual(expected);
  });

  it('should handle fetchUnitOfMeasures', () => {
    let state = unitOfMeasuresReducer(
      undefined,
      fetchUnitOfMeasures.pending(null, null)
    );

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loading',
        entities: {},
      })
    );

    state = unitOfMeasuresReducer(
      state,
      fetchUnitOfMeasures.fulfilled([{ id: 1 }], null, null)
    );

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loaded',
        entities: { 1: expect.objectContaining({ id: 1 }) },
      })
    );

    state = unitOfMeasuresReducer(
      state,
      fetchUnitOfMeasures.rejected(new Error('Uh oh'), null, null)
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
