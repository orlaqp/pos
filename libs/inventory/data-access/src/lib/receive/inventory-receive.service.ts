import {
    InventoryReceive,
    InventoryReceiveLine,
    Product,
} from '@pos/shared/models';
import { Dispatch } from '@reduxjs/toolkit';
import { API, DataStore } from '@pos/shared/amplify';
import { inventoryReceiveActions } from './inventory-receive.slice';
import { InventoryReceiveDTO } from './inventory-receive.entity';
import { Alert } from 'react-native';
import { requireCurrentTenantId, stampTenant } from '@pos/auth/data-access';
import { getProduct } from '@pos/shared/api';

const updateProductInventoryDeltaMutation = /* GraphQL */ `
    mutation UpdateProductInventoryDelta(
        $input: UpdateProductInput!
        $condition: ModelProductConditionInput
    ) {
        updateProduct(input: $input, condition: $condition) {
            id
            tenantId
            name
            description
            price
            tags
            cost
            barcode
            sku
            plu
            quantity
            unitOfMeasure
            trackStock
            reorderPoint
            reorderQuantity
            picture
            isActive
            isEBTEligible
            discountable
            minAllowedPrice
            maxManualDiscountPercent
            maxManualDiscountAmount
            createdAt
            updatedAt
            _version
            _deleted
            _lastChangedAt
            productCategoryId
            productBrandId
            __typename
        }
    }
`;

const isInventoryDebugEnabled = () =>
    typeof __DEV__ !== 'undefined' && __DEV__;

const debugInventoryApply = (context: string, payload: Record<string, unknown>) => {
    if (!isInventoryDebugEnabled()) return;
    console.log(`[inventory-debug][${context}]`, payload);
};

const getErrorMessage = (error: unknown) => {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    if (
        error &&
        typeof error === 'object' &&
        'errors' in error &&
        Array.isArray((error as { errors?: unknown[] }).errors)
    ) {
        const messages = (error as { errors?: unknown[] }).errors
            ?.map((entry) => {
                if (
                    entry &&
                    typeof entry === 'object' &&
                    'message' in entry &&
                    typeof (entry as { message?: unknown }).message === 'string'
                ) {
                    return (entry as { message: string }).message;
                }

                return undefined;
            })
            .filter(Boolean);

        if (messages && messages.length > 0) {
            return messages.join(' | ');
        }
    }

    if (
        error &&
        typeof error === 'object' &&
        'message' in error &&
        typeof (error as { message?: unknown }).message === 'string'
    ) {
        return (error as { message: string }).message;
    }

    if (
        error &&
        typeof error === 'object' &&
        'data' in error &&
        (error as { data?: unknown }).data &&
        typeof (error as { data?: unknown }).data === 'object'
    ) {
        return JSON.stringify((error as { data: unknown }).data);
    }

    if (error && typeof error === 'object') {
        try {
            return JSON.stringify(error);
        } catch (_jsonError) {
            return '[unserializable error object]';
        }
    }

    return String(error);
};

const getGraphqlErrorMessage = (result: unknown) => {
    if (!result || typeof result !== 'object') return undefined;
    if (!('errors' in result)) return undefined;
    const errors = (result as { errors?: Array<{ message?: string }> }).errors || [];
    return errors.map((error) => error?.message).filter(Boolean).join(' | ') || undefined;
};

const fetchLatestProductVersion = async (productId: string) => {
    const result = await API.graphql({
        query: getProduct,
        variables: { id: productId },
        authMode: 'userPool',
    });

    const message = getGraphqlErrorMessage(result);
    if (message) {
        throw new Error(message);
    }

    const remote = (result as { data?: { getProduct?: { _version?: number | null } | null } })
        .data?.getProduct;

    return remote?._version;
};

const executeInventoryReceiveDelta = async (
    productId: string,
    received: number,
    version?: number | null
) => {
    const result = await API.graphql({
        query: updateProductInventoryDeltaMutation,
        variables: {
            input: {
                id: productId,
                quantity: received,
                _version: version,
            },
        },
        authMode: 'userPool',
    });

    const message = getGraphqlErrorMessage(result);
    if (message) {
        throw new Error(message);
    }
};

const applyInventoryReceiveDelta = async (product: Product, received: number) => {
    const currentVersion = (product as Product & { _version?: number | null })._version;

    try {
        await executeInventoryReceiveDelta(product.id, received, currentVersion);
    } catch (error) {
        const message =
            error instanceof Error ? error.message : String(error);

        const shouldRetry =
            message.toLowerCase().includes('conflict') ||
            message.toLowerCase().includes('conditionalcheckfailed') ||
            message.toLowerCase().includes('version');

        if (!shouldRetry) {
            throw error;
        }

        const latestVersion = await fetchLatestProductVersion(product.id);
        await executeInventoryReceiveDelta(product.id, received, latestVersion);
    }
};

export class InventoryReceiveService {
    static async save(
        dispatch: Dispatch<any>,
        item: InventoryReceiveDTO,
        updateInv: boolean
    ) {
        if (!item.id) {
            await createReceive(item, dispatch);
        } else {
            await updateReceive(item, dispatch);
        }

        if (!updateInv) return;

        await updateInventory(item);
    }

