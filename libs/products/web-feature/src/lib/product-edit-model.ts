import type { ProductCatalogChange } from '@pos/admin/data-access';
import type { ProductEntity } from '@pos/products/data-access/entities';

export type CatalogOption = {
    id: string;
    name: string;
};

export type ProductFormState = {
    name: string;
    description: string;
    cost: string;
    price: string;
    barcode: string;
    sku: string;
    plu: string;
    unitOfMeasure: string;
    quantity: string;
    reorderPoint: string;
    reorderQuantity: string;
    productCategoryId: string;
    productBrandId: string;
    isActive: boolean;
    isEBTEligible: boolean;
    trackStock: boolean;
};

export type ProductFormUpdate = (key: keyof ProductFormState, value: string | boolean) => void;

const emptyToNull = (value: string) => {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
};

const numberOrNull = (value: string) => {
    const trimmed = value.trim();
    return trimmed.length ? Number(trimmed) : null;
};

const numberOrZero = (value: string) => Number(value || 0);

export const toEntityOptions = (items: Array<{ id?: string; name: string }>) =>
    items
        .filter((item) => Boolean(item.id))
        .map((item) => ({ id: item.id || '', name: item.name }));

export const toUnitOptions = (units: Array<{ name: string }>) =>
    units.map((unit) => ({ id: unit.name, name: unit.name }));

export const buildInitialState = (product: ProductEntity): ProductFormState => ({
    name: product.name,
    description: product.description || '',
    cost: product.cost == null ? '' : String(product.cost),
    price: String(product.price),
    barcode: product.barcode || '',
    sku: product.sku || '',
    plu: product.plu || '',
    unitOfMeasure: product.unitOfMeasure,
    quantity: String(product.quantity),
    reorderPoint: product.reorderPoint == null ? '' : String(product.reorderPoint),
    reorderQuantity: product.reorderQuantity == null ? '' : String(product.reorderQuantity),
    productCategoryId: product.productCategoryId || '',
    productBrandId: product.productBrandId || '',
    isActive: product.isActive,
    isEBTEligible: Boolean(product.isEBTEligible),
    trackStock: product.trackStock,
});

export const buildChange = (
    product: ProductEntity,
    state: ProductFormState
): ProductCatalogChange => ({
    productId: product.id,
    name: state.name.trim(),
    description: emptyToNull(state.description),
    cost: numberOrNull(state.cost),
    price: numberOrZero(state.price),
    barcode: emptyToNull(state.barcode),
    sku: emptyToNull(state.sku),
    plu: emptyToNull(state.plu),
    unitOfMeasure: state.unitOfMeasure.trim() || product.unitOfMeasure,
    quantity: numberOrZero(state.quantity),
    trackStock: state.trackStock,
    reorderPoint: numberOrNull(state.reorderPoint),
    reorderQuantity: numberOrNull(state.reorderQuantity),
    productCategoryId: emptyToNull(state.productCategoryId),
    productBrandId: emptyToNull(state.productBrandId),
    isActive: state.isActive,
    isEBTEligible: state.isEBTEligible,
});
