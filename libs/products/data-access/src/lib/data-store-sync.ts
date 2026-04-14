import { productsActions } from './slices/products.slice';
import { API, DataStore } from '@pos/shared/amplify';
import { Dispatch } from '@reduxjs/toolkit';
import { Product } from '@pos/shared/models';
import { ProductEntityMapper } from './product.entity';
import { sortListBy } from '@pos/shared/utils';
import { logSyncDebug, startSyncMeasure, trackSyncSubscription } from '@pos/shared/utils';

const onUpdateProductRealtime = /* GraphQL */ `
    subscription OnUpdateProductRealtime(
        $filter: ModelSubscriptionProductFilterInput
    ) {
        onUpdateProduct(filter: $filter) {
            id
            tenantId
            quantity
            updatedAt
            _version
            _lastChangedAt
            __typename
        }
    }
`;

const previousProductSnapshot = new Map<
    string,
    { quantity?: number; updatedAt?: string | null | undefined }
>();

const PRODUCT_SYNC_MODEL = 'products';
export const PRODUCT_SYNC_STALE_THRESHOLD_MS = 60_000;
const PRODUCT_SYNC_RECOVERY_BASE_DELAY_MS = 1_000;
const PRODUCT_SYNC_RECOVERY_MAX_DELAY_MS = 5_000;

const productDispatchRefs = new Map<Dispatch, number>();

let sharedProductObserveSubscription:
    | {
          unsubscribe: () => void;
      }
    | undefined;
let sharedProductRealtimeSubscription:
    | {
          unsubscribe: () => void;
      }
    | undefined;
let productSnapshot: Product[] = [];
let activeProductTenantId: string | undefined;
let productLastSubscriptionStartedAt: string | undefined;
let productLastSnapshotAt: string | undefined;
let productLastRealtimePatchAt: string | undefined;
let productLastRecoveryAttemptAt: string | undefined;
let productLastRecoveryError: string | undefined;
let productLastError: string | undefined;
let productRecoveryRetryCount = 0;
let productRecoveryTimer: ReturnType<typeof setTimeout> | undefined;

const isNotDeleted = (item: { _deleted?: boolean | null } | null | undefined) =>
    !!item && item._deleted !== true;

const toErrorMessage = (error: unknown) =>
    error instanceof Error ? error.message : String(error);

const getSubscriberCount = () => {
    let count = 0;
    productDispatchRefs.forEach((dispatchCount) => {
        count += dispatchCount;
    });
    return count;
};

type SyncHealthChanges = {
    status?: 'idle' | 'subscribing' | 'healthy' | 'stale' | 'recovering' | 'error';
    subscriberCount?: number;
    tenantId?: string;
    lastSnapshotAt?: string;
    lastRealtimePatchAt?: string;
    lastRecoveryAttemptAt?: string;
    lastRecoveryError?: string;
    lastError?: string;
};

const updateSyncHealthAction = (model: string, changes: SyncHealthChanges) => ({
    type: 'events/updateSyncHealth',
    payload: {
        model,
        changes,
    },
});

const clearSyncHealthAction = (model?: string) => ({
    type: 'events/clearSyncHealth',
    payload: model ? { model } : undefined,
});

const updateSyncHealth = (
    dispatch: Dispatch,
    changes: SyncHealthChanges
) => {
    dispatch(
        updateSyncHealthAction(PRODUCT_SYNC_MODEL, {
            tenantId: activeProductTenantId,
            subscriberCount: getSubscriberCount(),
            ...changes,
        })
    );
};

const broadcastSyncHealth = (
    changes: SyncHealthChanges
) => {
    if (productDispatchRefs.size === 0) {
        return;
    }

    productDispatchRefs.forEach((_, activeDispatch) => {
        updateSyncHealth(activeDispatch, changes);
    });
};

