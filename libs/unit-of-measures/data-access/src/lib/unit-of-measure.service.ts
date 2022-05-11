
import { UnitOfMeasure } from '@pos/shared/models';
import { Dispatch } from '@reduxjs/toolkit';
import { DataStore } from 'aws-amplify';
import { unitOfMeasuresActions } from './slices/unit-of-measures.slice';
import { UnitOfMeasureEntity } from './unit-of-measure.entity';

export class UnitOfMeasureService {
    static async save(dispatch: Dispatch<any>, unitOfMeasure: UnitOfMeasureEntity) {
        if (!unitOfMeasure.id) {
            const entity = new UnitOfMeasure(unitOfMeasure);
            const res = await DataStore.save(entity);

            unitOfMeasure.id = res.id;

            return dispatch(unitOfMeasuresActions['add'](unitOfMeasure));
        }
        
        const existing = await DataStore.query(UnitOfMeasure, unitOfMeasure.id);

        if (!existing) {
            return console.log(`It seems that unitOfMeasure: ${unitOfMeasure.id} has been removed`);
        }

        await DataStore.save(
            UnitOfMeasure.copyOf(existing, updated => {
                updated.name = unitOfMeasure.name;
                updated.description = unitOfMeasure.description;
            })
        );
        
        return dispatch(unitOfMeasuresActions['update']({ id: unitOfMeasure.id, changes: unitOfMeasure }));
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
