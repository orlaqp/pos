import {
    buildDataStoreUnauthorizedRecoveryKey,
    shouldForceLoginAfterUnauthorizedRetry,
} from './datastore-unauthorized-recovery';

describe('DataStore unauthorized recovery', () => {
    it('forces login when the same user and environment already retried unauthorized recovery', () => {
        const recoveryKey = buildDataStoreUnauthorizedRecoveryKey({
            source: 'DataStore.sync',
            userId: 'user-1',
            tenantId: 'tenant-1',
            graphqlEndpoint: 'https://prod.example/graphql',
        });

        expect(
            shouldForceLoginAfterUnauthorizedRetry({
                lastRecoveryKey: recoveryKey,
                nextRecoveryKey: recoveryKey,
            })
        ).toBe(true);
    });

    it('allows the first unauthorized recovery retry for a user and environment', () => {
        const recoveryKey = buildDataStoreUnauthorizedRecoveryKey({
            source: 'DataStore.sync',
            userId: 'user-1',
            tenantId: 'tenant-1',
            graphqlEndpoint: 'https://prod.example/graphql',
        });

        expect(
            shouldForceLoginAfterUnauthorizedRetry({
                lastRecoveryKey: null,
                nextRecoveryKey: recoveryKey,
            })
        ).toBe(false);
    });
});
