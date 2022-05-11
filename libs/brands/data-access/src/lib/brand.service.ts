
import { Brand } from '@pos/shared/models';
import { AssetsService } from '@pos/shared/ui-native';
import { Dispatch } from '@reduxjs/toolkit';
import { DataStore } from 'aws-amplify';
import { brandsActions, BrandEntity } from './slices/brands.slice';

export class BrandService {
    static async save(dispatch: Dispatch<any>, brand: BrandEntity) {
        if (!brand.id) {
            const entity = new Brand(brand);
            await DataStore.save(entity);
            return dispatch(brandsActions.add(entity));
        }
        
        const cat = await DataStore.query(Brand, brand.id);

        if (!cat) {
            return console.log(`It seems that brand: ${brand.id} has been removed`);
        }

        await DataStore.save(
            Brand.copyOf(cat, updated => {
                // TODO: Update brand properties here
            })
        );
        
        return dispatch(brandsActions.update({ id: brand.id, changes: brand }));
    }

    static getAll() {
        return DataStore.query(Brand);
    }

    static async delete(id: string) {
        const item = await DataStore.query(Brand, id);
        if (!item)
            return console.error(`Brand Id: ${id} not found`);
        
        // TODO: Do any extra cleanup here like for example remove image
        // if (item.picture)
        //     AssetsService.deleteAsset(item.picture);

        return DataStore.delete(item);
    }
}
