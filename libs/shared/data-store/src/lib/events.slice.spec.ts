import { fetchEvents, eventsAdapter, eventsReducer } from './events.slice';

describe('events reducer', () => {
    it('should handle initial state', () => {
        const expected = eventsAdapter.getInitialState({
            loadingStatus: 'not loaded',
            error: null,
        });

        expect(eventsReducer(undefined, { type: '' })).toEqual(expected);
    });

    it('should handle fetchEventss', () => {
        let state = eventsReducer(undefined, fetchEvents.pending(null, null));

        expect(state).toEqual(
            expect.objectContaining({
                loadingStatus: 'loading',
                error: null,
                entities: {},
            })
        );

        state = eventsReducer(
            state,
            fetchEvents.fulfilled([{ id: 1 }], null, null)
        );

        expect(state).toEqual(
            expect.objectContaining({
                loadingStatus: 'loaded',
                error: null,
                entities: { 1: { id: 1 } },
            })
        );

        state = eventsReducer(
            state,
            fetchEvents.rejected(new Error('Uh oh'), null, null)
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
