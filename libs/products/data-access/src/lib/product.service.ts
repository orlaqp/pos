import { Product } from '@pos/shared/models';
import { Dispatch } from '@reduxjs/toolkit';
import { DataStore } from '@pos/shared/amplify';
import { productsActions } from './slices/products.slice';
import { ProductEntity } from './product.entity';
import { Alert } from 'react-native';

export interface ProductSearchRequest {
    text?: string;
    categoryId?: string;
    onlyActive?: boolean;
}

export interface ProductSearchResponse {
    items: ProductEntity[];
    allNumbers: boolean;
    price?: number;
    quantity?: number;
}

export class ProductService {
    private static matchesBarcodeOrSku(
        product: ProductEntity,
        code: string
    ): boolean {
        return (
            (!!product.barcode && product.barcode === code) ||
            (!!product.sku && product.sku === code)
        );
    }

    private static findByBarcodeOrSku(
        products: ProductEntity[],
        code: string,
        onlyActive: boolean
    ): ProductEntity[] {
        return products.filter((p) =>
            onlyActive
                ? p.isActive && ProductService.matchesBarcodeOrSku(p, code)
                : ProductService.matchesBarcodeOrSku(p, code)
        );
    }

    private static findByEmbeddedNumericCode(
        products: ProductEntity[],
        candidate: string,
        onlyActive: boolean
    ): ProductEntity[] {
        const isNumericCode = (code?: string): boolean =>
            !!code && /^\d{4,}$/.test(code);

        return products.filter((p) => {
            if (onlyActive && !p.isActive) return false;

            const barcode = p.barcode || '';
            const sku = p.sku || '';
            const barcodeMatches =
                isNumericCode(barcode) && candidate.includes(barcode);
            const skuMatches = isNumericCode(sku) && candidate.includes(sku);

            return barcodeMatches || skuMatches;
        });
    }

    static async save(
        dispatch: Dispatch<any>,
        product: ProductEntity
    ): Promise<boolean> {
        const validationRes = await validateNameBarcodeAndSku(product);

        if (!validationRes) return false;

        if (!product.id) {
            if (!validationRes) return false;
            product.isEBTEligible = product.isEBTEligible ?? false;

            const entity = new Product(product);
            const res = await DataStore.save(entity);

            product.id = res.id;

            dispatch(productsActions.add(product));

            return true;
        }

        const existing = await DataStore.query(Product, product.id);

        if (!existing) {
            console.log(
                `It seems that product: ${product.id} has been removed`
            );

            return false;
        }

        await DataStore.save(
            Product.copyOf(existing, (updated) => {
                updated.name = product?.name;
                updated.description = product?.description;
                updated.price = product?.price;
                updated.tags = product?.tags;
                updated.cost = product?.cost;
                updated.barcode = product?.barcode;
                updated.sku = product?.sku;
                updated.plu = product?.plu;
                updated.unitOfMeasure = product?.unitOfMeasure;
                updated.trackStock = product?.trackStock;
                updated.reorderPoint = product?.reorderPoint;
                updated.reorderQuantity = product?.reorderQuantity;
                updated.picture = product?.picture;
                updated.productCategoryId = product?.productCategoryId;
                updated.productBrandId = product?.productBrandId;
                updated.isActive = product.isActive;
                updated.isEBTEligible = product.isEBTEligible ?? false;
            })
        );

        dispatch(productsActions.update({ id: product.id, changes: product }));

        return true;
    }

    static getAll() {
        try {
            return DataStore.query(Product);
        } catch (error) {
            console.error('error querying products', error);
            return [];
        }
    }

    static async delete(id: string) {
        const item = await DataStore.query(Product, id);
        if (!item) return console.error(`Product Id: ${id} not found`);

        // TODO: Do any extra cleanup here like for example remove image
        // if (item.picture)
        //     AssetsService.deleteAsset(item.picture);

        return DataStore.delete(item);
    }

