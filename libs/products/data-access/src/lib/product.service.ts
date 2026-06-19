import { Product } from '@pos/shared/models';
import { Dispatch } from '@reduxjs/toolkit';
import { DataStore } from '@pos/shared/amplify';
import { Alert } from 'react-native';
import { stampTenant } from '@pos/auth/data-access';
import { translateWithFallback } from '@pos/shared/utils';
import { productsActions } from './slices/products.slice';
import { ProductEntity } from './product.entity';

const isNotDeleted = (item: { _deleted?: boolean | null } | null | undefined) =>
    !!item && item._deleted !== true;

export interface ProductSearchRequest {
    text?: string;
    categoryId?: string;
    onlyActive?: boolean;
    scaleBarcodePriceFormat?: ScaleBarcodePriceFormat | null;
}

export interface ProductSearchResponse {
    items: ProductEntity[];
    allNumbers: boolean;
    price?: number;
    quantity?: number;
}

export type ScaleBarcodePriceFormat =
    | 'LEGACY_4_DIGIT_PRICE'
    | 'EAN13_02_5_PLU_5_PRICE';

type WeightedBarcodeCandidate = {
    format: ScaleBarcodePriceFormat;
    plu: string;
    totalPrice: number;
};

export class ProductService {
    private static getScaleBarcodePriceFormat(
        format?: ScaleBarcodePriceFormat | null
    ): ScaleBarcodePriceFormat {
        return format === 'EAN13_02_5_PLU_5_PRICE'
            ? 'EAN13_02_5_PLU_5_PRICE'
            : 'LEGACY_4_DIGIT_PRICE';
    }

    private static normalizePlu(plu?: string | null) {
        if (!plu) {
            return '';
        }

        return plu.replace(/^0+/, '') || '0';
    }

    private static getLegacyWeightedBarcodeCandidate(
        code: string
    ): WeightedBarcodeCandidate | null {
        if (code.length < 12) {
            return null;
        }

        return {
            format: 'LEGACY_4_DIGIT_PRICE',
            plu: ProductService.normalizePlu(code.substring(2, 6)),
            totalPrice: +code.substring(7, 11),
        };
    }

    private static getEan13FiveDigitWeightedBarcodeCandidate(
        code: string
    ): WeightedBarcodeCandidate | null {
        if (code.length < 13 || !code.startsWith('02')) {
            return null;
        }

        return {
            format: 'EAN13_02_5_PLU_5_PRICE',
            plu: ProductService.normalizePlu(code.substring(2, 7)),
            totalPrice: +code.substring(7, 12),
        };
    }

    private static getWeightedBarcodeCandidates(
        code: string,
        scaleBarcodePriceFormat?: ScaleBarcodePriceFormat | null
    ): WeightedBarcodeCandidate[] {
        const candidates: WeightedBarcodeCandidate[] = [];

        if (!/^\d+$/.test(code) || code.length <= 11) {
            return candidates;
        }

        const profile = ProductService.getScaleBarcodePriceFormat(
            scaleBarcodePriceFormat
        );
        const legacyCandidate =
            ProductService.getLegacyWeightedBarcodeCandidate(code);
        const ean13FiveDigitCandidate =
            ProductService.getEan13FiveDigitWeightedBarcodeCandidate(code);

        if (profile === 'EAN13_02_5_PLU_5_PRICE') {
            if (ean13FiveDigitCandidate) {
                candidates.push(ean13FiveDigitCandidate);
            }
            if (legacyCandidate) {
                candidates.push(legacyCandidate);
            }
        } else {
            if (legacyCandidate) {
                candidates.push(legacyCandidate);
            }
            if (ean13FiveDigitCandidate) {
                candidates.push(ean13FiveDigitCandidate);
            }
        }

        return candidates;
    }

    private static findWeightedBarcodeMatch(
        products: ProductEntity[],
        code: string,
        onlyActive: boolean,
        scaleBarcodePriceFormat?: ScaleBarcodePriceFormat | null
    ): ProductSearchResponse | null {
        const candidates = ProductService.getWeightedBarcodeCandidates(
            code,
            scaleBarcodePriceFormat
        );

        for (const candidate of candidates) {
            const prod = products.find((p) => {
                const matches = ProductService.normalizePlu(p.plu) === candidate.plu;
                return onlyActive ? p.isActive && matches : matches;
            });

            if (!prod) {
                continue;
            }

            if (!Number.isFinite(prod.price) || prod.price <= 0) {
                continue;
            }

            const quantity = candidate.totalPrice / 100 / prod.price;

            return {
                items: [prod],
                allNumbers: true,
                price: candidate.totalPrice,
                quantity,
            };
        }

        return null;
    }

    private static findWeightedBarcodeMatchInCandidate(
        products: ProductEntity[],
        code: string,
        onlyActive: boolean,
        scaleBarcodePriceFormat?: ScaleBarcodePriceFormat | null
    ): ProductSearchResponse | null {
        for (let start = 0; start <= code.length - 12; start += 1) {
            const weightedMatch = ProductService.findWeightedBarcodeMatch(
                products,
                code.slice(start),
                onlyActive,
                scaleBarcodePriceFormat
            );

            if (weightedMatch) {
                return weightedMatch;
            }
        }

        return null;
    }

