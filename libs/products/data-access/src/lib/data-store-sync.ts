import { productsActions } from './slices/products.slice';
import { API, DataStore } from '@pos/shared/amplify';
import { Dispatch } from '@reduxjs/toolkit';
import { Product } from '@pos/shared/models';
import { ProductEntityMapper } from './product.entity';
import { sortListBy } from '@pos/shared/utils';
import { logSyncDebug, startSyncMeasure, trackSyncSubscription } from '@pos/shared/utils';
import { getCurrentTenantId } from '@pos/auth/data-access';

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
    DataStore.query(Product).then((products) => {
        finish({ itemCount: products.length });
        updateStore(dispatch, products);
    });
};


export const subscribeToProductChanges = (dispatch: Dispatch) => {
    const release = trackSyncSubscription('products.observeQuery');
    const subscription = DataStore.observeQuery(Product).subscribe(({ isSynced, items }) => {
        if (!isSynced) {
            return;
        }
        logSyncDebug('products.observeQuery', 'update', {
            isSynced,
            itemCount: items.length,
        });
        logChangedProducts(items);
        updateStore(dispatch, items);
    });

    const tenantId = getCurrentTenantId();
    const realtimeRelease = trackSyncSubscription('products.realtime');
    logSyncDebug('products.realtime', 'subscribe:start', {
        tenantId: tenantId || null,
    });
    const realtimeSubscription = tenantId
        ? (
            API.graphql({
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
                                    name?: string | null;
                                    quantity?: number | null;
                                    updatedAt?: string | null;
                                } | null;
                            };
                        };
                    }) => void;
                    error?: (error: unknown) => void;
                }) => { unsubscribe: () => void };
            }
        ).subscribe({
            next: (event) => {
                const payload = event.value?.data?.onUpdateProduct;
                if (!payload?.id) return;
                if (payload.tenantId && payload.tenantId !== tenantId) {
                    return;
                }

                logSyncDebug('products.realtime', 'onUpdateProduct', {
                    id: payload.id,
                    tenantId: payload.tenantId,
                    quantity: payload.quantity,
                    updatedAt: payload.updatedAt,
                });

                dispatch(productsActions.applyRealtimePatch({
                    id: payload.id,
                    quantity: payload.quantity ?? undefined,
                    updatedAt: payload.updatedAt ?? undefined,
                }));
            },
            error: (error) => {
                console.error('[products.realtime] subscription failed', error);
            },
        })
        : undefined;

    return {
        unsubscribe() {
            subscription.unsubscribe();
            release();
            realtimeSubscription?.unsubscribe();
            realtimeRelease();
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
