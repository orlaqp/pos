import { ProductEntity } from '@pos/products/data-access';
import { MINIMUM_INVENTORY_FOR_SALE } from '@pos/sales/data-access';

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
