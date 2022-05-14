import { BrandEntity } from '@pos/brands/data-access';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { CategoryEntity } from '@pos/categories/data-access';
import { UnitOfMeasureEntity } from '@pos/unit-of-measures/data-access';

export type ProductEntity = {
    id?: string;
    name: string;
    description: string | null | undefined;
    price: number;
    tags: string | null | undefined;
    cost: number | null | undefined;
    barcode: string | null | undefined;
    sku?: string | null | undefined;
    trackStock: boolean;
    picture: string | null | undefined;
    productCategoryId: string | null | undefined;
    productUnitOfMeasureId: string | null | undefined;
    productBrandId: string | null | undefined;
    createdAt?: string | null | undefined;
    updatedAt?: string | null | undefined;
};