
import {
  fetchOrders,
  OrdersAdapter,
  OrdersReducer,
} from './orders.slice';

describe('Orders reducer', () => {
  it('should handle initial state', () => {
    const expected = OrdersAdapter.getInitialState({
      loadingStatus: 'not loaded',
      error: null,
    });

    expect(OrdersReducer(undefined, { type: '' })).toEqual(expected);
  });

  it('should handle fetchOrders', () => {
    let state = ordersReducer(
      undefined,
      fetchOrders.pending(null, null)
    );

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loading',
        error: null,
        entities: {},
      })
    );

    state = ordersReducer(
      state,
      fetchOrders.fulfilled([{ id: 1 }], null, null)
    );

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loaded',
        error: null,
        entities: { 1: { id: 1 } },
      })
    );

    state = ordersReducer(
      state,
      fetchOrders.rejected(new Error('Uh oh'), null, null)
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
