import {
    InventoryCount,
    InventoryCountLine,
    Product,
} from '@pos/shared/models';
import { Dispatch } from '@reduxjs/toolkit';
import { API, DataStore } from '@pos/shared/amplify';
import { inventoryCountActions } from './inventory-count.slice';
import { InventoryCountDTO } from './inventory-count.entity';
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

const getGraphqlErrorMessage = (result: unknown) => {
    if (!result || typeof result !== 'object') return undefined;
    if (!('errors' in result)) return undefined;
    const errors = (result as { errors?: Array<{ message?: string }> }).errors || [];
    return errors.map((error) => error?.message).filter(Boolean).join(' | ') || undefined;
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

    return String(error);
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

const executeInventoryCountDelta = async (
    productId: string,
    delta: number,
    version?: number | null
) => {
    const result = await API.graphql({
        query: updateProductInventoryDeltaMutation,
        variables: {
            input: {
                id: productId,
                quantity: delta,
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

const applyInventoryCountDelta = async (product: Product, delta: number) => {
    const currentVersion = (product as Product & { _version?: number | null })._version;

    try {
        await executeInventoryCountDelta(product.id, delta, currentVersion);
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
        await executeInventoryCountDelta(product.id, delta, latestVersion);
    }
};

export class InventoryCountService {
    static async save(
        dispatch: Dispatch<any>,
        count: InventoryCountDTO,
        updateInv: boolean
    ) {
        let updatedCount: InventoryCountDTO | null;
        if (!count.id) {
            updatedCount = await createCount(count, dispatch);
        } else {
            updatedCount = await updateCount(count, dispatch);
        }

        if (!updateInv || !updatedCount) return;

        await updateInventory(updatedCount);
    }

    static getAll() {
        return DataStore.query(InventoryCount);
    }

    static async delete(id: string) {
        const item = await DataStore.query(InventoryCount, id);
        if (!item) return console.error(`Inventory Id: ${id} not found`);

        const lines = DataStore.query(InventoryCountLine, (l) =>
            l.inventoryCountLineInventoryCountId.eq(item.id)
        );

        (await lines).forEach(l => DataStore.delete(l));

        return DataStore.delete(item);
    }
}

async function createCount(count: InventoryCountDTO, dispatch: Dispatch<any>) {
    const { lines, ...rest } = count;
    const entity = new InventoryCount(stampTenant({
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
        l.inventoryCountLineInventoryCountId = count.id;
        return DataStore.save(
            new InventoryCountLine({
                tenantId: requireCurrentTenantId(),
                productId: l.productId,
                productName: l.productName,
                unitOfMeasure: l.unitOfMeasure,
                current: l.current,
                newCount: l.newCount,
                comments: l.comments,
                inventoryCountLineInventoryCountId: count.id!,
            } as never)
        );
    });

    await Promise.all(promises);
    dispatch(inventoryCountActions.add(count));

    return count;
}

async function updateCount(count: InventoryCountDTO, dispatch: Dispatch<any>) {
    if (!count.id) return null;

    const existing = await DataStore.query(InventoryCount, count.id);

    if (!existing) {
        console.log(
            `It seems that inventory: ${count.id} has been removed`
        );

        return null;
    }

    await DataStore.save(
        InventoryCount.copyOf(existing, (updated) => {
            updated.comments = count.comments;
            updated.status = count.status;
        })
    );

    const lineUpdates = count.lines?.map(async (l) => {
        if (!l.id) {
            await DataStore.save(
                new InventoryCountLine({
                    tenantId: requireCurrentTenantId(),
                    productId: l.productId,
                    productName: l.productName,
                    unitOfMeasure: l.unitOfMeasure,
                    current: l.current,
                    newCount: l.newCount,
                    comments: l.comments,
                    inventoryCountLineInventoryCountId: existing.id,
                } as never)
            );
            return;
        }

        const line = await DataStore.query(InventoryCountLine, (c) =>
            c.id.eq(l.id!)
        );

        if (line.length === 0) {
            console.error('Inventory Count Line not found for: ' + l.id);
            return;
        }

        await DataStore.save(
            InventoryCountLine.copyOf(line[0], (updated) => {
                updated.newCount = l.newCount;
                updated.comments = l.comments;
            })
        );
    }) || [];

    await Promise.all(lineUpdates);

    dispatch(
        inventoryCountActions.update({ id: count.id, changes: count })
    );

    return count;
}

const updateInventory = async (count: InventoryCountDTO) => {
    try {
        for (let i = 0; i < count.lines.length; i++) {
            const l = count.lines[i];
            const product = await DataStore.query(Product, l.productId);

            if (!product) {
                Alert.alert('Error', `Product ${l.productName} was not found while updating the inventory`);
                continue;
            }

            if (l.newCount === undefined || l.newCount === null) {
                continue;
            }

            const delta = l.newCount! - (product.quantity || 0);
            if (delta === 0) {
                continue;
            }

            debugInventoryApply('count', {
                productId: l.productId,
                productName: l.productName,
                quantityBefore: product.quantity || 0,
                countedQuantity: l.newCount,
                delta,
                quantityExpectedAfter: (product.quantity || 0) + delta,
                countId: count.id || 'new-count',
            });

            await applyInventoryCountDelta(product, delta);
        }
    } catch (error) {
        Alert.alert('Error while updating inventory', getErrorMessage(error));
    }
}
