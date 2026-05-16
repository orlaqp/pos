import { Dispatch } from '@reduxjs/toolkit';
import { trackSyncSubscription } from '@pos/shared/utils';
import { getDataStoreLifecycleState } from '@pos/shared/amplify';
import { eventsActions, SyncHealthEntry, SyncHealthStatus } from './events.slice';

type ObserveQueryEmission<TItem> = {
    isSynced: boolean;
    items: TItem[];
};

type ObserveQuerySource<TItem> = {
    subscribe: (handlers: {
        next?: (value: ObserveQueryEmission<TItem>) => void;
        error?: (error: unknown) => void;
    }) => {
        unsubscribe: () => void;
    };
};

type ObserveQuerySnapshotContext = {
    isSynced: boolean;
    replay: boolean;
};

type ObserveQuerySnapshotPublisher<TSnapshot> = (
    dispatch: Dispatch,
    snapshot: TSnapshot,
    context: ObserveQuerySnapshotContext
) => void;

type SyncHealthChanges = Partial<
    Pick<
        SyncHealthEntry,
        | 'status'
        | 'subscriberCount'
        | 'tenantId'
        | 'lastSnapshotAt'
        | 'lastRecoveryAttemptAt'
        | 'lastRecoveryError'
        | 'lastError'
    >
>;

type SharedObserveQueryManagerOptions<TItem, TSnapshot> = {
    model: string;
    trackKey: string;
    observeQuery: (tenantId?: string) => ObserveQuerySource<TItem>;
    mapSnapshot: (emission: ObserveQueryEmission<TItem>) => TSnapshot;
    publishSnapshot: ObserveQuerySnapshotPublisher<TSnapshot>;
    onError?: (error: unknown) => void;
    onReset?: () => void;
    staleThresholdMs?: number;
    silentRecoveryThresholdMs?: number;
};

type EnsureHealthyOptions = {
    staleAfterMs?: number;
    tenantId?: string;
};

const DEFAULT_STALE_THRESHOLD_MS = 60_000;

const toErrorMessage = (error: unknown) =>
    error instanceof Error ? error.message : String(error);

const isRetryableObserveError = (error: unknown) => {
    const message = toErrorMessage(error);

    return (
        message.includes('while DataStore was "Stopping"') ||
        message.includes('while DataStore was "Starting"') ||
        message.includes('BackgroundManagerNotOpenError')
    );
};

