export type ProductEntity = {
    id?: string,

    description?: string;
    price?: number;
    tags?: string;
    cost: number;
    barcode: string;
    sku?: string;
    trackStock: boolean;
    isActive: boolean;
    category: object;
    unitOfMeasure: object;
    brand: object;

    createdAt?: string | null | undefined,
    updatedAt?: string | null | undefined,
};