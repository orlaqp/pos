const activeSubscriptions = new Map<string, number>();

const formatDetails = (details?: Record<string, unknown>) => {
    if (!details || Object.keys(details).length === 0) {
        return '';
    }

    try {
        return ` ${JSON.stringify(details)}`;
    } catch {
        return '';
    }
};

export const logSyncDebug = (
    scope: string,
    message: string,
    details?: Record<string, unknown>
) => {
    console.log(`[sync][${scope}] ${message}${formatDetails(details)}`);
};

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
