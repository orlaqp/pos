const activeSubscriptions = new Map<string, number>();

export const logSyncDebug = (
    _scope: string,
    _message: string,
    _details?: Record<string, unknown>
) => {};

export const startSyncMeasure = (
    scope: string,
    operation: string,
    details?: Record<string, unknown>
) => {
    const startedAt = Date.now();
    logSyncDebug(scope, `${operation}:start`, details);

    return (resultDetails?: Record<string, unknown>) => {
        logSyncDebug(scope, `${operation}:done`, {
            durationMs: Date.now() - startedAt,
            ...resultDetails,
        });
    };
};

export const trackSyncSubscription = (scope: string) => {
    const currentCount = activeSubscriptions.get(scope) || 0;
    const nextCount = currentCount + 1;
    activeSubscriptions.set(scope, nextCount);
    logSyncDebug(scope, 'subscription:open', {
        activeSubscriptions: nextCount,
    });

    return () => {
        const latestCount = activeSubscriptions.get(scope) || 0;
        const remaining = Math.max(0, latestCount - 1);
        activeSubscriptions.set(scope, remaining);
        logSyncDebug(scope, 'subscription:close', {
            activeSubscriptions: remaining,
        });
    };
};
