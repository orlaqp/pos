import { DataStore } from 'aws-amplify';
import { Dispatch } from '@reduxjs/toolkit';
import { UnitOfMeasure } from '@pos/shared/models';
import { unitOfMeasuresActions } from './slices/unit-of-measures.slice';
import { UnitOfMeasureEntityMapper } from './unit-of-measure.entity';

export const syncUnitOfMeasures = (dispatch: Dispatch) => {
    console.log('Syncing unit of measures to the store');
    DataStore.query(UnitOfMeasure).then((ums) =>
        dispatch(unitOfMeasuresActions.setAll(
            ums.map((u) => UnitOfMeasureEntityMapper.fromModel(u))
        ))
    );
};
