import { ProductEntity } from '@pos/products/data-access';
import { MINIMUM_INVENTORY_FOR_SALE } from '@pos/sales/data-access';
import { EACH } from '@pos/unit-of-measures/data-access';

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

export const isProductOutOfStock = (product: ProductEntity): boolean =>
    product.quantity < MINIMUM_INVENTORY_FOR_SALE;

export const getProductStockBadgeTone = (
    product: ProductEntity
): 'neutral' | 'warning' | 'danger' => {
    const state = getProductCardState(product);
    if (state === 'danger') return 'danger';
    if (state === 'warning') return 'warning';
    return 'neutral';
};

export const getProductStockLabel = (
    product: ProductEntity,
    labels?: {
        inStock?: string;
        lowStock?: string;
        outOfStock?: string;
        leftSuffix?: string;
    }
): string => {
    const unit = String(product.unitOfMeasure || '').toLowerCase();
    const quantity =
        unit === EACH
            ? `${product.quantity}`
            : `${Number(product.quantity || 0).toFixed(2)}`;
    const inStock = labels?.inStock || 'In stock';
    const lowStock = labels?.lowStock || 'Low stock';
    const outOfStock = labels?.outOfStock || 'Out of stock';
    const leftSuffix = labels?.leftSuffix || 'left';

    if (isProductOutOfStock(product)) {
        return outOfStock;
    }

    if (getProductCardState(product) === 'warning') {
        return `${lowStock} • ${quantity} ${leftSuffix}`;
    }

    return `${inStock} • ${quantity}`;
};
