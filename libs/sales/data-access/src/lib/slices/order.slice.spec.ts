import { fetchOrder, orderAdapter, orderReducer } from './order.slice';

describe('order reducer', () => {
    it('should handle initial state', () => {
        const expected = orderAdapter.getInitialState({
            loadingStatus: 'not loaded',
            error: null,
        });

        expect(orderReducer(undefined, { type: '' })).toEqual(expected);
    });

    it('should handle fetchOrders', () => {
        let state = orderReducer(undefined, fetchOrder.pending(null, null));

        expect(state).toEqual(
            expect.objectContaining({
                loadingStatus: 'loading',
                error: null,
                entities: {},
            })
        );

        state = orderReducer(
            state,
            fetchOrder.fulfilled([{ id: 1 }], null, null)
        );

        expect(state).toEqual(
            expect.objectContaining({
                loadingStatus: 'loaded',
                error: null,
                entities: { 1: { id: 1 } },
            })
        );

        state = orderReducer(
            state,
            fetchOrder.rejected(new Error('Uh oh'), null, null)
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
