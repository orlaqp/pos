
import { Brand } from '@pos/shared/models';
import { Dispatch } from '@reduxjs/toolkit';
import { DataStore } from 'aws-amplify';
import { brandsActions } from './slices/brands.slice';
import { BrandEntity } from './brand.entity';

export class BrandService {
    static async save(dispatch: Dispatch<any>, brand: BrandEntity) {
        if (!brand.id) {
            const entity = new Brand(brand);
            const res = await DataStore.save(entity);
            
            brand.id = res.id;

            return dispatch(brandsActions.add(brand));
        }
        
        const existing = await DataStore.query(Brand, brand.id);

        if (!existing) {
            return console.log(`It seems that brand: ${brand.id} has been removed`);
        }

        await DataStore.save(
            Brand.copyOf(existing, updated => {
                updated.name = brand.name;
                updated.description = brand.description
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
