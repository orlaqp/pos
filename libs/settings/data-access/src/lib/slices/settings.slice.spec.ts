import {
    fetchSettings,
    settingsAdapter,
    settingsReducer,
} from './settings.slice';

describe('settings reducer', () => {
    it('should handle initial state', () => {
        const expected = settingsAdapter.getInitialState({
            loadingStatus: 'not loaded',
            error: null,
        });

        expect(settingsReducer(undefined, { type: '' })).toEqual(expected);
    });

    it('should handle fetchSettingss', () => {
        let state = settingsReducer(
            undefined,
            fetchSettings.pending(null, null)
        );

        expect(state).toEqual(
            expect.objectContaining({
                loadingStatus: 'loading',
                error: null,
                entities: {},
            })
        );

        state = settingsReducer(
            state,
            fetchSettings.fulfilled([{ id: 1 }], null, null)
        );

        expect(state).toEqual(
            expect.objectContaining({
                loadingStatus: 'loaded',
                error: null,
                entities: { 1: { id: 1 } },
            })
        );

        state = settingsReducer(
            state,
            fetchSettings.rejected(new Error('Uh oh'), null, null)
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
