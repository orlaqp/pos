import { Product } from '@pos/shared/models';
// eslint-disable-next-line @nx/enforce-module-boundaries
export type ProductEntity = {
    id: string;
    name: string;
    description: string | null | undefined;
    price: number;
    tags: string | null | undefined;
    cost: number | null | undefined;
    barcode: string | null | undefined;
    unitOfMeasure: string;
    sku?: string | null | undefined;
    plu?: string | null | undefined;
    quantity: number;
    trackStock: boolean;
    reorderPoint: number | null | undefined;
    reorderQuantity: number | null | undefined;
    picture: string | null | undefined;
    productCategoryId: string | null | undefined;
    productBrandId: string | null | undefined;
    discountable?: boolean;
    taxable?: boolean;
    minAllowedPrice: number | null | undefined;
    maxManualDiscountPercent: number | null | undefined;
    maxManualDiscountAmount: number | null | undefined;
    createdAt?: string | null | undefined;
    updatedAt?: string | null | undefined;
    isActive: boolean;
    isEBTEligible?: boolean | null | undefined;
};

export class ProductEntityMapper {
    static fromProduct(p: Product): ProductEntity {
        return {
            id: p.id,
            name: p.name,
            description: p.description,
            price: p.price,
            tags: p.tags,
            cost: p.cost,
            barcode: p.barcode,
            sku: p.sku,
            plu: p.plu,
            quantity: p.quantity,
            unitOfMeasure: p.unitOfMeasure,
            trackStock: p.trackStock,
            reorderPoint: p.reorderPoint,
            reorderQuantity: p.reorderQuantity,
            picture: p.picture,
            productCategoryId: p.productCategoryId,
            productBrandId: p.productBrandId,
            discountable: p.discountable ?? true,
            taxable: p.taxable ?? false,
            minAllowedPrice: p.minAllowedPrice,
            maxManualDiscountPercent: p.maxManualDiscountPercent,
            maxManualDiscountAmount: p.maxManualDiscountAmount,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
            isActive: p.isActive,
            isEBTEligible: p.isEBTEligible ?? false,
        }
    }
}
