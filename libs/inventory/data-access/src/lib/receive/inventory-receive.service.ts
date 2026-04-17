import { InventoryReceive, InventoryReceiveLine } from '@pos/shared/models';
import { Dispatch } from '@reduxjs/toolkit';
import { API, DataStore } from '@pos/shared/amplify';
import { inventoryReceiveActions } from './inventory-receive.slice';
import { InventoryReceiveDTO } from './inventory-receive.entity';
import { Alert } from 'react-native';
import { requireCurrentTenantId, stampTenant } from '@pos/auth/data-access';
import { InventoryReceiveLineDTO } from './inventory-receive-line.entity';
import { productsActions } from '@pos/products/data-access';

const finalizeInventoryReceiveQuery = /* GraphQL */ `
    query FinalizeInventoryReceive($input: FinalizeInventoryReceiveInput!) {
        finalizeInventoryReceive(input: $input) {
            sourceId
            sourceType
            status
            appliedAt
            error
            affectedProducts {
                productId
                finalQuantity
                appliedDelta
            }
        }
    }
`;

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

const buildOperationId = (receiveId?: string) =>
    `INVENTORY_RECEIVE:${receiveId || 'new'}:${Date.now()}`;

const normalizeReceiveLines = (lines: InventoryReceiveLineDTO[]) =>
    lines
        .filter((line) => !Number.isNaN(Number(line.received)))
        .map((line) => ({
            id: line.id,
            productId: line.productId,
            productName: line.productName,
            unitOfMeasure: line.unitOfMeasure,
            received: Number(line.received || 0),
            comments: line.comments,
        }));

const syncFinalizedProducts = (
    dispatch: Dispatch<any>,
    affectedProducts: Array<{ productId?: string | null; finalQuantity?: number | null }>
) => {
    const updates = affectedProducts
        .filter((product) => !!product.productId)
        .map((product) => ({
            productId: product.productId as string,
            newCount: Number(product.finalQuantity || 0),
        }));

    if (updates.length > 0) {
        dispatch(productsActions.updateQuantities(updates));
    }
};

const finalizeReceive = async (
    dispatch: Dispatch<any>,
    receive: InventoryReceiveDTO
) => {
    const result = await API.graphql({
        query: finalizeInventoryReceiveQuery,
        variables: {
            input: {
                receiveId: receive.id,
                operationId: buildOperationId(receive.id),
                comments: receive.comments,
                createdBy: {
                    id: receive.createdBy?.id || '',
                    name: receive.createdBy?.name || '',
                },
                lines: normalizeReceiveLines(receive.lines),
            },
        },
        authMode: 'userPool',
    });

    const message = getGraphqlErrorMessage(result);
    if (message) {
        throw new Error(message);
    }

    const finalized = (result as {
        data?: {
            finalizeInventoryReceive?: {
                sourceId?: string | null;
                affectedProducts?: Array<{
                    productId?: string | null;
                    finalQuantity?: number | null;
                }> | null;
            } | null;
        };
    }).data?.finalizeInventoryReceive;

    if (!finalized?.sourceId) {
        throw new Error('Inventory receive finalization did not return a source id.');
    }

    const finalizedReceive: InventoryReceiveDTO = {
        ...receive,
        id: finalized.sourceId,
        status: 'COMPLETED',
    };

    dispatch(
        receive.id
            ? inventoryReceiveActions.update({
                  id: receive.id,
                  changes: finalizedReceive,
              })
            : inventoryReceiveActions.add(finalizedReceive)
    );

    syncFinalizedProducts(dispatch, finalized.affectedProducts || []);
    return true;
};

export class InventoryReceiveService {
    static async save(
        dispatch: Dispatch<any>,
        item: InventoryReceiveDTO,
        updateInv: boolean
    ): Promise<boolean> {
        try {
            if (updateInv) {
                return await finalizeReceive(dispatch, item);
            }

            if (!item.id) {
                await createReceive(item, dispatch);
            } else {
                await updateReceive(item, dispatch);
            }

            return true;
        } catch (error) {
            Alert.alert(
                updateInv
                    ? 'Unable to finalize inventory receive'
                    : 'Unable to save inventory receive',
                getErrorMessage(error)
            );
            return false;
        }
    }

    static getAll() {
        return DataStore.query(InventoryReceive);
    }

    static async delete(id: string) {
        const item = await DataStore.query(InventoryReceive, id);
        if (!item)
            return console.error(`Inventory received id: ${id} not found`);

        const lines = DataStore.query(InventoryReceiveLine, (l: any) =>
            l.inventoryReceiveLineInventoryReceiveId.eq(item.id)
        );

        (await lines).forEach((l: any) => DataStore.delete(l));

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
    dispatch(inventoryReceiveActions.add(count));
}

async function updateReceive(receive: InventoryReceiveDTO, dispatch: Dispatch<any>) {
    if (!receive.id) return;

    const existing = await DataStore.query(InventoryReceive, receive.id);

    if (!existing) {
        return;
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

        const line = await DataStore.query(InventoryReceiveLine, (c: any) =>
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

    dispatch(
        inventoryReceiveActions.update({ id: receive.id, changes: receive })
    );
}
