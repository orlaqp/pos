import {
    fetchAwsConfig,
    awsConfigAdapter,
    awsConfigReducer,
} from './aws-config.slice';

describe('awsConfig reducer', () => {
    it('should handle initial state', () => {
        const expected = awsConfigAdapter.getInitialState({
            loadingStatus: 'not loaded',
            error: null,
        });

        expect(awsConfigReducer(undefined, { type: '' })).toEqual(expected);
    });

    it('should handle fetchAwsConfigs', () => {
        let state = awsConfigReducer(
            undefined,
            fetchAwsConfig.pending(null, null)
        );

        expect(state).toEqual(
            expect.objectContaining({
                loadingStatus: 'loading',
                error: null,
                entities: {},
            })
        );

        state = awsConfigReducer(
            state,
            fetchAwsConfig.fulfilled([{ id: 1 }], null, null)
        );

        expect(state).toEqual(
            expect.objectContaining({
                loadingStatus: 'loaded',
                error: null,
                entities: { 1: { id: 1 } },
            })
        );

        state = awsConfigReducer(
            state,
            fetchAwsConfig.rejected(new Error('Uh oh'), null, null)
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
