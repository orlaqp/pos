export type DataStoreUnauthorizedRecoveryContext = {
    source: string;
    userId?: string;
    tenantId?: string;
    graphqlEndpoint?: string;
};

export const buildDataStoreUnauthorizedRecoveryKey = ({
    source,
    userId,
    tenantId,
    graphqlEndpoint,
}: DataStoreUnauthorizedRecoveryContext) =>
    [source, userId || 'unknown-user', tenantId || 'unknown-tenant', graphqlEndpoint || 'unknown-endpoint'].join(
        '::'
    );

export const shouldForceLoginAfterUnauthorizedRetry = ({
    lastRecoveryKey,
    nextRecoveryKey,
}: {
    lastRecoveryKey?: string | null;
    nextRecoveryKey: string;
}) => lastRecoveryKey === nextRecoveryKey;
