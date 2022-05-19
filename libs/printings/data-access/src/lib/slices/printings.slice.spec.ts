
import {
  fetchPrintings,
  PrintingsAdapter,
  PrintingsReducer,
} from './printings.slice';

describe('Printings reducer', () => {
  it('should handle initial state', () => {
    const expected = PrintingsAdapter.getInitialState({
      loadingStatus: 'not loaded',
      error: null,
    });

    expect(PrintingsReducer(undefined, { type: '' })).toEqual(expected);
  });

  it('should handle fetchPrintings', () => {
    let state = printingsReducer(
      undefined,
      fetchPrintings.pending(null, null)
    );

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loading',
        error: null,
        entities: {},
      })
    );

    state = printingsReducer(
      state,
      fetchPrintings.fulfilled([{ id: 1 }], null, null)
    );

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loaded',
        error: null,
        entities: { 1: { id: 1 } },
      })
    );

    state = printingsReducer(
      state,
      fetchPrintings.rejected(new Error('Uh oh'), null, null)
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