    private static matchesBarcodeOrSku(
        product: ProductEntity,
        code: string
    ): boolean {
        return (
            (!!product.barcode && product.barcode === code) ||
            (!!product.sku && product.sku === code)
        );
    }

    private static matchesPlu(product: ProductEntity, code: string): boolean {
        return !!product.plu && product.plu === code;
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
            const normalizedProduct: ProductEntity = {
                ...product,
                quantity: 0,
                isEBTEligible: product.isEBTEligible ?? false,
                discountable: product.discountable ?? true,
            };

            const entity = new Product(stampTenant(normalizedProduct) as never);
            const res = await DataStore.save(entity);

            product.id = res.id;

            dispatch(
                productsActions.add({
                    ...normalizedProduct,
                    id: res.id,
                })
            );

            return true;
        }

        const existing = await DataStore.query(Product, product.id);

        if (!existing) {
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
                updated.discountable = product.discountable ?? true;
                updated.minAllowedPrice = product.minAllowedPrice;
                updated.maxManualDiscountPercent = product.maxManualDiscountPercent;
                updated.maxManualDiscountAmount = product.maxManualDiscountAmount;
            })
        );

        const { quantity: _quantity, ...catalogChanges } = product;
        dispatch(productsActions.update({ id: product.id, changes: catalogChanges }));

        return true;
    }

    static getAll() {
        try {
            return DataStore.query(Product).then((items) =>
                items.filter((item) => isNotDeleted(item as { _deleted?: boolean | null }))
            );
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
        {
            categoryId,
            text,
            onlyActive = false,
            scaleBarcodePriceFormat,
        }: ProductSearchRequest,
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
        if (allNumbers && normalizedText.length > 3) {
            const exactCodeItems = ProductService.findByBarcodeOrSku(
                products,
                normalizedText,
                onlyActive
            );

            if (exactCodeItems.length > 0) {
                return {
                    items: exactCodeItems,
                    allNumbers,
                };
            }
        }

        // ex: 206110115089
        if (allNumbers && normalizedText.length > 11) {
            const weightedMatch = ProductService.findWeightedBarcodeMatch(
                products,
                normalizedText,
                onlyActive,
                scaleBarcodePriceFormat
            );

            if (weightedMatch) {
                return weightedMatch;
            }
        }

        if (allNumbers && normalizedText.length > 3) {
            const items = products.filter(
                (p) => {
                    return onlyActive
                        ? p.isActive && ProductService.matchesPlu(p, normalizedText)
                        : ProductService.matchesPlu(p, normalizedText);
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
            const weightedMatch = ProductService.findWeightedBarcodeMatchInCandidate(
                products,
                code,
                onlyActive,
                scaleBarcodePriceFormat
            );

            if (weightedMatch) {
                return weightedMatch;
            }

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
                        (p.plu && p.plu?.toLowerCase().indexOf(lower) !== -1) ||
                        (p.description && p.description?.toLowerCase().indexOf(lower) !== -1))
                    : p.name.toLowerCase().indexOf(lower) !== -1 ||
                        (p.barcode && p.barcode?.toLowerCase().indexOf(lower) !== -1) ||
                        (p.sku && p.sku?.toLowerCase().indexOf(lower) !== -1) ||
                        (p.plu && p.plu?.toLowerCase().indexOf(lower) !== -1) ||
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
        Alert.alert(
            translateWithFallback(
                'PRODUCT_DuplicateName',
                'A product with same name already exist',
            ),
        );
        return false;
    }

        const barcodeChanged = !isEdit || normalize(existing?.barcode) !== normalize(product.barcode);
        if (product.barcode && barcodeChanged) {
            const withSameBarcode = allProducts.filter(
                (p) => p.id !== product.id && p.barcode === product.barcode
            );

        if (withSameBarcode.length) {
            Alert.alert(
                translateWithFallback(
                    'PRODUCT_DuplicateBarcode',
                    'A product with same barcode already exist',
                ),
            );
            return false;
        }
    }

        const skuChanged = !isEdit || normalize(existing?.sku) !== normalize(product.sku);
        if (product.sku && skuChanged) {
            const withSameSku = allProducts.filter(
                (p) => p.id !== product.id && p.sku === product.sku
            );

        if (withSameSku.length) {
            Alert.alert(
                translateWithFallback(
                    'PRODUCT_DuplicateSku',
                    'A product with same sku already exist',
                ),
            );
            return false;
        }
    }

        const pluChanged = !isEdit || normalize(existing?.plu) !== normalize(product.plu);
        if (product.plu && pluChanged) {
            const withSamePlu = allProducts.filter(
                (p) => p.id !== product.id && p.plu === product.plu
            );

        if (withSamePlu.length) {
            Alert.alert(
                translateWithFallback(
                    'PRODUCT_DuplicatePlu',
                    'A product with same plu already exist',
                ),
            );
            return false;
        }
    }

    return true;
}
