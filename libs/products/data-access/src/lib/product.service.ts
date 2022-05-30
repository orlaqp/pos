import { Product } from '@pos/shared/models';
import { Dispatch } from '@reduxjs/toolkit';
import { DataStore } from 'aws-amplify';
import { productsActions } from './slices/products.slice';
import { ProductEntity } from './product.entity';
import { Alert } from 'react-native';

export interface ProductSearchRequest {
    text?: string;
    categoryId?: string;
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
            })
        );

        dispatch(productsActions.update({ id: product.id, changes: product }));

        return true;
    }

    static getAll() {
        try {
            return DataStore.query(Product);
        } catch (error) {
            console.error('error querying produtcs', error);
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
        request: ProductSearchRequest
    ): ProductSearchResponse {
        if (request.categoryId)
            return {
                items: products.filter(
                    (p) => p.productCategoryId === request.categoryId
                ),
                allNumbers: false,
            };

        if (!request.text) {
            return {
                items: products,
                allNumbers: false,
            };
        }

        const allNumbers = !!request.text?.match(/^\d*$/);
        const len12 = request.text.length === 12;
        const couldBeScaleBarcode = allNumbers && len12;

        if (couldBeScaleBarcode) {
            // Samples
            // 2 1030 5 02745 3
            // 2 1030 5 08415 9
            // 2 1030 2 26640 4
            const plu = request.text.substring(1, 5);
            const prod = products.find((p) => p.plu === plu);

            if (prod) {
                const totalPrice = +request.text.substring(6, 11);
                const quantity = totalPrice / 100 / prod.price; 

                return {
                    items: [prod],
                    allNumbers: true,
                    price: totalPrice,
                    quantity
                };
            }
        }

        if (allNumbers && request.text.length > 3) {
            return {
                items: products.filter(
                    (p) =>
                        p.sku?.indexOf(request.text!) !== -1 ||
                        p.barcode?.indexOf(request.text!) !== -1
                ),
                allNumbers,
            };
        }

        const lower = request.text.toLowerCase();

        return {
            items: products.filter(
                (p) =>
                    p.sku?.toLowerCase().indexOf(lower) !== -1 ||
                    p.barcode?.toLowerCase().indexOf(lower) !== -1 ||
                    p.description?.toLowerCase().indexOf(lower) !== -1 ||
                    p.name.toLowerCase().indexOf(lower) !== -1
            ),
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
