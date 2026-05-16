import { InventoryCount, InventoryCountLine, Product } from '@pos/shared/models';
import { Dispatch } from '@reduxjs/toolkit';
import { API, DataStore } from '@pos/shared/amplify';
import { inventoryCountActions } from './inventory-count.slice';
import { InventoryCountDTO } from './inventory-count.entity';
import { Alert } from 'react-native';
import { requireCurrentTenantId, stampTenant } from '@pos/auth/data-access';
import { InventoryCountLineDTO } from './inventory-count-line.entity';
import { productsActions } from '@pos/products/data-access';

const finalizeInventoryCountQuery = /* GraphQL */ `
    query FinalizeInventoryCount($input: FinalizeInventoryCountInput!) {
        finalizeInventoryCount(input: $input) {
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

const buildOperationId = (countId?: string) =>
    `INVENTORY_COUNT:${countId || 'new'}:${Date.now()}`;

const normalizeCountLines = (lines: InventoryCountLineDTO[]) =>
    lines
        .filter(
            (line) =>
                line.newCount !== undefined &&
                line.newCount !== null &&
                !Number.isNaN(Number(line.newCount))
        )
        .map((line) => ({
            id: line.id,
            productId: line.productId,
            productName: line.productName,
            unitOfMeasure: line.unitOfMeasure,
            current: Number(line.current || 0),
            newCount: Number(line.newCount || 0),
            comments: line.comments,
        }));

const resolveLiveProductQuantities = async (
    productIds: string[]
): Promise<Record<string, number>> => {
    const uniqueIds = Array.from(new Set(productIds.filter(Boolean)));
    const entries = await Promise.all(
        uniqueIds.map(async (productId) => {
            const product = await DataStore.query(Product, productId);
            return [productId, Number(product?.quantity || 0)] as const;
        })
    );

    return Object.fromEntries(entries);
};

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

const finalizeCount = async (
    dispatch: Dispatch<any>,
    count: InventoryCountDTO
) => {
    const liveQuantities = await resolveLiveProductQuantities(
        count.lines.map((line) => line.productId)
    );
    const finalizedLines = count.lines.map((line) => ({
        ...line,
        current: liveQuantities[line.productId] ?? Number(line.current || 0),
    }));

    const result = await API.graphql({
        query: finalizeInventoryCountQuery,
        variables: {
            input: {
                countId: count.id,
                operationId: buildOperationId(count.id),
                comments: count.comments,
                createdBy: {
                    id: count.createdBy?.id || '',
                    name: count.createdBy?.name || '',
                },
                lines: normalizeCountLines(finalizedLines),
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
            finalizeInventoryCount?: {
                sourceId?: string | null;
                affectedProducts?: Array<{
                    productId?: string | null;
                    finalQuantity?: number | null;
                }> | null;
            } | null;
        };
    }).data?.finalizeInventoryCount;

    if (!finalized?.sourceId) {
        throw new Error('Inventory count finalization did not return a source id.');
    }

    const finalizedCount: InventoryCountDTO = {
        ...count,
        id: finalized.sourceId,
        status: 'COMPLETED',
        lines: finalizedLines,
    };

    dispatch(
        count.id
            ? inventoryCountActions.update({
                  id: count.id,
                  changes: finalizedCount,
              })
            : inventoryCountActions.add(finalizedCount)
    );

    await reconcileFinalizedCountRecord(finalizedCount, finalized.sourceId);
    syncFinalizedProducts(dispatch, finalized.affectedProducts || []);
    return true;
};

const reconcileFinalizedCountRecord = async (
    count: InventoryCountDTO,
    sourceId: string
) => {
    const localId = count.id || sourceId;
    const tenantId = requireCurrentTenantId();
    let existing = await DataStore.query(InventoryCount, localId);

    if (!existing && localId !== sourceId) {
        existing = await DataStore.query(InventoryCount, sourceId);
    }

    const savedCount = existing
        ? await DataStore.save(
              InventoryCount.copyOf(existing, (updated) => {
                  updated.status = 'COMPLETED';
                  updated.comments = count.comments;
              })
          )
        : await DataStore.save(
              new InventoryCount({
                  id: sourceId,
                  tenantId,
                  comments: count.comments,
                  status: 'COMPLETED',
                  createdBy: {
                      id: count.createdBy?.id || '',
                      name: count.createdBy?.name || '',
                  },
              } as never)
          );

    const existingLines = await DataStore.query(InventoryCountLine, (line: any) =>
        line.inventoryCountLineInventoryCountId.eq(savedCount.id)
    );
    const seenKeys = new Set<string>();

    for (const line of count.lines) {
        const existingLine =
            existingLines.find((candidate: any) => line.id && candidate.id === line.id) ||
            existingLines.find((candidate: any) => candidate.productId === line.productId);
        const identityKey = existingLine?.id || line.id || line.productId;
        seenKeys.add(identityKey);

        if (existingLine) {
            await DataStore.save(
                InventoryCountLine.copyOf(existingLine, (updated) => {
                    updated.productId = line.productId;
                    updated.productName = line.productName;
                    updated.unitOfMeasure = line.unitOfMeasure;
                    updated.current = line.current;
                    if (line.newCount !== undefined) {
                        updated.newCount = line.newCount;
                    }
                    updated.comments = line.comments;
                })
            );
            continue;
        }

        await DataStore.save(
            new InventoryCountLine({
                ...(line.id ? { id: line.id } : {}),
                tenantId,
                productId: line.productId,
                productName: line.productName,
                unitOfMeasure: line.unitOfMeasure,
                current: line.current,
                newCount: line.newCount,
                comments: line.comments,
                inventoryCountLineInventoryCountId: savedCount.id,
            } as never)
        );
    }

    for (const existingLine of existingLines) {
        const identityKey = existingLine.id || existingLine.productId;
        if (seenKeys.has(identityKey)) {
            continue;
        }

        await DataStore.delete(existingLine);
    }
};

export class InventoryCountService {
    static async save(
        dispatch: Dispatch<any>,
        count: InventoryCountDTO,
        updateInv: boolean
    ): Promise<boolean> {
        try {
            if (updateInv) {
                return await finalizeCount(dispatch, count);
            }

            if (!count.id) {
                await createCount(count, dispatch);
            } else {
                await updateCount(count, dispatch);
            }

            return true;
        } catch (error) {
            Alert.alert(
                updateInv
                    ? 'Unable to finalize inventory count'
                    : 'Unable to save inventory count',
                getErrorMessage(error)
            );
            return false;
        }
    }

    static getAll() {
        return DataStore.query(InventoryCount);
    }

    static async delete(id: string) {
        const item = await DataStore.query(InventoryCount, id);
        if (!item) return console.error(`Inventory Id: ${id} not found`);

        const lines = DataStore.query(InventoryCountLine, (l: any) =>
            l.inventoryCountLineInventoryCountId.eq(item.id)
        );

        (await lines).forEach((l: any) => DataStore.delete(l));

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

        const line = await DataStore.query(InventoryCountLine, (c: any) =>
            c.id.eq(l.id!)
        );

        if (line.length === 0) {
            console.error('Inventory Count Line not found for: ' + l.id);
            return;
        }

        await DataStore.save(
            InventoryCountLine.copyOf(line[0], (updated) => {
                if (l.newCount !== undefined) {
                    updated.newCount = l.newCount;
                }
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
