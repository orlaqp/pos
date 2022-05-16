import { UnitOfMeasureEntityMapper, unitOfMeasuresActions } from '@pos/unit-of-measures/data-access';
import { UnitOfMeasure } from '@pos/shared/models';
import { Dispatch } from '@reduxjs/toolkit';
import { DataStore } from 'aws-amplify';

export const observeUnitOfMeasureChanges = (dispatch: Dispatch) => {
    DataStore.observeQuery(UnitOfMeasure).subscribe(({ isSynced, items }) => {
        if (isSynced) {
            items.sort((a, b) => {
                if (a.name > b.name) return 1;
                if (a.name < b.name) return -1;

                return 0;
            })
            dispatch(unitOfMeasuresActions.setAll(
                items
                    .map(i => UnitOfMeasureEntityMapper.fromModel(i))
            ));
        }
    });
}