const publishSnapshot = (items: Product[]) => {
    productSnapshot = items;
    productDispatchRefs.forEach((_, activeDispatch) => {
        updateStore(activeDispatch, items);
    });
};

const teardownProductSubscriptions = () => {
    sharedProductObserveSubscription?.unsubscribe();
    sharedProductRealtimeSubscription?.unsubscribe();
    sharedProductObserveSubscription = undefined;
    sharedProductRealtimeSubscription = undefined;
    if (productRecoveryTimer) {
        clearTimeout(productRecoveryTimer);
        productRecoveryTimer = undefined;
    }
};

const resetProductSyncState = () => {
    teardownProductSubscriptions();
    productSnapshot = [];
    activeProductTenantId = undefined;
    productLastSubscriptionStartedAt = undefined;
    productLastSnapshotAt = undefined;
    productLastRealtimePatchAt = undefined;
    productLastRecoveryAttemptAt = undefined;
    productLastRecoveryError = undefined;
    productLastError = undefined;
    productRecoveryRetryCount = 0;
    previousProductSnapshot.clear();
};

export const teardownProductSync = () => {
    teardownProductSubscriptions();
    productSnapshot = [];
    activeProductTenantId = undefined;
    productLastSubscriptionStartedAt = undefined;
    productLastSnapshotAt = undefined;
    productLastRealtimePatchAt = undefined;
    productLastRecoveryAttemptAt = undefined;
    productLastRecoveryError = undefined;
    productLastError = undefined;
    productRecoveryRetryCount = 0;
    previousProductSnapshot.clear();
};

const onProductSubscriptionError = (error: unknown) => {
    productLastError = toErrorMessage(error);
    console.error('[products.sync] shared subscription failed', error);
    broadcastSyncHealth({
        status: 'error',
        lastError: productLastError,
    });
};

const scheduleProductRecovery = (dispatch: Dispatch, reason: string, error?: unknown) => {
    productLastRecoveryAttemptAt = new Date().toISOString();
    productLastRecoveryError = error ? toErrorMessage(error) : undefined;
    productRecoveryRetryCount += 1;
    updateSyncHealth(dispatch, {
        status: 'recovering',
        lastRecoveryAttemptAt: productLastRecoveryAttemptAt,
        lastRecoveryError:
            productLastRecoveryError ||
            `Recovery requested: ${reason}`,
    });

    if (productRecoveryTimer) {
        return;
    }

    const delayMs = Math.min(
        PRODUCT_SYNC_RECOVERY_BASE_DELAY_MS *
            2 ** Math.max(0, productRecoveryRetryCount - 1),
        PRODUCT_SYNC_RECOVERY_MAX_DELAY_MS
    );

    productRecoveryTimer = setTimeout(() => {
        productRecoveryTimer = undefined;
        void restartProductSync(dispatch, reason);
    }, delayMs);
};

