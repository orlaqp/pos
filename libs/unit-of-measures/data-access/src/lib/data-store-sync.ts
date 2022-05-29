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

const updateStore = (dispatch: Dispatch, items: Category[]) => {
    items.sort((a, b) => {
        if (a.name > b.name) return 1;
        if (a.name < b.name) return -1;

        return 0;
    });
    dispatch(
        unitOfMeasuresActions.setAll(
            items.map((u) => UnitOfMeasureEntityMapper.fromModel(u))
        )
    );
};
