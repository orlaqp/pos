
import { Product } from '@pos/shared/models';
import { Dispatch } from '@reduxjs/toolkit';
import { DataStore } from 'aws-amplify';
import { productsActions } from './slices/products.slice';
import { ProductEntity } from './product.entity';

export interface SearchRequest {
    text?: string;
    categoryId?: string;
}

export class ProductService {
    static async save(dispatch: Dispatch<any>, product: ProductEntity) {
        if (!product.id) {
            const entity = new Product(product);
            const res = await DataStore.save(entity);

            product.id = res.id;

            return dispatch(productsActions.add(product));
        }
        
        const existing = await DataStore.query(Product, product.id);

        if (!existing) {
            return console.log(`It seems that product: ${product.id} has been removed`);
        }

        await DataStore.save(
            Product.copyOf(existing, updated => {
                updated.name = product?.name;
                updated.description = product?.description;
                updated.price = product?.price;
                updated.tags = product?.tags;
                updated.cost = product?.cost;
                updated.barcode = product?.barcode;
                updated.sku = product?.sku;
                updated.unitOfMeasure = product?.unitOfMeasure;
                updated.trackStock = product?.trackStock;
                updated.picture = product?.picture;
                updated.productCategoryId = product?.productCategoryId;
                updated.productBrandId = product?.productBrandId;
            })
        );
        
        return dispatch(productsActions.update({ id: product.id, changes: product }));
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
        if (!item)
            return console.error(`Product Id: ${id} not found`);
        
        // TODO: Do any extra cleanup here like for example remove image
        // if (item.picture)
        //     AssetsService.deleteAsset(item.picture);

        return DataStore.delete(item);
    }

    static async search(products: ProductEntity[], request: SearchRequest) {
        if (request.categoryId)
            return products.filter(p => p.productCategoryId === request.categoryId);

        if (!request.text) return products;

        const lower = request.text.toLowerCase();
        
        return products.filter(p => 
               p.sku?.toLowerCase().indexOf(lower) !== -1
            || p.barcode?.toLowerCase().indexOf(lower) !== -1
            || p.description?.toLowerCase().indexOf(lower) !== -1
            || p.name.toLowerCase().indexOf(lower) !== -1
        );
    }
}