const startSharedProductSubscriptions = (
    dispatch: Dispatch,
    tenantId?: string
) => {
    activeProductTenantId = tenantId;
    productLastSubscriptionStartedAt = new Date().toISOString();
    updateSyncHealth(dispatch, {
        status: 'subscribing',
        lastError: undefined,
        lastRecoveryError: productLastRecoveryError,
    });

    const releaseObserve = trackSyncSubscription('products.observeQuery');
    const observeSubscription = DataStore.observeQuery(Product).subscribe({
        next: ({ isSynced, items }) => {
            const activeItems = items.filter((item) =>
                isNotDeleted(item as { _deleted?: boolean | null })
            );
            productRecoveryRetryCount = 0;
            productLastError = undefined;
            productLastSnapshotAt = new Date().toISOString();
            logSyncDebug('products.observeQuery', 'update', {
                isSynced,
                itemCount: activeItems.length,
            });
            logChangedProducts(activeItems);
            publishSnapshot(activeItems);
            broadcastSyncHealth({
                status: 'healthy',
                lastSnapshotAt: productLastSnapshotAt,
                lastError: undefined,
            });
        },
        error: (error) => {
            releaseObserve();
            onProductSubscriptionError(error);
            scheduleProductRecovery(dispatch, 'observeQuery error', error);
        },
    });

    sharedProductObserveSubscription = {
        unsubscribe() {
            observeSubscription.unsubscribe();
            releaseObserve();
        },
    };

    const realtimeRelease = trackSyncSubscription('products.realtime');
    if (!activeProductTenantId) {
        broadcastSyncHealth({
            status: 'healthy',
        });
        sharedProductRealtimeSubscription = undefined;
        realtimeRelease();
        return;
    }

    logSyncDebug('products.realtime', 'subscribe:start', {
        tenantId: activeProductTenantId,
    });
    const realtimeBase = API.graphql({
        query: onUpdateProductRealtime,
        authMode: 'userPool',
    }) as unknown as {
        subscribe: (handlers: {
            next?: (event: {
                value?: {
                    data?: {
                        onUpdateProduct?: {
                            id: string;
                            tenantId?: string | null;
                            quantity?: number | null;
                            updatedAt?: string | null;
                        } | null;
                    };
                };
            }) => void;
            error?: (error: unknown) => void;
        }) => { unsubscribe: () => void };
    };

    const realtimeSubscription = realtimeBase.subscribe({
        next: (event) => {
            const payload = event.value?.data?.onUpdateProduct;
            if (!payload?.id) return;
            if (payload.tenantId && payload.tenantId !== activeProductTenantId) {
                return;
            }

            productLastRealtimePatchAt = new Date().toISOString();
            logSyncDebug('products.realtime', 'onUpdateProduct', {
                id: payload.id,
                tenantId: payload.tenantId,
                quantity: payload.quantity,
                updatedAt: payload.updatedAt,
            });

            productDispatchRefs.forEach((_, activeDispatch) => {
                activeDispatch(
                    productsActions.applyRealtimePatch({
                        id: payload.id,
                        quantity: payload.quantity ?? undefined,
                        updatedAt: payload.updatedAt ?? undefined,
                    })
                );
            });

            broadcastSyncHealth({
                status: 'healthy',
                lastRealtimePatchAt: productLastRealtimePatchAt,
                lastError: undefined,
            });
        },
        error: (error) => {
            realtimeRelease();
            onProductSubscriptionError(error);
            scheduleProductRecovery(dispatch, 'realtime error', error);
        },
    });

    sharedProductRealtimeSubscription = {
        unsubscribe() {
            realtimeSubscription.unsubscribe();
            realtimeRelease();
        },
    };
};

export const restartProductSync = async (
    dispatch: Dispatch,
    reason = 'manual',
    tenantId?: string
) => {
    logSyncDebug('products.sync', 'restart', {
        reason,
        tenantId: tenantId || null,
    });
    teardownProductSubscriptions();
    startSharedProductSubscriptions(dispatch, tenantId);
};

export const ensureProductSyncHealthy = async (
    dispatch: Dispatch,
    options?: {
        staleAfterMs?: number;
        tenantId?: string;
    }
) => {
    const tenantId = options?.tenantId;
    const staleAfterMs = options?.staleAfterMs ?? PRODUCT_SYNC_STALE_THRESHOLD_MS;
    const now = Date.now();
    const lastSignalAt = [
        productLastSnapshotAt,
        productLastRealtimePatchAt,
    ]
        .filter(Boolean)
        .map((value) => new Date(value as string).getTime())
        .sort((a, b) => b - a)[0];
    const subscriptionStartedAt = productLastSubscriptionStartedAt
        ? new Date(productLastSubscriptionStartedAt).getTime()
        : 0;

    if (tenantId && activeProductTenantId && tenantId !== activeProductTenantId) {
        activeProductTenantId = tenantId;
        resetProductSyncState();
        await restartProductSync(dispatch, 'tenant changed', tenantId);
        return true;
    }

    if (!sharedProductObserveSubscription) {
        if (getSubscriberCount() === 0) {
            return false;
        }
        await restartProductSync(dispatch, 'missing shared subscription', tenantId);
        return true;
    }

    if (!lastSignalAt && subscriptionStartedAt && now - subscriptionStartedAt > staleAfterMs) {
        updateSyncHealth(dispatch, {
            status: 'stale',
        });
        scheduleProductRecovery(dispatch, 'stale subscription');
        return true;
    }

    updateSyncHealth(dispatch, {
        status: 'healthy',
    });
    return false;
};

