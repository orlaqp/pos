import { CategoryEntity } from '@pos/categories/data-access';
import { ProductEntity } from '@pos/products/data-access';
import { ProductService } from '@pos/products/data-access';
import { EACH } from '@pos/unit-of-measures/data-access';

type Dictionary<T> = Record<string, T | undefined>;

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

export const getBrowseModeProducts = (
    allProducts: ProductEntity[],
    browseMode: 'idle' | 'all' | 'category',
    activeCategory?: CategoryEntity
): ProductEntity[] => {
    if (browseMode === 'all') {
        return getActiveProducts(allProducts);
    }

    if (browseMode === 'category') {
        return getCategoryFilteredProducts(allProducts, activeCategory);
    }

    return [];
};

export const getVisibleProducts = (
    allProducts: ProductEntity[],
    browseMode: 'idle' | 'all' | 'category',
    activeCategory: CategoryEntity | undefined,
    searchText: string | undefined
): ProductEntity[] => {
    const normalizedSearchText = searchText?.trim();
    if (normalizedSearchText) {
        return ProductService.search(allProducts, {
            text: normalizedSearchText,
            onlyActive: true,
        }).items;
    }

    return getBrowseModeProducts(allProducts, browseMode, activeCategory);
};

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
