import { ordersActions, ordersReducer, initialOrdersState } from './orders.slice';

describe('orders reducer', () => {
  it('returns initial state', () => {
    expect(ordersReducer(undefined, { type: '' })).toEqual(initialOrdersState);
  });

  it('handles setAll/filter/remove', () => {
    const items = [
      { id: 'o1', status: 'OPEN', orderNo: 'N1' },
      { id: 'o2', status: 'PAID', orderNo: 'N2' },
    ] as any[];
    let state = ordersReducer(undefined, ordersActions.setAll(items as any));
    expect(state.loadingStatus).toBe('loaded');
    expect(state.ids).toHaveLength(2);

    state = ordersReducer(state, ordersActions.filter({ status: 'OPEN' } as any));
    expect(state.filterQuery).toEqual({ status: 'OPEN' });

    state = ordersReducer(state, ordersActions.remove('o2'));
    expect(state.entities['o2']).toBeUndefined();
  });
});
