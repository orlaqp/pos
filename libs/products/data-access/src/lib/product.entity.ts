import { BrandEntity } from '@pos/brands/data-access';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { CategoryEntity } from '@pos/categories/data-access';
import { UnitOfMeasureEntity } from '@pos/unit-of-measures/data-access';

export type ProductEntity = {
    id?: string;
    name: string;
    description?: string;
    price: number;
    tags?: string;
    cost?: number;
    barcode?: string;
    sku?: string;
    trackStock: boolean;
    picture?: string;
    category: CategoryEntity;
    unitOfMeasure?: UnitOfMeasureEntity;
    brand?: BrandEntity;
    createdAt?: string | null | undefined;
    updatedAt?: string | null | undefined;
};