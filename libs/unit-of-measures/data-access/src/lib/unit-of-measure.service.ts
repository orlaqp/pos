
import { UnitOfMeasure } from '@pos/shared/models';
import { AssetsService } from '@pos/shared/ui-native';
import { Dispatch } from '@reduxjs/toolkit';
import { DataStore } from 'aws-amplify';
import { unitOfMeasuresActions, UnitOfMeasureEntity } from './slices/unit-of-measures.slice';

export class UnitOfMeasureService {
    static async save(dispatch: Dispatch<any>, unitOfMeasure: UnitOfMeasureEntity) {
        if (!unitOfMeasure.id) {
            const entity = new UnitOfMeasure(unitOfMeasure);
            await DataStore.save(entity);
            return dispatch(unitOfMeasuresActions.add(entity));
        }
        
        const cat = await DataStore.query(UnitOfMeasure, unitOfMeasure.id);

        if (!cat) {
            return console.log(`It seems that unitOfMeasure: ${unitOfMeasure.id} has been removed`);
        }

        await DataStore.save(
            UnitOfMeasure.copyOf(cat, updated => {
                // TODO: Update unitOfMeasure properties here
            })
        );
        
        return dispatch(unitOfMeasuresActions.update({ id: unitOfMeasure.id, changes: unitOfMeasure }));
    }

    static getAll() {
        return DataStore.query(UnitOfMeasure);
    }

    static async delete(id: string) {
        const item = await DataStore.query(UnitOfMeasure, id);
        if (!item)
            return console.error(`UnitOfMeasure Id: ${id} not found`);
        
        // TODO: Do any extra cleanup here like for example remove image
        // if (item.picture)
        //     AssetsService.deleteAsset(item.picture);

        return DataStore.delete(item);
    }
}