    static search(
        products: ProductEntity[],
        { categoryId, text, onlyActive = false }: ProductSearchRequest,
    ): ProductSearchResponse {
        const normalizedText = (text || '').replace(/[\r\n\t]/g, '').trim();

        if (categoryId)
            return {
                items: products.filter(
                    (p) => {
                        return onlyActive
                            ? p.isActive && p.productCategoryId === categoryId
                            : p.productCategoryId === categoryId;
                    }
                ),
                allNumbers: false,
            };

        if (!normalizedText) {
            return {
                items: products,
                allNumbers: false,
            };
        }

        const allNumbers = !!normalizedText.match(/^\d+$/);
        // ex: 206110115089
        if (allNumbers && normalizedText.length > 11) {
            // Toledo code
            // const plu = text.substring(2, 6);
            // DLP-300
            const plu = normalizedText.substring(2, 6);
            const prod = products.find((p) => {
                return onlyActive
                    ? p.isActive && p.plu === plu
                    : p.plu === plu;
            });

            if (prod) {
                // Toledo code
                // const totalPrice = +text.substring(7, 11);
                // DLP-300
                const totalPrice = +normalizedText.substring(7, 11);
                const quantity = totalPrice / 100 / prod.price; 

                return {
                    items: [prod],
                    allNumbers: true,
                    price: totalPrice,
                    quantity
                };
            }
        }

        if (allNumbers && normalizedText.length > 3) {
            const items = products.filter(
                (p) => {
                    return onlyActive 
                        ? p.isActive && ((p.barcode && p.barcode === normalizedText) || (p.sku && p.sku === normalizedText))
                        : (p.barcode && p.barcode === normalizedText) || (p.sku && p.sku === normalizedText);
                }
            );

            return {
                items,
                allNumbers,
            };
        }

        const numericMatches: string[] = normalizedText.match(/\d{4,}/g) ?? [];
        const numericCandidates = Array.from(
            new Set(
                numericMatches.sort(
                    (a, b) => b.length - a.length
                )
            )
        );

        for (const code of numericCandidates) {
            const exactItems = ProductService.findByBarcodeOrSku(
                products,
                code,
                onlyActive
            );

            if (exactItems.length > 0) {
                return {
                    items: exactItems,
                    allNumbers: true,
                };
            }

            const embeddedItems = ProductService.findByEmbeddedNumericCode(
                products,
                code,
                onlyActive
            );

            if (embeddedItems.length > 0) {
                return {
                    items: embeddedItems,
                    allNumbers: true,
                };
            }
        }

        const lower = normalizedText.toLowerCase();

        const filteredItems = products.filter(
            (p) => {
                return onlyActive
                    ?  p.isActive && (p.name.toLowerCase().indexOf(lower) !== -1 ||
                        (p.barcode && p.barcode?.toLowerCase().indexOf(lower) !== -1) ||
                        (p.sku && p.sku?.toLowerCase().indexOf(lower) !== -1) ||
                        (p.description && p.description?.toLowerCase().indexOf(lower) !== -1))
                    : p.name.toLowerCase().indexOf(lower) !== -1 ||
                        (p.barcode && p.barcode?.toLowerCase().indexOf(lower) !== -1) ||
                        (p.sku && p.sku?.toLowerCase().indexOf(lower) !== -1) ||
                        (p.description && p.description?.toLowerCase().indexOf(lower) !== -1);
            }
                
        );

        return {
            items: filteredItems,
            allNumbers: false,
        };
    }

    static async searchByCode(code: string) {
        const items = await DataStore.query(Product);
        return items.filter((item) => item.barcode === code || item.sku === code);
    }
}

async function validateNameBarcodeAndSku(
    product: ProductEntity
): Promise<boolean> {
    const normalize = (value: string | null | undefined) =>
        (value || '').trim().toLowerCase();

    const existing = product.id ? await DataStore.query(Product, product.id) : undefined;
    const isEdit = !!existing;

    const normalizedName = (product.name || '').trim().toLowerCase();
    const nameChanged = !isEdit || normalize(existing?.name) !== normalizedName;
    const allProducts = await DataStore.query(Product);
    const withSameName = allProducts.find((p) => {
        if (p.id === product.id) return false;
        return (p.name || '').trim().toLowerCase() === normalizedName;
    });

    if (nameChanged && withSameName) {
        Alert.alert('A product with same name already exist');
        return false;
    }

        const barcodeChanged = !isEdit || normalize(existing?.barcode) !== normalize(product.barcode);
        if (product.barcode && barcodeChanged) {
            const withSameBarcode = allProducts.filter(
                (p) => p.id !== product.id && p.barcode === product.barcode
            );

        if (withSameBarcode.length) {
            Alert.alert('A product with same barcode already exist');
            return false;
        }
    }

        const skuChanged = !isEdit || normalize(existing?.sku) !== normalize(product.sku);
        if (product.sku && skuChanged) {
            const withSameSku = allProducts.filter(
                (p) => p.id !== product.id && p.sku === product.sku
            );

        if (withSameSku.length) {
            Alert.alert('A product with same sku already exist');
            return false;
        }
    }

        const pluChanged = !isEdit || normalize(existing?.plu) !== normalize(product.plu);
        if (product.plu && pluChanged) {
            const withSamePlu = allProducts.filter(
                (p) => p.id !== product.id && p.plu === product.plu
            );

        if (withSamePlu.length) {
            Alert.alert('A product with same plu already exist');
            return false;
        }
    }

    return true;
}