const logChangedProducts = (items: Product[]) => {
    const changed = items
        .filter((item) => {
            const previous = previousProductSnapshot.get(item.id);
            return (
                !previous ||
                previous.quantity !== item.quantity ||
                previous.updatedAt !== item.updatedAt
            );
        })
        .slice(0, 10)
        .map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            updatedAt: item.updatedAt,
        }));

    if (changed.length > 0) {
        logSyncDebug('products.observeQuery', 'changedItems', {
            itemCount: changed.length,
            items: changed,
        });
    }

    previousProductSnapshot.clear();
    items.forEach((item) => {
        previousProductSnapshot.set(item.id, {
            quantity: item.quantity,
            updatedAt: item.updatedAt,
        });
    });
};

export const syncProducts = (dispatch: Dispatch) => {
    const finish = startSyncMeasure('products', 'syncProducts');
    let subscription:
        | {
              unsubscribe: () => void;
          }
        | undefined;
    let shouldUnsubscribeAfterSubscribe = false;
    subscription = DataStore.observeQuery(Product).subscribe(({ items }) => {
        const activeItems = items.filter((item) =>
            isNotDeleted(item as { _deleted?: boolean | null })
        );
        finish({ itemCount: activeItems.length });
        updateStore(dispatch, activeItems);
        if (subscription) {
            subscription.unsubscribe();
            return;
        }

        shouldUnsubscribeAfterSubscribe = true;
    });

    if (shouldUnsubscribeAfterSubscribe) {
        subscription.unsubscribe();
    }
};


export const subscribeToProductChanges = (
    dispatch: Dispatch,
    tenantId?: string
) => {
    const currentCount = productDispatchRefs.get(dispatch) || 0;
    productDispatchRefs.set(dispatch, currentCount + 1);

    if (!sharedProductObserveSubscription) {
        startSharedProductSubscriptions(dispatch, tenantId);
    } else if (productSnapshot.length > 0) {
        updateStore(dispatch, productSnapshot);
    }

    updateSyncHealth(dispatch, {
        status: sharedProductObserveSubscription ? 'healthy' : 'subscribing',
        lastSnapshotAt: productLastSnapshotAt,
        lastRealtimePatchAt: productLastRealtimePatchAt,
        lastRecoveryAttemptAt: productLastRecoveryAttemptAt,
        lastRecoveryError: productLastRecoveryError,
        lastError: productLastError,
    });

    return {
        unsubscribe() {
            const nextCount = (productDispatchRefs.get(dispatch) || 1) - 1;

            if (nextCount <= 0) {
                productDispatchRefs.delete(dispatch);
            } else {
                productDispatchRefs.set(dispatch, nextCount);
            }

            if (productDispatchRefs.size === 0) {
                resetProductSyncState();
                dispatch(clearSyncHealthAction(PRODUCT_SYNC_MODEL));
                return;
            }

            updateSyncHealth(dispatch, {
                subscriberCount: getSubscriberCount(),
            });
        },
    };
};

const updateStore = (dispatch: Dispatch, items: Product[]) => {
    logSyncDebug('products', 'updateStore', {
        itemCount: items.length,
    });
    sortListBy(items, 'name');
    dispatch(productsActions.setAll(
        items.map((p) => ProductEntityMapper.fromProduct(p))
    ))
};
