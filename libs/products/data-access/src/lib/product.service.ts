import { Product } from '@pos/shared/models';
import { Dispatch } from '@reduxjs/toolkit';
import { DataStore } from 'aws-amplify';
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
    static async save(
        dispatch: Dispatch<any>,
        product: ProductEntity
    ): Promise<boolean> {
        const validationRes = await validateNameBarcodeAndSku(product);

        if (!validationRes) return false;

        if (!product.id) {
            if (!validationRes) return false;

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

        if (!text) {
            return {
                items: products,
                allNumbers: false,
            };
        }

        const allNumbers = !!text?.match(/^\d*$/);
        // ex: 206110115089
        if (allNumbers && text.length > 11) {
            const plu = text.substring(2, 6);
            const prod = products.find((p) => {
                return onlyActive
                    ? p.isActive && p.plu === plu
                    : p.plu === plu;
            });

            if (prod) {
                const totalPrice = +text.substring(7, 11);
                const quantity = totalPrice / 100 / prod.price; 

                return {
                    items: [prod],
                    allNumbers: true,
                    price: totalPrice,
                    quantity
                };
            }
        }

        if (allNumbers && text.length > 3) {
            const items = products.filter(
                (p) => {
                    return onlyActive 
                        ? p.isActive && ((p.barcode && p.barcode === text!) || (p.sku && p.sku === text!))
                        : (p.barcode && p.barcode === text!) || (p.sku && p.sku === text!);
                }
            );

            return {
                items,
                allNumbers,
            };
        }

        const lower = text.toLowerCase();

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
        return DataStore.query(Product, (x) =>
            x.or((p) => p.barcode('eq', code).sku('eq', code))
        );
    }
}

async function validateNameBarcodeAndSku(
    product: ProductEntity
): Promise<boolean> {
    const withSameName = await DataStore.query(Product, (p) =>
        p.name('eq', product.name)
    );

    if (withSameName.length && product.id !== withSameName[0].id) {
        Alert.alert('A product with same name already exist');
        return false;
    }

    if (product.barcode) {
        const withSameBarcode = await DataStore.query(Product, (p) =>
            p.barcode('eq', product.barcode!).id('ne', product.id)
        );

        if (withSameBarcode.length) {
            Alert.alert('A product with same barcode already exist');
            return false;
        }
    }

    if (product.sku) {
        const withSameSku = await DataStore.query(Product, (p) =>
            p.sku('eq', product.sku!).id('ne', product.id)
        );

        if (withSameSku.length) {
            Alert.alert('A product with same sku already exist');
            return false;
        }
    }

    if (product.plu) {
        const withSamePlu = await DataStore.query(Product, (p) =>
            p.plu('eq', product.plu!).id('ne', product.id)
        );

        if (withSamePlu.length) {
            Alert.alert('A product with same plu already exist');
            return false;
        }
    }

    return true;
}
