import {
    InventoryCount,
    InventoryCountLine,
    InventoryReceive,
    InventoryReceiveLine,
    Order,
} from '@pos/shared/models';
import {
    DataStore,
    handleDataStoreUnauthorizedError,
    syncExpression,
} from '@pos/shared/amplify';
import moment from 'moment';

type TenantIdProvider = () => string | null | undefined;

let inventorySyncEnabled = false;
let inventorySyncPromise: Promise<void> | null = null;
let tenantIdProvider: TenantIdProvider = () => undefined;
let lastConfiguredTenantId: string | null | undefined;

export const setDataStoreTenantProvider = (provider: TenantIdProvider) => {
    tenantIdProvider = provider;
};

const getInventorySyncCutoff = () => {
    if (inventorySyncEnabled) {
        return moment().subtract(15, 'days').toISOString();
    }

    return moment().add(1, 'day').toISOString();
};

const withTenantConflictResolution = (
    conflict: {
        modelConstructor: new (init: Record<string, unknown>) => unknown;
        localModel: Record<string, unknown>;
        remoteModel: Record<string, unknown>;
    },
    tenantId: string
) => {
    const merged = {
        ...conflict.localModel,
        _version: conflict.remoteModel?._version,
    } as Record<string, unknown>;

    if (!merged.tenantId) {
        merged.tenantId =
            conflict.remoteModel?.tenantId ||
            conflict.localModel?.tenantId ||
            tenantId;
    }

    return new conflict.modelConstructor(merged);
};

const isConditionalConflictMessage = (message: unknown) =>
    typeof message === 'string' &&
    (message.includes('ConditionalCheckFailedException') ||
        message.includes('The conditional request failed'));

export const configureDataStore = (
    tenantId = tenantIdProvider() ?? lastConfiguredTenantId
) => {
    if (!tenantId) {
        return;
    }

    lastConfiguredTenantId = tenantId;

    const closedOrderSyncWindowDays = 3;
    const inventoryIsoDate = getInventorySyncCutoff();
    const orderIsoDate = moment().subtract(closedOrderSyncWindowDays, 'days').toISOString();

    DataStore.configure({
        conflictHandler: async (conflict: {
            modelConstructor: new (init: Record<string, unknown>) => unknown;
            localModel: Record<string, unknown>;
            remoteModel: Record<string, unknown>;
        }) => withTenantConflictResolution(conflict, tenantId),
        errorHandler: (error: unknown) => {
            if (error && typeof error === 'object') {
                const details = {
                    message: (error as { message?: unknown }).message,
                    errorType: (error as { errorType?: unknown }).errorType,
                    recoverySuggestion: (error as { recoverySuggestion?: unknown }).recoverySuggestion,
                    localModel: (error as { localModel?: unknown }).localModel,
                    operation: (error as { operation?: unknown }).operation,
                    model: (error as { model?: unknown }).model,
                };
                if (isConditionalConflictMessage(details.message)) {
                    console.warn(
                        'DataStore sync conflict',
                        JSON.stringify(details, null, 2)
                    );
                    return;
                }

                if (handleDataStoreUnauthorizedError('DataStore.sync', error)) {
                    console.error('DataStore sync error', JSON.stringify(details, null, 2));
                    return;
                }

                console.error('DataStore sync error', JSON.stringify(details, null, 2));
                return;
            }

            console.error('DataStore sync error', error);
        },
        syncExpressions: [
            syncExpression(
                InventoryCount,
                () => (x: any) => x.createdAt.gt(inventoryIsoDate)
            ),
            syncExpression(
                InventoryCountLine,
                () => (x: any) => x.createdAt.gt(inventoryIsoDate)
            ),
            syncExpression(
                InventoryReceive,
                () => (x: any) => x.createdAt.gt(inventoryIsoDate)
            ),
            syncExpression(
                InventoryReceiveLine,
                () => (x: any) => x.createdAt.gt(inventoryIsoDate)
            ),
            syncExpression(
                Order,
                () => (x: any) =>
                    x.or((order: any) => [
                        order.status.eq('OPEN'),
                        order.orderDate.gt(orderIsoDate),
                    ])
            ),
        ],
    });
};

export const isInventorySyncEnabled = () => inventorySyncEnabled;

export const enableInventorySync = async () => {
    if (inventorySyncEnabled) {
        return;
    }

    if (inventorySyncPromise) {
        return inventorySyncPromise;
    }

    inventorySyncPromise = (async () => {
        inventorySyncEnabled = true;
        await DataStore.stop();
        configureDataStore();
        await DataStore.start();
    })();

    try {
        await inventorySyncPromise;
    } catch (error) {
        inventorySyncEnabled = false;
        throw error;
    } finally {
        inventorySyncPromise = null;
    }
};

export const resetInventorySyncForTests = () => {
    inventorySyncEnabled = false;
    inventorySyncPromise = null;
    lastConfiguredTenantId = undefined;
};
