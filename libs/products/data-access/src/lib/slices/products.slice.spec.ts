import { fetchProducts, productsActions, productsAdapter, productsReducer } from './products.slice';

describe('products reducer', () => {
  it('returns initial state', () => {
    expect(productsReducer(undefined, { type: '' })).toEqual(
      productsAdapter.getInitialState({
        loadingStatus: 'not loaded',
        selected: undefined,
        filterQuery: undefined,
        filteredList: undefined,
        pendingQuantityDeltas: {},
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

  it('applies quantity deltas to existing products', () => {
    let state = productsReducer(
      undefined,
      fetchProducts.fulfilled(
        [
          { id: '1', quantity: 4 } as any,
          { id: '2', quantity: 10 } as any,
        ],
        '',
        undefined
      )
    );

    state = productsReducer(
      state,
      productsActions.applyQuantityDeltas([
        { productId: '1', delta: 4 },
        { productId: '2', delta: -2 },
        { productId: 'missing', delta: 7 },
      ])
    );

    expect(state.entities['1']).toEqual(expect.objectContaining({ id: '1', quantity: 8 }));
    expect(state.entities['2']).toEqual(expect.objectContaining({ id: '2', quantity: 8 }));
  });

  it('keeps the selected product in sync when quantities change', () => {
    let state = productsReducer(
      undefined,
      fetchProducts.fulfilled([{ id: '1', name: 'Alpha', quantity: 4 } as any], '', undefined)
    );

    state = productsReducer(
      state,
      productsActions.select({ id: '1', name: 'Alpha', quantity: 4 } as any)
    );

    state = productsReducer(
      state,
      productsActions.updateQuantities([{ productId: '1', newCount: 9 }])
    );

    expect(state.selected).toEqual(
      expect.objectContaining({ id: '1', quantity: 9 })
    );

    state = productsReducer(
      state,
      productsActions.applyQuantityDeltas([{ productId: '1', delta: -2 }])
    );

    expect(state.selected).toEqual(
      expect.objectContaining({ id: '1', quantity: 7 })
    );
  });

  it('preserves optimistic deltas across stale setAll payloads until DataStore catches up', () => {
    let state = productsReducer(
      undefined,
      fetchProducts.fulfilled([{ id: '1', quantity: 4 } as any], '', undefined)
    );

    state = productsReducer(
      state,
      productsActions.applyQuantityDeltas([{ productId: '1', delta: 4 }])
    );
    expect(state.entities['1']).toEqual(expect.objectContaining({ id: '1', quantity: 8 }));

    state = productsReducer(
      state,
      productsActions.setAll([{ id: '1', quantity: 4 } as any])
    );
    expect(state.entities['1']).toEqual(expect.objectContaining({ id: '1', quantity: 8 }));

    state = productsReducer(
      state,
      productsActions.setAll([{ id: '1', quantity: 8 } as any])
    );
    expect(state.entities['1']).toEqual(expect.objectContaining({ id: '1', quantity: 8 }));
  });

  it('applies realtime patches and clears pending deltas for that product', () => {
    let state = productsReducer(
      undefined,
      fetchProducts.fulfilled(
        [{ id: '1', name: 'Aceitunas Jumbo', quantity: 16 } as any],
        '',
        undefined
      )
    );

    state = productsReducer(
      state,
      productsActions.applyQuantityDeltas([{ productId: '1', delta: 16 }])
    );
    expect(state.entities['1']).toEqual(expect.objectContaining({ id: '1', quantity: 32 }));

    state = productsReducer(
      state,
      productsActions.applyRealtimePatch({
        id: '1',
        quantity: 32,
        updatedAt: '2026-04-01T17:25:46.303Z',
      })
    );

    expect(state.entities['1']).toEqual(
      expect.objectContaining({
        id: '1',
        quantity: 32,
        updatedAt: '2026-04-01T17:25:46.303Z',
      })
    );
    expect(state.pendingQuantityDeltas).toEqual({});
  });

  it('reconciles incoming snapshots without losing sorted order or removing unchanged items', () => {
    let state = productsReducer(
      undefined,
      fetchProducts.fulfilled(
        [
          { id: '2', name: 'Zulu', quantity: 2, isActive: true } as any,
          { id: '1', name: 'Alpha', quantity: 1, isActive: true } as any,
        ],
        '',
        undefined
      )
    );

    state = productsReducer(
      state,
      productsActions.setAll([
        { id: '1', name: 'Alpha', quantity: 3, isActive: true } as any,
        { id: '3', name: 'Bravo', quantity: 4, isActive: true } as any,
      ])
    );

    expect(state.ids).toEqual(['1', '3']);
    expect(state.entities['1']).toEqual(
      expect.objectContaining({ id: '1', quantity: 3 })
    );
    expect(state.entities['3']).toEqual(
      expect.objectContaining({ id: '3', name: 'Bravo' })
    );
    expect(state.entities['2']).toBeUndefined();
  });

  it('ignores older snapshots when a newer product update is already in state', () => {
    let state = productsReducer(
      undefined,
      fetchProducts.fulfilled(
        [
          {
            id: '1',
            name: 'Alpha',
            quantity: 7,
            updatedAt: '2026-04-18T12:40:00.000Z',
            isActive: true,
          } as any,
        ],
        '',
        undefined
      )
    );

    state = productsReducer(
      state,
      productsActions.setAll([
        {
          id: '1',
          name: 'Alpha',
          quantity: 5,
          updatedAt: '2026-04-18T12:39:00.000Z',
          isActive: true,
        } as any,
      ])
    );

    expect(state.entities['1']).toEqual(
      expect.objectContaining({
        id: '1',
        quantity: 7,
        updatedAt: '2026-04-18T12:40:00.000Z',
      })
    );
  });

  it('keeps the selected product synced to incoming snapshots and clears it when removed', () => {
    let state = productsReducer(
      undefined,
      fetchProducts.fulfilled([{ id: '1', name: 'Alpha', quantity: 1, isActive: true } as any], '', undefined)
    );

    state = productsReducer(
      state,
      productsActions.select({ id: '1', name: 'Alpha', quantity: 1, isActive: true } as any)
    );

    state = productsReducer(
      state,
      productsActions.setAll([{ id: '1', name: 'Alpha', quantity: 5, isActive: true } as any])
    );

    expect(state.selected).toEqual(
      expect.objectContaining({ id: '1', quantity: 5 })
    );

    state = productsReducer(state, productsActions.setAll([]));

    expect(state.selected).toBeUndefined();
  });
});
