import { ProductEntity } from '@pos/products/data-access';
import { MINIMUM_INVENTORY_FOR_SALE } from '@pos/sales/data-access';
import { shouldBlockSelectionByInventory } from '../sales-screen/sales-screen.logic';

export const chunkProducts = (
    products: ProductEntity[],
    chunkSize = 3
): ProductEntity[][] => {
    const rows: ProductEntity[][] = [];
    for (let i = 0; i < products.length; i += chunkSize) {
        rows.push(products.slice(i, i + chunkSize));
    }
    return rows;
};

export const getNextRowsToShow = (
    rowsToShow: number,
    increment = 6
): number => rowsToShow + increment;

export const getProductCardState = (
    product: ProductEntity
): 'danger' | 'warning' | 'default' => {
    if (product.quantity < MINIMUM_INVENTORY_FOR_SALE) return 'danger';
    if (
        product.reorderPoint &&
        product.quantity > 0 &&
        product.quantity <= product.reorderPoint
    ) {
        return 'warning';
    }
    return 'default';
};

export const getProductInventoryVisualState = (
    product: ProductEntity,
    enforceSalesBasedOnInventory: boolean | undefined
): {
    state: 'danger' | 'warning' | 'default';
    isBlocked: boolean;
    statusLabel?: 'Out of stock' | 'Low inventory';
} => {
    const state = getProductCardState(product);
    const isBlocked = shouldBlockSelectionByInventory(
        enforceSalesBasedOnInventory,
        product.quantity,
        MINIMUM_INVENTORY_FOR_SALE
    );

    if (state === 'danger') {
        return {
            state,
            isBlocked,
            statusLabel: 'Out of stock',
        };
    }

    if (state === 'warning') {
        return {
            state,
            isBlocked,
            statusLabel: 'Low inventory',
        };
    }

    return {
        state,
        isBlocked,
    };
};
