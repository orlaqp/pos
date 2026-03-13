import { CategoryEntity } from '@pos/categories/data-access';
import { ProductEntity } from '@pos/products/data-access';
import { EACH } from '@pos/unit-of-measures/data-access';
import { Dictionary } from '@reduxjs/toolkit';

export const getActiveProducts = (products: ProductEntity[]): ProductEntity[] =>
    products.filter((p) => p.isActive);

export const getCategoryFilteredProducts = (
    allProducts: ProductEntity[],
    category?: CategoryEntity
): ProductEntity[] => {
    if (!category?.id) return getActiveProducts(allProducts);
    return allProducts.filter(
        (p) => p.isActive && p.productCategoryId === category.id
    );
};

export const shouldSetFilteredProducts = (
    searchText: string,
    allNumbers: boolean
): boolean => !allNumbers || (allNumbers && searchText.length < 4);

export const getAutoAddQuantity = (
    product: ProductEntity,
    quantity?: number
): number => quantity || (product.unitOfMeasure === EACH ? 1 : 0);

export const shouldBlockSelectionByInventory = (
    enforceSalesBasedOnInventory: boolean | undefined,
    quantity: number,
    minimumInventoryForSale: number
): boolean =>
    !!enforceSalesBasedOnInventory && quantity < minimumInventoryForSale;

export const getSelectedQuantity = (unitOfMeasure: string): number =>
    unitOfMeasure === EACH ? 1 : 0;

export const getSingleProductFromDictionary = (
    products?: Dictionary<ProductEntity>
): ProductEntity | undefined => {
    if (!products) return undefined;
    const productIds = Object.keys(products);
    if (productIds.length !== 1) return undefined;
    return products[productIds[0]] as ProductEntity | undefined;
};
