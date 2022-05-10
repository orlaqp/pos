
import { Product } from '@pos/shared/models';
import { AssetsService } from '@pos/shared/ui-native';
import { Dispatch } from '@reduxjs/toolkit';
import { DataStore } from 'aws-amplify';
import { productsActions, ProductEntity } from './slices/products.slice';

export class ProductService {
    static async save(dispatch: Dispatch<any>, product: ProductEntity) {
        if (!product.id) {
            const entity = new Product(product);
            await DataStore.save(entity);
            return dispatch(productsActions.add(entity));
        }
        
        const cat = await DataStore.query(Product, product.id);

        if (!cat) {
            return console.log(`It seems that product: ${product.id} has been removed`);
        }

        await DataStore.save(
            Product.copyOf(cat, updated => {
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