export const createSharedObserveQueryManager = <TItem, TSnapshot>(
    options: SharedObserveQueryManagerOptions<TItem, TSnapshot>
) => {
    const dispatchRefs = new Map<Dispatch, number>();

    let sharedSubscription:
        | {
              unsubscribe: () => void;
          }
        | undefined;
    let snapshot: TSnapshot | undefined;
    let hasSnapshot = false;
    let lastIsSynced = false;
    let activeTenantId: string | undefined;
    let lastSubscriptionStartedAt: string | undefined;
    let lastSnapshotAt: string | undefined;
    let lastRecoveryAttemptAt: string | undefined;
    let lastRecoveryError: string | undefined;
    let lastError: string | undefined;
    let recoveryRetryCount = 0;
    let recoveryTimer: ReturnType<typeof setTimeout> | undefined;

    const staleThresholdMs =
        options.staleThresholdMs ?? DEFAULT_STALE_THRESHOLD_MS;
    const silentRecoveryThresholdMs =
        options.silentRecoveryThresholdMs ?? staleThresholdMs * 5;

    const getSubscriberCount = () => {
        let count = 0;
        dispatchRefs.forEach((dispatchCount) => {
            count += dispatchCount;
        });
        return count;
    };

    const getCurrentStatus = (): SyncHealthStatus => {
        if (!sharedSubscription) {
            return 'idle';
        }

        return hasSnapshot ? 'healthy' : 'subscribing';
    };

    const updateSyncHealth = (dispatch: Dispatch, changes: SyncHealthChanges) => {
        dispatch(
            eventsActions.updateSyncHealth({
                model: options.model,
                changes: {
                    status: getCurrentStatus(),
                    tenantId: activeTenantId,
                    subscriberCount: getSubscriberCount(),
                    ...changes,
                },
            })
        );
    };

    const broadcastSyncHealth = (changes: SyncHealthChanges) => {
        if (dispatchRefs.size === 0) {
            return;
        }

        dispatchRefs.forEach((_, activeDispatch) => {
            updateSyncHealth(activeDispatch, changes);
        });
    };

    const publishSnapshot = (
        nextSnapshot: TSnapshot,
        context: ObserveQuerySnapshotContext
    ) => {
        snapshot = nextSnapshot;
        hasSnapshot = true;
        dispatchRefs.forEach((_, activeDispatch) => {
            options.publishSnapshot(activeDispatch, nextSnapshot, context);
        });
    };

    const teardownSharedSubscription = () => {
        sharedSubscription?.unsubscribe();
        sharedSubscription = undefined;
        if (recoveryTimer) {
            clearTimeout(recoveryTimer);
            recoveryTimer = undefined;
        }
    };

    const resetState = () => {
        teardownSharedSubscription();
        snapshot = undefined;
        hasSnapshot = false;
        lastIsSynced = false;
        activeTenantId = undefined;
        lastSubscriptionStartedAt = undefined;
        lastSnapshotAt = undefined;
        lastRecoveryAttemptAt = undefined;
        lastRecoveryError = undefined;
        lastError = undefined;
        recoveryRetryCount = 0;
        options.onReset?.();
    };

    const startSharedSubscription = (dispatch: Dispatch, tenantId?: string) => {
        const lifecycleState = getDataStoreLifecycleState();
        if (lifecycleState === 'starting' || lifecycleState === 'stopping') {
            scheduleRecovery(
                dispatch,
                `DataStore lifecycle settling (${lifecycleState})`
            );
            return;
        }

        activeTenantId = tenantId;
        lastSubscriptionStartedAt = new Date().toISOString();
        updateSyncHealth(dispatch, {
            status: 'subscribing',
            lastError: undefined,
            lastRecoveryError,
        });

        const release = trackSyncSubscription(options.trackKey);
        let releaseCalled = false;
        const releaseOnce = () => {
            if (releaseCalled) {
                return;
            }
            releaseCalled = true;
            release();
        };

        try {
            const observeSubscription = options
                .observeQuery(tenantId)
                .subscribe({
                    next: (emission) => {
                        const nextSnapshot = options.mapSnapshot(emission);
                        lastIsSynced = emission.isSynced;
                        recoveryRetryCount = 0;
                        lastError = undefined;
                        lastSnapshotAt = new Date().toISOString();
                        publishSnapshot(nextSnapshot, {
                            isSynced: emission.isSynced,
                            replay: false,
                        });
                        broadcastSyncHealth({
                            status: 'healthy',
                            lastSnapshotAt,
                            lastError: undefined,
                        });
                    },
                    error: (error) => {
                        releaseOnce();
                        if (isRetryableObserveError(error)) {
                            scheduleRecovery(dispatch, 'observeQuery retryable error', error);
                            return;
                        }

                        lastError = toErrorMessage(error);
                        console.error(
                            `[${options.model}.sync] shared subscription failed`,
                            error
                        );
                        options.onError?.(error);
                        broadcastSyncHealth({
                            status: 'error',
                            lastError,
                        });
                        scheduleRecovery(dispatch, 'observeQuery error', error);
                    },
                });

            sharedSubscription = {
                unsubscribe() {
                    observeSubscription.unsubscribe();
                    releaseOnce();
                },
            };
        } catch (error) {
            releaseOnce();
            if (isRetryableObserveError(error)) {
                scheduleRecovery(dispatch, 'observeQuery setup retryable error', error);
                return;
            }

            lastError = toErrorMessage(error);
            options.onError?.(error);
            broadcastSyncHealth({
                status: 'error',
                lastError,
            });
            throw error;
        }
    };

    const restart = async (
        dispatch: Dispatch,
        reason = 'manual',
        tenantId?: string
    ) => {
        teardownSharedSubscription();
        startSharedSubscription(dispatch, tenantId ?? activeTenantId);
        return reason;
    };

    const scheduleRecovery = (
        dispatch: Dispatch,
        reason: string,
        error?: unknown
    ) => {
        lastRecoveryAttemptAt = new Date().toISOString();
        lastRecoveryError = error ? toErrorMessage(error) : undefined;
        recoveryRetryCount += 1;

        updateSyncHealth(dispatch, {
            status: 'recovering',
            lastRecoveryAttemptAt,
            lastRecoveryError: lastRecoveryError || `Recovery requested: ${reason}`,
        });

        if (recoveryTimer) {
            return;
        }

        const delayMs = Math.min(
            1_000 * 2 ** Math.max(0, recoveryRetryCount - 1),
            5_000
        );

        recoveryTimer = setTimeout(() => {
            recoveryTimer = undefined;
            void restart(dispatch, reason);
        }, delayMs);
    };

    const subscribe = (dispatch: Dispatch, tenantId?: string) => {
        const currentCount = dispatchRefs.get(dispatch) || 0;
        dispatchRefs.set(dispatch, currentCount + 1);

        if (tenantId && tenantId !== activeTenantId && sharedSubscription) {
            resetState();
        }

        if (!sharedSubscription) {
            startSharedSubscription(dispatch, tenantId);
        } else if (hasSnapshot && snapshot !== undefined) {
            options.publishSnapshot(dispatch, snapshot, {
                isSynced: lastIsSynced,
                replay: true,
            });
        }

        updateSyncHealth(dispatch, {
            status: getCurrentStatus(),
            lastSnapshotAt,
            lastRecoveryAttemptAt,
            lastRecoveryError,
            lastError,
        });

        return {
            unsubscribe() {
                const nextCount = (dispatchRefs.get(dispatch) || 1) - 1;

                if (nextCount <= 0) {
                    dispatchRefs.delete(dispatch);
                } else {
                    dispatchRefs.set(dispatch, nextCount);
                }

                if (dispatchRefs.size === 0) {
                    resetState();
                    dispatch(eventsActions.clearSyncHealth({ model: options.model }));
                    return;
                }

                broadcastSyncHealth({
                    subscriberCount: getSubscriberCount(),
                });
            },
        };
    };

    const ensureHealthy = async (
        dispatch: Dispatch,
        ensureOptions?: EnsureHealthyOptions
    ) => {
        const tenantId = ensureOptions?.tenantId;
        const staleAfterMs =
            ensureOptions?.staleAfterMs ?? staleThresholdMs;
        const silentRecoveryAfterMs = Math.max(
            staleAfterMs,
            silentRecoveryThresholdMs
        );
        const now = Date.now();
        const lastSignalAt = lastSnapshotAt
            ? new Date(lastSnapshotAt).getTime()
            : 0;
        const subscriptionStartedAt = lastSubscriptionStartedAt
            ? new Date(lastSubscriptionStartedAt).getTime()
            : 0;

        if (tenantId && tenantId !== activeTenantId) {
            resetState();
            await restart(dispatch, 'tenant changed', tenantId);
            return true;
        }

        if (!sharedSubscription) {
            if (getSubscriberCount() === 0) {
                return false;
            }

            await restart(dispatch, 'missing shared subscription', tenantId);
            return true;
        }

        if (
            !lastSignalAt &&
            subscriptionStartedAt &&
            now - subscriptionStartedAt > staleAfterMs
        ) {
            updateSyncHealth(dispatch, {
                status: 'stale',
            });
            scheduleRecovery(dispatch, 'stale subscription');
            return true;
        }

        if (
            lastSignalAt &&
            now - lastSignalAt > silentRecoveryAfterMs &&
            (!lastRecoveryAttemptAt ||
                now - new Date(lastRecoveryAttemptAt).getTime() >
                    silentRecoveryAfterMs)
        ) {
            updateSyncHealth(dispatch, {
                status: 'stale',
                lastSnapshotAt,
            });
            scheduleRecovery(
                dispatch,
                `no ${options.model} sync signal for ${Math.round(
                    (now - lastSignalAt) / 1000
                )}s`
            );
            return true;
        }

        updateSyncHealth(dispatch, {
            status: getCurrentStatus(),
        });
        return false;
    };

    return {
        subscribe,
        ensureHealthy,
        restart,
        teardown: resetState,
    };
};
