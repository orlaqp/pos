import { Product } from '@pos/shared/models';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
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
    createdAt?: string | null | undefined;
    updatedAt?: string | null | undefined;
    isActive: boolean;
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
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
            isActive: p.isActive
        }
    }
}