    static getAll() {
        return DataStore.query(InventoryReceive);
    }

    static async delete(id: string) {
        const item = await DataStore.query(InventoryReceive, id);
        if (!item)
            return console.error(`Inventory received id: ${id} not found`);

        const lines = DataStore.query(InventoryReceiveLine, (l) =>
            l.inventoryReceiveLineInventoryReceiveId.eq(item.id)
        );

        (await lines).forEach(l => DataStore.delete(l));

        return DataStore.delete(item);
    }
}

async function createReceive(count: InventoryReceiveDTO, dispatch: Dispatch<any>) {
    const { lines, ...rest } = count;
    const entity = new InventoryReceive(stampTenant({
        comments: rest.comments,
        status: rest.status,
        createdBy: {
            id: rest.createdBy?.id || '',
            name: rest.createdBy?.name || '',
        },
    }) as never);
    const res = await DataStore.save(entity);
    count.id = res.id;

    const promises = lines.map((l) => {
        l.inventoryReceiveLineInventoryReceiveId = res.id;
        return DataStore.save(
            new InventoryReceiveLine({
                tenantId: requireCurrentTenantId(),
                productId: l.productId,
                productName: l.productName,
                unitOfMeasure: l.unitOfMeasure,
                received: l.received,
                comments: l.comments,
                inventoryReceiveLineInventoryReceiveId: res.id,
            } as never)
        );
    });

    await Promise.all(promises);
    return dispatch(inventoryReceiveActions.add(count));
}

async function updateReceive(receive: InventoryReceiveDTO, dispatch: Dispatch<any>) {
    if (!receive.id) return;

    const existing = await DataStore.query(InventoryReceive, receive.id);

    if (!existing) {
        return console.log(
            `It seems that inventory receive: ${receive.id} has been removed`
        );
    }

    await DataStore.save(
        InventoryReceive.copyOf(existing, (updated) => {
            updated.comments = receive.comments;
            updated.status = receive.status;
        })
    );

    const lineUpdates = receive.lines?.map(async (l) => {
        if (!l.id) {
            await DataStore.save(
                new InventoryReceiveLine({
                    tenantId: requireCurrentTenantId(),
                    productId: l.productId,
                    productName: l.productName,
                    unitOfMeasure: l.unitOfMeasure,
                    received: l.received,
                    comments: l.comments,
                    inventoryReceiveLineInventoryReceiveId: existing.id,
                } as never)
            );
            return;
        }

        const line = await DataStore.query(InventoryReceiveLine, (c) =>
            c.id.eq(l.id!)
        );

        if (line.length === 0) {
            console.error('Inventory received Line not found for: ' + l.id);
            return;
        }

        await DataStore.save(
            InventoryReceiveLine.copyOf(line[0], (updated) => {
                updated.received = l.received;
                updated.comments = l.comments;
            })
        );
    }) || [];

    await Promise.all(lineUpdates);

    return dispatch(
        inventoryReceiveActions.update({ id: receive.id, changes: receive })
    );
}

const buildReceivedByProductId = (lines: InventoryReceiveLineDTO[]) => {
    const receivedByProductId = new Map<string, number>();
    lines.forEach((line) => {
        if (
            line.received === undefined ||
            line.received === null ||
            Number.isNaN(line.received)
        ) {
            return;
        }

        receivedByProductId.set(
            line.productId,
            (receivedByProductId.get(line.productId) || 0) + line.received
        );
    });

    return receivedByProductId;
};

const updateInventory = async (
    count: InventoryReceiveDTO
) => {
    const receivedByProductId = buildReceivedByProductId(count.lines);

    const failures: string[] = [];

    for (const [productId, received] of receivedByProductId.entries()) {
        const productLine = count.lines.find((line) => line.productId === productId);

        try {
            const product = await DataStore.query(Product, productId);

            if (!product) {
                failures.push(
                    `Product ${productLine?.productName || productId} was not found while updating the inventory`
                );
                continue;
            }

            if (received === undefined || received === null || Number.isNaN(received)) {
                continue;
            }

            if (received !== 0) {
                debugInventoryApply('receive', {
                    productId,
                    productName: productLine?.productName,
                    quantityBefore: product.quantity || 0,
                    delta: received,
                    quantityExpectedAfter: (product.quantity || 0) + received,
                    receiveId: count.id || 'new-receive',
                });

                await applyInventoryReceiveDelta(product, received);
            }
        } catch (error) {
            const message = getErrorMessage(error);
            console.error('[inventory-receive] product delta failed', {
                productId,
                productName: productLine?.productName,
                received,
                receiveId: count.id || 'new-receive',
                message,
                error,
            });
            failures.push(
                `${productLine?.productName || productId}: ${message}`
            );
        }
    }

    if (failures.length > 0) {
        Alert.alert(
            'Inventory receive partially applied',
            failures.join('\n')
        );
    }
};
