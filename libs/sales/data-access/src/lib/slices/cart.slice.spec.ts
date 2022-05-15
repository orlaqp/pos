import {
    fetchSlicesCart,
    slicesCartAdapter,
    slicesCartReducer,
} from './slices/cart.slice';

describe('slicesCart reducer', () => {
    it('should handle initial state', () => {
        const expected = slicesCartAdapter.getInitialState({
            loadingStatus: 'not loaded',
            error: null,
        });

        expect(slicesCartReducer(undefined, { type: '' })).toEqual(expected);
    });

    it('should handle fetchSlicesCarts', () => {
        let state = slicesCartReducer(
            undefined,
            fetchSlicesCart.pending(null, null)
        );

        expect(state).toEqual(
            expect.objectContaining({
                loadingStatus: 'loading',
                error: null,
                entities: {},
            })
        );

        state = slicesCartReducer(
            state,
            fetchSlicesCart.fulfilled([{ id: 1 }], null, null)
        );

        expect(state).toEqual(
            expect.objectContaining({
                loadingStatus: 'loaded',
                error: null,
                entities: { 1: { id: 1 } },
            })
        );

        state = slicesCartReducer(
            state,
            fetchSlicesCart.rejected(new Error('Uh oh'), null, null)
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
