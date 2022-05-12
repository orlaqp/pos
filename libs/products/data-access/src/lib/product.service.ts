
import { Product } from '@pos/shared/models';
import { Dispatch } from '@reduxjs/toolkit';
import { DataStore } from 'aws-amplify';
import { productsActions } from './slices/products.slice';
import { ProductEntity } from './product.entity';

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
                // TODO: Update product properties here
            })
        );
        
        return dispatch(productsActions.update({ id: product.id, changes: product }));
    }

    static getAll() {
        return DataStore.query(Product);
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
}
