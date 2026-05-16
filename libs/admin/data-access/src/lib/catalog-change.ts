import type { ProductEntity } from '../../../../products/data-access/src/lib/product.entity';
import type { CatalogChangePreview, ProductCatalogChange } from './admin-types';

const moneyValue = (value: number | null | undefined) =>
    value == null ? 'Not set' : `$${value.toFixed(2)}`;

const numberValue = (value: number | null | undefined) =>
    value == null ? 'Not set' : String(value);

const textValue = (value: string | null | undefined) => value || 'Not set';

const statusValue = (value: boolean) => (value ? 'Active' : 'Inactive');

const yesNoValue = (value: boolean | null | undefined) => (value ? 'Yes' : 'No');

export const buildProductChangePreview = (
    product: ProductEntity,
    change: ProductCatalogChange
): CatalogChangePreview => ({
    entityName: product.name,
    fields: [
        {
            label: 'Name',
            before: product.name,
            after: change.name,
        },
        {
            label: 'Description',
            before: textValue(product.description),
            after: textValue(change.description),
        },
        {
            label: 'Cost',
            before: moneyValue(product.cost),
            after: moneyValue(change.cost),
        },
        {
            label: 'Price',
            before: moneyValue(product.price),
            after: moneyValue(change.price),
        },
        {
            label: 'Barcode',
            before: textValue(product.barcode),
            after: textValue(change.barcode),
        },
        {
            label: 'SKU',
            before: textValue(product.sku),
            after: textValue(change.sku),
        },
        {
            label: 'PLU',
            before: textValue(product.plu),
            after: textValue(change.plu),
        },
        {
            label: 'Unit',
            before: product.unitOfMeasure,
            after: change.unitOfMeasure,
        },
        {
            label: 'Quantity',
            before: numberValue(product.quantity),
            after: numberValue(change.quantity),
        },
        {
            label: 'Track Stock',
            before: yesNoValue(product.trackStock),
            after: yesNoValue(change.trackStock),
        },
        {
            label: 'Reorder Point',
            before: numberValue(product.reorderPoint),
            after: numberValue(change.reorderPoint),
        },
        {
            label: 'Reorder Quantity',
            before: numberValue(product.reorderQuantity),
            after: numberValue(change.reorderQuantity),
        },
        {
            label: 'Category',
            before: textValue(product.productCategoryId),
            after: textValue(change.productCategoryId),
        },
        {
            label: 'Brand',
            before: textValue(product.productBrandId),
            after: textValue(change.productBrandId),
        },
        {
            label: 'Status',
            before: statusValue(product.isActive),
            after: statusValue(change.isActive),
        },
        {
            label: 'EBT Eligible',
            before: yesNoValue(product.isEBTEligible),
            after: yesNoValue(change.isEBTEligible),
        },
    ].filter((field) => field.before !== field.after),
});

export const applyProductCatalogChange = (
    products: ProductEntity[],
    change: ProductCatalogChange
) =>
    products.map((product) =>
        product.id === change.productId
            ? {
                  ...product,
                  name: change.name,
                  description: change.description,
                  cost: change.cost,
                  price: change.price,
                  barcode: change.barcode,
                  sku: change.sku,
                  plu: change.plu,
                  unitOfMeasure: change.unitOfMeasure,
                  quantity: change.quantity,
                  trackStock: change.trackStock,
                  reorderPoint: change.reorderPoint,
                  reorderQuantity: change.reorderQuantity,
                  productCategoryId: change.productCategoryId,
                  productBrandId: change.productBrandId,
                  isActive: change.isActive,
                  isEBTEligible: change.isEBTEligible,
              }
            : product
    );
