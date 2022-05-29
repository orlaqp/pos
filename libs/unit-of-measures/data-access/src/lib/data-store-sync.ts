import { sortListBy } from '@pos/shared/utils';
import { DataStore } from 'aws-amplify';
import { Dispatch } from '@reduxjs/toolkit';
import { UnitOfMeasure } from '@pos/shared/models';
import { unitOfMeasuresActions } from './slices/unit-of-measures.slice';
import { UnitOfMeasureEntityMapper } from './unit-of-measure.entity';

export const syncUnitOfMeasures = (dispatch: Dispatch) => {
    console.log('Syncing unit of measures to the store');
    DataStore.query(UnitOfMeasure).then((ums) => updateStore(dispatch, ums));
};

export const subscribeToUnitOfMeasureChanges = (dispatch: Dispatch) => {
    return DataStore.observeQuery(UnitOfMeasure).subscribe(
        ({ isSynced, items }) => {
            if (isSynced) {
                console.log('Unit of measure changes detected');
                updateStore(dispatch, items);
            }
        }
    );
};

const updateStore = (dispatch: Dispatch, items: UnitOfMeasure[]) => {
    sortListBy(items, 'name');
    dispatch(
        unitOfMeasuresActions.setAll(
            items.map((u) => UnitOfMeasureEntityMapper.fromModel(u))
        )
    );
};
