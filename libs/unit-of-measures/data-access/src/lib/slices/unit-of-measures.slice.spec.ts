
import {
  fetchUnitOfMeasures,
  UnitOfMeasuresAdapter,
  UnitOfMeasuresReducer,
} from './unit-of-measures.slice';

describe('UnitOfMeasures reducer', () => {
  it('should handle initial state', () => {
    const expected = UnitOfMeasuresAdapter.getInitialState({
      loadingStatus: 'not loaded',
      error: null,
    });

    expect(UnitOfMeasuresReducer(undefined, { type: '' })).toEqual(expected);
  });

  it('should handle fetchUnitOfMeasures', () => {
    let state = unitOfMeasuresReducer(
      undefined,
      fetchUnitOfMeasures.pending(null, null)
    );

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loading',
        error: null,
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
        error: null,
        entities: { 1: { id: 1 } },
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
