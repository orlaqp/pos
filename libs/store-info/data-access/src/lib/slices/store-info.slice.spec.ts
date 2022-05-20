import {
    fetchStoreInfo,
    storeInfoAdapter,
    storeInfoReducer,
} from './store-info.slice';

describe('storeInfo reducer', () => {
    it('should handle initial state', () => {
        const expected = storeInfoAdapter.getInitialState({
            loadingStatus: 'not loaded',
            error: null,
        });

        expect(storeInfoReducer(undefined, { type: '' })).toEqual(expected);
    });

    it('should handle fetchStoreInfos', () => {
        let state = storeInfoReducer(
            undefined,
            fetchStoreInfo.pending(null, null)
        );

        expect(state).toEqual(
            expect.objectContaining({
                loadingStatus: 'loading',
                error: null,
                entities: {},
            })
        );

        state = storeInfoReducer(
            state,
            fetchStoreInfo.fulfilled([{ id: 1 }], null, null)
        );

        expect(state).toEqual(
            expect.objectContaining({
                loadingStatus: 'loaded',
                error: null,
                entities: { 1: { id: 1 } },
            })
        );

        state = storeInfoReducer(
            state,
            fetchStoreInfo.rejected(new Error('Uh oh'), null, null)
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
